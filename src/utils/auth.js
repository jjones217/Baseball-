import {
  signInWithPopup,
  signInWithRedirect,
  getRedirectResult,
  onAuthStateChanged,
  signOut,
} from 'firebase/auth';
import { auth, googleProvider, isFirebaseConfigured } from './firebase';

// Redirect needs a real window.open, which in-app browsers (Instagram, Facebook,
// Line) don't support — those fall back to a redirect flow. Everywhere else,
// including standalone Safari/iOS, popup is preferred: redirect's full-page
// round trip through the authDomain relies on storage continuity that Safari's
// cross-site tracking prevention can silently break (confirmed in production —
// see the ITP message in completeRedirectSignIn below).
function shouldUseRedirect() {
  const ua = navigator.userAgent || '';
  const isInAppBrowser = /FBAN|FBAV|Instagram|Line\//.test(ua);
  return isInAppBrowser;
}

// Set right before signInWithRedirect navigates away, and checked when the
// app reloads after returning from Google. Lets us tell "redirect flow
// attempted but getRedirectResult silently came back empty" apart from a
// normal first page load with no error to report.
const REDIRECT_PENDING_KEY = 'navhawk_auth_redirect_pending';

function clearRedirectPending() {
  try {
    sessionStorage.removeItem(REDIRECT_PENDING_KEY);
  } catch {
    // sessionStorage unavailable — nothing to clear
  }
}

async function redirectToGoogle() {
  try {
    sessionStorage.setItem(REDIRECT_PENDING_KEY, '1');
  } catch {
    // sessionStorage unavailable — the silent-failure check on return just won't fire
  }
  await signInWithRedirect(auth, googleProvider);
}

export function watchAuthState(callback) {
  if (!isFirebaseConfigured || !auth) {
    callback(null);
    return () => {};
  }
  return onAuthStateChanged(auth, callback);
}

export async function completeRedirectSignIn(onError) {
  if (!isFirebaseConfigured || !auth) return null;
  let wasPending = false;
  try {
    wasPending = sessionStorage.getItem(REDIRECT_PENDING_KEY) === '1';
  } catch {
    // sessionStorage unavailable — skip the silent-failure check below
  }

  try {
    const result = await getRedirectResult(auth);
    clearRedirectPending();
    if (result) return result.user;
    if (wasPending) {
      onError?.(
        "Sign-in didn't complete and no error was reported. On iPad/Safari this is usually caused by " +
        "'Prevent Cross-Site Tracking' blocking sign-in storage during the redirect — try turning that off " +
        "in Settings > Safari, or sign in from Chrome instead."
      );
    }
    return null;
  } catch (err) {
    clearRedirectPending();
    console.warn('Google redirect sign-in failed.', err);
    onError?.(`Google sign-in failed: ${err.message}`);
    return null;
  }
}

// Guards against a second tap starting a new popup before the first one
// resolves — without this, Firebase cancels the first popup's promise with
// auth/cancelled-popup-request, which would otherwise surface as a bogus
// error even though the second (superseding) attempt succeeds.
let signInInFlight = false;

export async function signInWithGoogle(onError) {
  if (!isFirebaseConfigured || !auth || !googleProvider || signInInFlight) return;
  signInInFlight = true;
  try {
    if (shouldUseRedirect()) {
      await redirectToGoogle();
    } else {
      await signInWithPopup(auth, googleProvider);
    }
  } catch (err) {
    if (err?.code === 'auth/cancelled-popup-request' || err?.code === 'auth/popup-closed-by-user') {
      // Expected: a duplicate sign-in attempt got cancelled, or the user
      // dismissed the popup themselves. Not a real failure.
    } else if (err?.code === 'auth/popup-blocked' || err?.code === 'auth/operation-not-supported-in-this-environment') {
      try {
        await redirectToGoogle();
      } catch (redirectErr) {
        console.warn('Google sign-in failed.', redirectErr);
        onError?.(`Google sign-in failed: ${redirectErr.message}`);
      }
    } else {
      console.warn('Google sign-in failed.', err);
      onError?.(`Google sign-in failed: ${err.message}`);
    }
  } finally {
    signInInFlight = false;
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
