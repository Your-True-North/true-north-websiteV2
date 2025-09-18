// lib/database.js
import bcrypt from 'bcrypt'

export const userService = {
  async createUser(email, hashedPassword) {
    return {
      id: Date.now(),
      email,
      password: hashedPassword,
      createdAt: new Date(),
      isActive: true
    }
  },

  async findUserByEmail(email) {
    return null
  }
}

export const activityService = {
  async logActivity(userId, action, details) {
    console.log(`User ${userId}: ${action}`, details)
    return {
      id: Date.now(),
      userId,
      action,
      details,
      timestamp: new Date()
    }
  }
}

export const commentService = {
  async getComments(videoId) {
    return []
  },

  async createComment(videoId, userId, content) {
    return {
      id: Date.now(),
      videoId,
      userId,
      content,
      createdAt: new Date()
    }
  },

  async deleteComment(commentId) {
    return true
  }
}

export const reactionService = {
  async getReactions(videoId) {
    return []
  },

  async addReaction(videoId, userId, type) {
    return {
      id: Date.now(),
      videoId,
      userId,
      type,
      createdAt: new Date()
    }
  },

  async removeReaction(videoId, userId) {
    return true
  }
}

export const videoService = {
  async getAllVideos() {
    return []
  },

  async getVideoById(id) {
    return {
      id,
      title: "Sample Video",
      description: "Sample description",
      url: "",
      createdAt: new Date()
    }
  },

  async createVideo(title, description, url) {
    return {
      id: Date.now(),
      title,
      description,
      url,
      createdAt: new Date()
    }
  },

  async updateVideo(id, updates) {
    return {
      id,
      ...updates,
      updatedAt: new Date()
    }
  },

  async deleteVideo(id) {
    return true
  }
}
