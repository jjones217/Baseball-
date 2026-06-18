import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db, isFirebaseConfigured } from './firebase';

const KEY = 'navhawk_favorite_team';

export function getFavoriteTeamId() {
  try {
    const val = localStorage.getItem(KEY);
    return val ? Number(val) : null;
  } catch {
    return null;
  }
}

export function setFavoriteTeamId(teamId) {
  try {
    localStorage.setItem(KEY, String(teamId));
  } catch {
    // localStorage unavailable (private browsing, strict settings) — silently ignore
  }
}

export function clearFavoriteTeamId() {
  try {
    localStorage.removeItem(KEY);
  } catch {
    // localStorage unavailable — silently ignore
  }
}

// Reconciles localStorage with the signed-in user's Firestore document.
// Cloud value wins if one was already saved; otherwise the local value (if any)
// is migrated up so it isn't silently lost on first sign-in.
export async function reconcileFavoriteTeamOnSignIn(uid) {
  if (!isFirebaseConfigured || !db || !uid) return getFavoriteTeamId();

  try {
    const ref = doc(db, 'users', uid);
    const snap = await getDoc(ref);

    if (snap.exists() && snap.data().favoriteTeamId != null) {
      const cloudTeamId = snap.data().favoriteTeamId;
      setFavoriteTeamId(cloudTeamId);
      return cloudTeamId;
    }

    const localTeamId = getFavoriteTeamId();
    if (localTeamId != null) {
      await setDoc(ref, { favoriteTeamId: localTeamId }, { merge: true });
    }
    return localTeamId;
  } catch (err) {
    console.warn('Failed to sync favorite team with Firestore.', err);
    return getFavoriteTeamId();
  }
}

export async function setCloudFavoriteTeamId(uid, teamId) {
  if (!isFirebaseConfigured || !db || !uid) return;
  try {
    await setDoc(doc(db, 'users', uid), { favoriteTeamId: teamId }, { merge: true });
  } catch (err) {
    console.warn('Failed to save favorite team to Firestore.', err);
  }
}
