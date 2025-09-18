// lib/database.js
import { PrismaClient } from '@prisma/client'

// Singleton pattern for Prisma client
const globalForPrisma = globalThis

export const prisma = globalForPrisma.prisma || new PrismaClient()

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma

// User Service Functions
export const userService = {
  // Create new user (for webhook)
  async createUser(userData) {
    try {
      const user = await prisma.user.create({
        data: {
          email: userData.email,
          name: userData.name,
          password: userData.password,
          role: userData.role || 'member',
          stripeCustomerId: userData.stripeCustomerId,
          stripeSubscriptionId: userData.stripeSubscriptionId,
          joinDate: userData.joinDate ? new Date(userData.joinDate) : new Date(),
          level: userData.level || 'newcomer',
          isActive: userData.isActive !== undefined ? userData.isActive : true
        }
      })
      return user
    } catch (error) {
      console.error('Error creating user:', error)
      throw error
    }
  },

  // Find user by email
  async findByEmail(email) {
    try {
      const user = await prisma.user.findUnique({
        where: { email }
      })
      return user
    } catch (error) {
      console.error('Error finding user by email:', error)
      throw error
    }
  },

  // Update user activity
  async updateLastLogin(userId) {
    try {
      await prisma.user.update({
        where: { id: userId },
        data: { lastLogin: new Date() }
      })
    } catch (error) {
      console.error('Error updating last login:', error)
    }
  },

  // Get user level info
  getUserLevel(joinDate) {
    const now = new Date()
    const joined = new Date(joinDate)
    const monthsActive = Math.floor((now - joined) / (1000 * 60 * 60 * 24 * 30))
    
    if (monthsActive < 3) return { level: 'newcomer', nextLevel: 'seeker', daysUntilNext: 90 - Math.floor((now - joined) / (1000 * 60 * 60 * 24)) }
    if (monthsActive < 6) return { level: 'seeker', nextLevel: 'explorer', daysUntilNext: 180 - Math.floor((now - joined) / (1000 * 60 * 60 * 24)) }
    if (monthsActive < 9) return { level: 'explorer', nextLevel: 'practitioner', daysUntilNext: 270 - Math.floor((now - joined) / (1000 * 60 * 60 * 24)) }
    return { level: 'practitioner', nextLevel: null, daysUntilNext: null }
  },

  // Deactivate user (for cancelled subscriptions)
  async deactivateUser(stripeSubscriptionId) {
    try {
      const user = await prisma.user.update({
        where: { stripeSubscriptionId },
        data: { isActive: false }
      })
      return user
    } catch (error) {
      console.error('Error deactivating user:', error)
      throw error
    }
  }
}

