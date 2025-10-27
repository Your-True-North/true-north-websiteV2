/**
 * Simple logger utility that only logs in development mode
 * In production, logs are suppressed unless they're errors
 */

// Safe check for environment that works in both browser and server
const isDevelopment = typeof process !== 'undefined' 
  ? process.env.NODE_ENV !== 'production'
  : false

export const logger = {
  log: (...args: any[]) => {
    if (isDevelopment) {
      console.log(...args)
    }
  },

  info: (...args: any[]) => {
    if (isDevelopment) {
      console.info(...args)
    }
  },

  warn: (...args: any[]) => {
    console.warn(...args)
  },

  error: (...args: any[]) => {
    console.error(...args)
  },

  debug: (prefix: string, message: string, data?: any) => {
    if (isDevelopment) {
      if (data) {
        console.log(`[${prefix}] ${message}`, data)
      } else {
        console.log(`[${prefix}] ${message}`)
      }
    }
  }
}

export const serverLogger = {
  log: (...args: any[]) => {
    if (typeof window === 'undefined' && isDevelopment) {
      console.log(...args)
    }
  },

  error: (...args: any[]) => {
    if (typeof window === 'undefined') {
      console.error(...args)
    }
  }
}
