import { App, cert, initializeApp } from 'firebase-admin/app'
import env from '#start/env'

export default class FCM {
  private static instance: App

  static getInstance(): App {
    const url = env.get('GOOGLE_APPLICATION_CREDENTIALS')

    if (!url) {
      throw new Error('Google credentials not found')
    }

    if (!FCM.instance) {
      FCM.instance = initializeApp({
        credential: cert(url),
        projectId: 'flixhub-f57be',
      })
    }

    return FCM.instance
  }
}
