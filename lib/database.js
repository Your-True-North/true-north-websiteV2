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
