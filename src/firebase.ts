import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

// Configuration retrieved from firebase-applet-config.json
const firebaseConfig = {
  apiKey: "AIzaSyB53DhVpwzk2sBJNV4LMMDiumnxfP7OGD0",
  authDomain: "imposing-logic-409p9.firebaseapp.com",
  projectId: "imposing-logic-409p9",
  storageBucket: "imposing-logic-409p9.firebasestorage.app",
  messagingSenderId: "950166797073",
  appId: "1:950166797073:web:9000383e1878eb73592ab0"
};

const app = initializeApp(firebaseConfig);

// Initialize Firestore with the custom database ID provided in the configuration
export const db = getFirestore(app, "ai-studio-yldzconnect-bbc6f1a6-1069-4aa8-9f8b-d9c26d7cac84");

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  }
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: null,
      email: null,
      emailVerified: null,
      isAnonymous: null,
      tenantId: null,
      providerInfo: []
    },
    operationType,
    path
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

