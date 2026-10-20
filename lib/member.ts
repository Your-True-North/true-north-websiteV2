import { getAuthUser } from './auth'

// The logged in member's id, from the auth_token cookie on the server.
// Never take a user id or email from the request body.
export function getMemberId(request: Request): string | null {
  const user = getAuthUser(request) as { userId?: string | number } | null
  return user?.userId ? String(user.userId) : null
}
