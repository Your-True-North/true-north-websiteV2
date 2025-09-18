import admin from 'firebase-admin'

let app: admin.app.App | null = null

export function getAdminApp() {
  if (app) return app
  if (admin.apps.length) {
    app = admin.app()
    return app
  }
  const svc = process.env.FIREBASE_SERVICE_ACCOUNT_JSON
  const projectId = process.env.FIREBASE_PROJECT_ID
  if (!svc || !projectId) throw new Error('Missing Firebase env')
  const creds = JSON.parse(svc)
  app = admin.initializeApp({
    credential: admin.credential.cert({
      projectId,
      clientEmail: creds.client_email,
      privateKey: creds.private_key,
    }),
    projectId,
  })
  return app
}

export function getDb() {
  return getAdminApp().firestore()
}
