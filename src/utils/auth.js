import {
  signInWithPopup,
  signInWithRedirect,
  getRedirectResult,
  onAuthStateChanged,
  signOut,
} from 'firebase/auth';
import { auth, googleProvider, isFirebaseConfigured } from './firebase';

// Popup sign-in is unreliable in mobile Safari and in-app browsers, so those
// environments use a redirect flow instead.
function shouldUseRedirect() {
  const ua = navigator.userAgent || '';
  const isIOS = /iPad|iPhone|iPod/.test(ua);
  const isSafari = /Safari/.test(ua) && !/CriOS|FxiOS|EdgiOS|Chrome/.test(ua);
  const isInAppBrowser = /FBAN|FBAV|Instagram|Line\//.test(ua);
  return isIOS || isSafari || isInAppBrowser;
}

export function watchAuthState(callback) {
  if (!isFirebaseConfigured || !auth) {
    callback(null);
    return () => {};
  }
  return onAuthStateChanged(auth, callback);
}

export async function completeRedirectSignIn() {
  if (!isFirebaseConfigured || !auth) return null;
  try {
    const result = await getRedirectResult(auth);
    return result ? result.user : null;
  } catch (err) {
    console.warn('Google redirect sign-in failed.', err);
    return null;
  }
}

export async function signInWithGoogle() {
  if (!isFirebaseConfigured || !auth || !googleProvider) return;
  try {
    if (shouldUseRedirect()) {
      await signInWithRedirect(auth, googleProvider);
    } else {
      await signInWithPopup(auth, googleProvider);
    }
  } catch (err) {
    // Popup blocked or unsupported in this environment — fall back to redirect.
    if (err?.code === 'auth/popup-blocked' || err?.code === 'auth/operation-not-supported-in-this-environment') {
      await signInWithRedirect(auth, googleProvider);
    } else {
      console.warn('Google sign-in failed.', err);
    }
  }
}

export async function signOutUser() {
  if (!isFirebaseConfigured || !auth) return;
  try {
    await signOut(auth);
  } catch (err) {
    console.warn('Sign-out failed.', err);
  }
}
