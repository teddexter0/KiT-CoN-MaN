const STORAGE_KEY = 'kitConManContacts';
const APP_VERSION = '1.0.0';

export const saveContacts = (contacts) => {
  try {
    const dataToSave = {
      version: APP_VERSION,
      timestamp: new Date().toISOString(),
      contacts: contacts
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(dataToSave));
    return true;
  } catch (error) {
    console.error('Failed to save contacts:', error);
    return false;
  }
};

export const loadContacts = () => {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (!saved) return [];
    
    const data = JSON.parse(saved);
    // Version checking for future migrations
    if (data.version !== APP_VERSION) {
      console.warn('Data version mismatch, may need migration');
    }
    
    return data.contacts || [];
  } catch (error) {
    console.error('Failed to load contacts:', error);
    return [];
  }
};

export const exportContacts = () => {
  const contacts = loadContacts();
  const dataStr = JSON.stringify(contacts, null, 2);
  const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
  
  const exportFileDefaultName = `kit-con-man-backup-${new Date().toISOString().split('T')[0]}.json`;
  
  const linkElement = document.createElement('a');
  linkElement.setAttribute('href', dataUri);
  linkElement.setAttribute('download', exportFileDefaultName);
  linkElement.click();
};