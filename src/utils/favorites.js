import { ref, get, set } from 'firebase/database';
import { db, isFirebaseConfigured } from './firebase';

// Namespaced under "navhawk" since this Firebase project's Realtime Database
// is shared with another app that already owns the top-level users/{uid} node.
const favoritePath = (uid) => `users/${uid}/navhawk/favoriteTeamId`;

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

// Reconciles localStorage with the signed-in user's Realtime Database record.
// Cloud value wins if one was already saved; otherwise the local value (if any)
// is migrated up so it isn't silently lost on first sign-in.
export async function reconcileFavoriteTeamOnSignIn(uid) {
  if (!isFirebaseConfigured || !db || !uid) return getFavoriteTeamId();

  try {
    const teamRef = ref(db, favoritePath(uid));
    const snap = await get(teamRef);

    if (snap.exists() && snap.val() != null) {
      const cloudTeamId = snap.val();
      setFavoriteTeamId(cloudTeamId);
      return cloudTeamId;
    }

    const localTeamId = getFavoriteTeamId();
    if (localTeamId != null) {
      await set(teamRef, localTeamId);
    }
    return localTeamId;
  } catch (err) {
    console.warn('Failed to sync favorite team with the Realtime Database.', err);
    return getFavoriteTeamId();
  }
}

export async function setCloudFavoriteTeamId(uid, teamId) {
  if (!isFirebaseConfigured || !db || !uid) return;
  try {
    await set(ref(db, favoritePath(uid)), teamId);
  } catch (err) {
    console.warn('Failed to save favorite team to the Realtime Database.', err);
  }
}