// Video Service Functions
export const videoService = {
  // Get all published videos
  async getAllVideos() {
    try {
      const videos = await prisma.video.findMany({
        where: { status: 'published' },
        orderBy: { uploadDate: 'desc' },
        include: {
          _count: {
            select: {
              comments: true,
              reactions: true
            }
          }
        }
      })
      return videos
    } catch (error) {
      console.error('Error fetching videos:', error)
      throw error
    }
  },

  // Get videos by category
  async getVideosByCategory(category) {
    try {
      const videos = await prisma.video.findMany({
        where: { 
          category,
          status: 'published' 
        },
        orderBy: { uploadDate: 'desc' },
        include: {
          _count: {
            select: {
              comments: true,
              reactions: true
            }
          }
        }
      })
      return videos
    } catch (error) {
      console.error('Error fetching videos by category:', error)
      throw error
    }
  },

  // Create new video (admin only)
  async createVideo(videoData) {
    try {
      // Extract YouTube ID from URL
      const youtubeId = extractYouTubeId(videoData.youtubeUrl)
      if (!youtubeId) {
        throw new Error('Invalid YouTube URL')
      }

      const video = await prisma.video.create({
        data: {
          title: videoData.title,
          description: videoData.description,
          youtubeUrl: videoData.youtubeUrl,
          youtubeId: youtubeId,
          category: videoData.category,
          duration: videoData.duration,
          thumbnailUrl: `https://img.youtube.com/vi/${youtubeId}/maxresdefault.jpg`,
          status: videoData.status || 'published'
        }
      })

      // Add activity log
      await activityService.createActivity({
        type: 'video_upload',
        title: 'New Video Added',
        description: `"${videoData.title}" was added to ${videoData.category}`,
        videoId: video.id
      })

      return video
    } catch (error) {
      console.error('Error creating video:', error)
      throw error
    }
  },

  // Update video
  async updateVideo(videoId, updateData) {
    try {
      if (updateData.youtubeUrl) {
        const youtubeId = extractYouTubeId(updateData.youtubeUrl)
        if (!youtubeId) {
          throw new Error('Invalid YouTube URL')
        }
        updateData.youtubeId = youtubeId
        updateData.thumbnailUrl = `https://img.youtube.com/vi/${youtubeId}/maxresdefault.jpg`
      }

      const video = await prisma.video.update({
        where: { id: videoId },
        data: updateData
      })
      return video
    } catch (error) {
      console.error('Error updating video:', error)
      throw error
    }
  },

  // Delete video
  async deleteVideo(videoId) {
    try {
      await prisma.video.delete({
        where: { id: videoId }
      })
      return true
    } catch (error) {
      console.error('Error deleting video:', error)
      throw error
    }
  },

  // Get video with comments
  async getVideoWithComments(videoId) {
    try {
      const video = await prisma.video.findUnique({
        where: { id: videoId },
        include: {
          comments: {
            include: {
              user: {
                select: { name: true, level: true }
              },
              replies: {
                include: {
                  user: {
                    select: { name: true, level: true }
                  }
                }
              }
            },
            orderBy: { createdAt: 'desc' }
          },
          reactions: {
            include: {
              user: {
                select: { name: true }
              }
            }
          }
        }
      })
      return video
    } catch (error) {
      console.error('Error fetching video with comments:', error)
      throw error
    }
  }
}

// Comment Service Functions
export const commentService = {
  // Add comment to video
  async addComment(commentData) {
    try {
      const comment = await prisma.comment.create({
        data: {
          content: commentData.content,
          videoId: commentData.videoId,
          userId: commentData.userId,
          parentId: commentData.parentId || null
        },
        include: {
          user: {
            select: { name: true, level: true }
          }
        }
      })

      // Add activity log
      await activityService.createActivity({
        type: 'comment',
        title: 'New Comment',
        description: `Comment added to video`,
        userId: commentData.userId,
        videoId: commentData.videoId
      })

      return comment
    } catch (error) {
      console.error('Error adding comment:', error)
      throw error
    }
  }
}

// Reaction Service Functions
export const reactionService = {
  // Toggle reaction on video
  async toggleReaction(reactionData) {
    try {
      const existing = await prisma.reaction.findUnique({
        where: {
          videoId_userId_type: {
            videoId: reactionData.videoId,
            userId: reactionData.userId,
            type: reactionData.type
          }
        }
      })

      if (existing) {
        // Remove reaction
        await prisma.reaction.delete({
          where: { id: existing.id }
        })
        return { action: 'removed' }
      } else {
        // Add reaction
        const reaction = await prisma.reaction.create({
          data: {
            type: reactionData.type,
            videoId: reactionData.videoId,
            userId: reactionData.userId
          }
        })
        return { action: 'added', reaction }
      }
    } catch (error) {
      console.error('Error toggling reaction:', error)
      throw error
    }
  }
}

// Activity Service Functions
export const activityService = {
  // Create activity log
  async createActivity(activityData) {
    try {
      const activity = await prisma.activity.create({
        data: {
          type: activityData.type,
          title: activityData.title,
          description: activityData.description,
          userId: activityData.userId || null,
          videoId: activityData.videoId || null,
          metadata: activityData.metadata || null
        }
      })
      return activity
    } catch (error) {
      console.error('Error creating activity:', error)
    }
  },

  // Get recent activities for feed
  async getRecentActivities(limit = 10) {
    try {
      const activities = await prisma.activity.findMany({
        take: limit,
        orderBy: { createdAt: 'desc' }
      })
      return activities
    } catch (error) {
      console.error('Error fetching activities:', error)
      return []
    }
  }
}

// Utility Functions
function extractYouTubeId(url) {
  const regex = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/
  const match = url.match(regex)
  return match ? match[1] : null
}