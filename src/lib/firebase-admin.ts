import { initializeApp, getApps } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';

if (!getApps().length) {
  const projectId = process.env.FIREBASE_PROJECT_ID || process.env.VITE_FIREBASE_PROJECT_ID || 'linen-winter-8vd6f';
  initializeApp({
    projectId: projectId,
  });
}

export const adminAuth = getAuth();

