import * as admin from 'firebase-admin';

const projectId = process.env.FIREBASE_PROJECT_ID;
const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
const privateKeyEnv = process.env.FIREBASE_PRIVATE_KEY;

if (!projectId || !clientEmail || !privateKeyEnv) {
    // Firebase es opcional en desarrollo; se puede loggear un warning
    console.warn('Firebase config is not fully set. Push notifications disabled.');
}

const serviceAccount = projectId && clientEmail && privateKeyEnv
    ? {
          projectId,
          clientEmail,
          privateKey: privateKeyEnv.replace(/\\n/g, '\n'),
      }
    : undefined;

if (serviceAccount) {
    admin.initializeApp({
        credential: admin.credential.cert(serviceAccount as admin.ServiceAccount),
    });
}

export const messaging = serviceAccount ? admin.messaging() : undefined;

