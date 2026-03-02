import React, { useState, useEffect, useRef } from 'react';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { Plus, Users, Calendar, MessageCircle, Star, Download, BarChart3, Info, HelpCircle, LogOut } from 'lucide-react';
import ContactCard from './ContactCard';
import ContactForm from './ContactForm';
import AuthScreen from './AuthScreen';
import TutorialModal from './TutorialModal';
import { auth } from '../firebase';
import { calculateNextContactDate, calculateDailyWorkload } from '../utils/dateUtils';
import { saveContacts, loadContacts, exportContacts } from '../utils/storageUtils';
import { loadContactsFromFirestore, saveContactsToFirestore } from '../utils/firestoreUtils';

const RelationshipTracker = () => {
  const [user, setUser] = useState(undefined); // undefined = loading, null = logged out
  const [contacts, setContacts] = useState([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingContact, setEditingContact] = useState(null);
  const [dailyLimit, setDailyLimit] = useState(() => {
    const saved = localStorage.getItem('kitConManDailyLimit');
    return saved ? Number(saved) : 2;
  });
  const [showAnalysis, setShowAnalysis] = useState(false);
  const [showTutorial, setShowTutorial] = useState(false);

  // Track whether initial load from Firestore has completed
  const firestoreLoaded = useRef(false);

  // Auth state listener
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (firebaseUser) => {
      setUser(firebaseUser);
      if (firebaseUser) {
        firestoreLoaded.current = false;
        const loaded = await loadContactsFromFirestore(firebaseUser.uid);
        setContacts(loaded);
        firestoreLoaded.current = true;
      } else {
        // Logged out — fall back to localStorage
        firestoreLoaded.current = false;
        setContacts(loadContacts());
      }
    });
    return unsub;
  }, []);

  // Sync contacts to storage whenever they change (after initial load)
  useEffect(() => {
    if (user === undefined) return; // still loading auth
    if (user) {
      if (!firestoreLoaded.current) return; // don't write before we've read
      saveContactsToFirestore(user.uid, contacts);
    } else {
      saveContacts(contacts);
    }
  }, [contacts]); // eslint-disable-line react-hooks/exhaustive-deps

  const addContact = (contactData) => {
    const newContact = {
      id: Date.now(),
      ...contactData,
      repCount: 0,
      totalContacts: 0,
      relationshipScore: 0,
      lastMethod: null,
      interactions: [],
      createdDate: new Date().toISOString().split('T')[0]
    };
    newContact.nextContact = calculateNextContactDate(
      newContact.lastContact,
      newContact.repCount,
      newContact.contactType
    );
    setContacts([...contacts, newContact]);
    setShowAddForm(false);
  };

  const updateContact = (contactData) => {
    const updatedContacts = contacts.map(contact =>
      contact.id === editingContact.id
        ? {
            ...contactData,
            id: contact.id,
            repCount: contact.repCount,
            totalContacts: contact.totalContacts,
            relationshipScore: contact.relationshipScore,
            interactions: contact.interactions,
            nextContact: calculateNextContactDate(
              contactData.lastContact,
              contact.repCount,
              contactData.contactType
            )
          }
        : contact
    );
    setContacts(updatedContacts);
    setEditingContact(null);
  };

  const markAsContacted = (contactId, method = 'message') => {
    const interactionWeights = {
      'message': 0.5,
      'call': 1,
      'watch': 1.5,
      'game': 1.5,
      'meetup': 2,
      'trip': 3
    };

    const updatedContacts = contacts.map(contact => {
      if (contact.id === contactId) {
        const interactionWeight = interactionWeights[method] || 1;
        const newRepCount = contact.repCount + 1;
        const newTotalContacts = contact.totalContacts + 1;
        const newRelationshipScore = contact.relationshipScore + interactionWeight;
        const today = new Date().toISOString().split('T')[0];
        const nextContact = calculateNextContactDate(today, newRepCount, contact.contactType);
        const newInteraction = { date: today, method, weight: interactionWeight };

        return {
          ...contact,
          lastContact: today,
          repCount: newRepCount,
          totalContacts: newTotalContacts,
          relationshipScore: newRelationshipScore,
          nextContact,
          lastMethod: method,
          interactions: [...(contact.interactions || []), newInteraction].slice(-10)
        };
      }
      return contact;
    });
    setContacts(updatedContacts);
  };

  const deleteContact = (contactId) => {
    if (window.confirm('Are you sure you want to delete this contact? This cannot be undone.')) {
      setContacts(contacts.filter(contact => contact.id !== contactId));
    }
  };

  const getDueContacts = () => {
    const today = new Date();
    return contacts
      .filter(c => new Date(c.nextContact) <= today)
      .sort((a, b) => new Date(a.nextContact) - new Date(b.nextContact))
      .slice(0, dailyLimit);
  };

  const getUpcomingContacts = () => {
    const today = new Date();
    return contacts
      .filter(c => new Date(c.nextContact) > today)
      .sort((a, b) => new Date(a.nextContact) - new Date(b.nextContact));
  };

  const dueContacts = getDueContacts();
  const upcomingContacts = getUpcomingContacts();
  const estrangedContacts = contacts.filter(c => c.contactType === 'estranged');
  const activeContacts = contacts.filter(c => c.contactType === 'active');
  const workloadAnalysis = calculateDailyWorkload(contacts);

  // Show nothing while Firebase resolves auth state
  if (user === undefined) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-gray-400 text-sm">Loading…</div>
      </div>
    );
  }

  if (user === null) {
    return <AuthScreen />;
  }

  return (
    <div className="max-w-6xl mx-auto p-4 md:p-6 bg-gray-50 min-h-screen">
      {showTutorial && <TutorialModal onClose={() => setShowTutorial(false)} />}

      <div className="bg-white rounded-lg shadow-sm p-4 md:p-6 mb-6">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-6">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900">KiT-Con-Man</h1>
            <p className="text-gray-600 mt-1 text-sm md:text-base hidden sm:block">Keep in Touch Contact Manager</p>
          </div>
          <div className="flex gap-2 flex-wrap">
            <button
              onClick={() => setShowTutorial(true)}
              className="bg-gray-100 text-gray-600 px-3 py-2 rounded-lg flex items-center gap-2 hover:bg-gray-200 transition-colors text-sm"
              title="How it works"
            >
              <HelpCircle size={18} />
              <span className="hidden sm:inline">How it works</span>
            </button>
            <button
              onClick={() => setShowAnalysis(!showAnalysis)}
              className="bg-purple-600 text-white px-3 py-2 rounded-lg flex items-center gap-2 hover:bg-purple-700 transition-colors text-sm"
            >
              <BarChart3 size={18} />
              <span className="hidden sm:inline">Analysis</span>
            </button>
            <button
              onClick={exportContacts}
              className="bg-green-600 text-white px-3 py-2 rounded-lg flex items-center gap-2 hover:bg-green-700 transition-colors text-sm"
            >
              <Download size={18} />
              <span className="hidden sm:inline">Export</span>
            </button>
            <button
              onClick={() => setShowAddForm(true)}
              className="bg-blue-600 text-white px-3 py-2 rounded-lg flex items-center gap-2 hover:bg-blue-700 transition-colors text-sm"
            >
              <Plus size={18} />
              <span className="hidden sm:inline">Add Contact</span>
              <span className="sm:hidden">Add</span>
            </button>
            <button
              onClick={() => signOut(auth)}
              className="bg-gray-100 text-gray-500 px-3 py-2 rounded-lg flex items-center gap-2 hover:bg-gray-200 transition-colors text-sm"
              title="Sign out"
            >
              <LogOut size={18} />
            </button>
          </div>
        </div>

        {showAnalysis && workloadAnalysis && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-6">
            <h3 className="text-lg font-semibold text-blue-900 mb-4 flex items-center gap-2">
              <Info size={20} />
              Workload Analysis: {workloadAnalysis.totalPeople} Estranged Contacts
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-medium text-blue-800 mb-3">Daily Average:</h4>
                <p className="text-2xl font-bold text-blue-900">{workloadAnalysis.dailyAverage} contacts/day</p>
                <p className="text-sm text-blue-700 mt-1">Over 268-day cycle (realistic intervals)</p>
              </div>
              <div>
                <h4 className="font-medium text-blue-800 mb-3">Assessment:</h4>
                <p className={`text-sm font-medium ${workloadAnalysis.manageable ? 'text-green-700' : 'text-red-700'}`}>
                  {workloadAnalysis.manageable ? '✅ Manageable workload' : '⚠️ May be overwhelming'}
                </p>
                <p className="text-sm text-blue-700 mt-1">{workloadAnalysis.recommendation}</p>
              </div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-6">
          <div className="bg-red-50 p-4 rounded-lg border border-red-200">
            <div className="flex items-center gap-2 text-red-700">
              <Calendar size={18} />
              <span className="font-semibold text-sm">Due Today</span>
            </div>
            <p className="text-2xl font-bold text-red-800 mt-1">{dueContacts.length}</p>
          </div>
          <div className="bg-orange-50 p-4 rounded-lg border border-orange-200">
            <div className="flex items-center gap-2 text-orange-700">
              <Users size={18} />
              <span className="font-semibold text-sm">Reconnecting</span>
            </div>
            <p className="text-2xl font-bold text-orange-800 mt-1">{estrangedContacts.length}</p>
          </div>
          <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
            <div className="flex items-center gap-2 text-blue-700">
              <Users size={18} />
              <span className="font-semibold text-sm">Active</span>
            </div>
            <p className="text-2xl font-bold text-blue-800 mt-1">{activeContacts.length}</p>
          </div>
          <div className="bg-green-50 p-4 rounded-lg border border-green-200">
            <div className="flex items-center gap-2 text-green-700">
              <MessageCircle size={18} />
              <span className="font-semibold text-sm">Total Contacts</span>
            </div>
            <p className="text-2xl font-bold text-green-800 mt-1">
              {contacts.reduce((sum, c) => sum + (c.totalContacts || 0), 0)}
            </p>
          </div>
          <div className="bg-purple-50 p-4 rounded-lg border border-purple-200 col-span-2 md:col-span-1">
            <div className="flex items-center gap-2 text-purple-700">
              <Star size={18} />
              <span className="font-semibold text-sm">Avg Score</span>
            </div>
            <p className="text-2xl font-bold text-purple-800 mt-1">
              {contacts.length > 0
                ? (contacts.reduce((sum, c) => sum + (c.relationshipScore || 0), 0) / contacts.length).toFixed(1)
                : '0.0'}
            </p>
          </div>
        </div>

        <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
          <div className="flex items-center justify-between flex-wrap gap-3">
            <div>
              <h3 className="font-medium text-yellow-800">Daily Contact Limit</h3>
              <p className="text-sm text-yellow-700">Prevent overwhelm — quality over quantity</p>
            </div>
            <div className="flex items-center gap-3">
              <label className="text-sm text-yellow-700">Per day:</label>
              <select
                value={dailyLimit}
                onChange={(e) => {
                  const val = Number(e.target.value);
                  setDailyLimit(val);
                  localStorage.setItem('kitConManDailyLimit', val);
                }}
                className="px-3 py-1 border border-yellow-300 rounded text-yellow-800 bg-white"
              >
                <option value={1}>1 (Deep focus)</option>
                <option value={2}>2 (Balanced)</option>
                <option value={3}>3 (Active)</option>
                <option value={5}>5 (Aggressive)</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {(showAddForm || editingContact) && (
        <div className="mb-6">
          <ContactForm
            contact={editingContact}
            onSave={editingContact ? updateContact : addContact}
            onCancel={() => {
              setShowAddForm(false);
              setEditingContact(null);
            }}
            isEditing={!!editingContact}
          />
        </div>
      )}

      {dueContacts.length > 0 && (
        <div className="bg-white rounded-lg shadow-sm p-4 md:p-6 mb-6">
          <h2 className="text-xl font-semibold text-red-700 mb-4 flex items-center gap-2">
            <Calendar size={20} />
            Ready for Contact ({dueContacts.length})
          </h2>
          <div className="space-y-4">
            {dueContacts.map(contact => (
              <ContactCard
                key={contact.id}
                contact={contact}
                onContact={markAsContacted}
                onEdit={setEditingContact}
                onDelete={deleteContact}
                isDue={true}
              />
            ))}
          </div>
        </div>
      )}

      <div className="bg-white rounded-lg shadow-sm p-4 md:p-6">
        <h2 className="text-xl font-semibold text-gray-700 mb-4 flex items-center gap-2">
          <Users size={20} />
          Upcoming Contacts ({upcomingContacts.length})
        </h2>
        {upcomingContacts.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-500 mb-4">No upcoming contacts. Add some people to reconnect with!</p>
            <button
              onClick={() => setShowAddForm(true)}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Add Your First Contact
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {upcomingContacts.slice(0, 20).map(contact => (
              <ContactCard
                key={contact.id}
                contact={contact}
                onContact={markAsContacted}
                onEdit={setEditingContact}
                onDelete={deleteContact}
                isDue={false}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default RelationshipTracker;
