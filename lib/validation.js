export function validateEmail(email) {
  if (!email || typeof email !== 'string') {
    return { valid: false, error: 'Email is required' }
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!emailRegex.test(email)) {
    return { valid: false, error: 'Invalid email format' }
  }

  if (email.length > 255) {
    return { valid: false, error: 'Email is too long' }
  }

  return { valid: true, email: email.toLowerCase().trim() }
}

export function validatePassword(password) {
  if (!password || typeof password !== 'string') {
    return { valid: false, error: 'Password is required' }
  }

  if (password.length < 8) {
    return { valid: false, error: 'Password must be at least 8 characters' }
  }

  if (password.length > 128) {
    return { valid: false, error: 'Password is too long' }
  }

  return { valid: true }
}

export function validateName(name) {
  if (!name || typeof name !== 'string') {
    return { valid: false, error: 'Name is required' }
  }

  const trimmedName = name.trim()

  if (trimmedName.length < 1) {
    return { valid: false, error: 'Name cannot be empty' }
  }

  if (trimmedName.length > 100) {
    return { valid: false, error: 'Name is too long' }
  }

  return { valid: true, name: trimmedName }
}

export function sanitizeInput(input, maxLength = 1000) {
  if (!input || typeof input !== 'string') {
    return ''
  }

  // Remove null bytes and trim
  return input.replace(/\0/g, '').trim().substring(0, maxLength)
}

export function validateVideoId(videoId) {
  if (!videoId) {
    return { valid: false, error: 'Video ID is required' }
  }

  // Check if it's a valid number or UUID-like string
  const id = parseInt(videoId, 10)
  if (isNaN(id) || id < 1) {
    return { valid: false, error: 'Invalid video ID' }
  }

  return { valid: true, videoId: id }
}

export function validateComment(content) {
  if (!content || typeof content !== 'string') {
    return { valid: false, error: 'Comment content is required' }
  }

  const trimmedContent = content.trim()

  if (trimmedContent.length < 1) {
    return { valid: false, error: 'Comment cannot be empty' }
  }

  if (trimmedContent.length > 5000) {
    return { valid: false, error: 'Comment is too long (max 5000 characters)' }
  }

  return { valid: true, content: trimmedContent }
}

export function validateYoutubeUrl(url) {
  if (!url || typeof url !== 'string') {
    return { valid: false, error: 'YouTube URL is required' }
  }

  const youtubeRegex = /^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.be)\/.+/
  if (!youtubeRegex.test(url)) {
    return { valid: false, error: 'Invalid YouTube URL' }
  }

  return { valid: true, url: url.trim() }
}
