import { initializeApp, getApps, type FirebaseApp } from 'firebase/app';
import {
  createUserWithEmailAndPassword,
  getAuth,
  GoogleAuthProvider,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut,
  updateProfile,
  type User
} from 'firebase/auth';
import { Platform } from 'react-native';

const firebaseConfig = {
  apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY ?? 'AIzaSyApVZ0g9IoMk3fGZQG6Q1Gj2UMv7P2Hneg',
  authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN ?? 'personos-xsz.firebaseapp.com',
  projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID ?? 'personos-xsz',
  appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID ?? '1:316664254743:web:0de4f3dff891e4c6622752',
  storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET ?? 'personos-xsz.firebasestorage.app',
  messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID ?? '316664254743'
};

export function isFirebaseConfigured() {
  return Boolean(firebaseConfig.apiKey && firebaseConfig.authDomain && firebaseConfig.projectId && firebaseConfig.appId);
}

export function getFirebaseApp(): FirebaseApp | null {
  if (!isFirebaseConfigured()) return null;
  return getApps()[0] ?? initializeApp(firebaseConfig);
}

export function getFirebaseAuth() {
  const app = getFirebaseApp();
  return app ? getAuth(app) : null;
}

export function listenToAuth(callback: (user: User | null) => void) {
  const auth = getFirebaseAuth();
  if (!auth) {
    callback(null);
    return () => {};
  }
  return onAuthStateChanged(auth, callback);
}

export async function signUpWithEmail(email: string, password: string, displayName: string) {
  const auth = requireAuth();
  const credential = await createUserWithEmailAndPassword(auth, email.trim(), password);
  if (displayName.trim()) await updateProfile(credential.user, { displayName: displayName.trim() });
  return credential.user;
}

export async function logInWithEmail(email: string, password: string) {
  const auth = requireAuth();
  return (await signInWithEmailAndPassword(auth, email.trim(), password)).user;
}

export async function logInWithGoogle() {
  const auth = requireAuth();
  if (Platform.OS !== 'web') throw new Error('Google sign-in is set up for web first. Native support needs Expo AuthSession.');
  return (await signInWithPopup(auth, new GoogleAuthProvider())).user;
}

export async function logOut() {
  const auth = getFirebaseAuth();
  if (auth) await signOut(auth);
}

function requireAuth() {
  const auth = getFirebaseAuth();
  if (!auth) throw new Error('Firebase Auth is not configured yet.');
  return auth;
}
