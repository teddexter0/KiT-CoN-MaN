import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '../firebase';

const APP_VERSION = '1.0.0';

// Load contacts for the signed-in user.
// On first login, if Firestore is empty, migrates any localStorage data automatically.
export const loadContactsFromFirestore = async (uid) => {
  try {
    const ref = doc(db, 'users', uid);
    const snap = await getDoc(ref);

    if (snap.exists()) {
      return snap.data().contacts || [];
    }

    // First login: migrate existing localStorage data if present
    const local = localStorage.getItem('kitConManContacts');
    if (local) {
      const parsed = JSON.parse(local);
      const contacts = parsed.contacts || [];
      if (contacts.length > 0) {
        await saveContactsToFirestore(uid, contacts);
        return contacts;
      }
    }

    return [];
  } catch (err) {
    console.error('Failed to load from Firestore:', err);
    return [];
  }
};

export const saveContactsToFirestore = async (uid, contacts) => {
  try {
    const ref = doc(db, 'users', uid);
    await setDoc(ref, {
      contacts,
      version: APP_VERSION,
      updatedAt: new Date().toISOString()
    });
    return true;
  } catch (err) {
    console.error('Failed to save to Firestore:', err);
    return false;
  }
};
