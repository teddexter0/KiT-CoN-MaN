import React from 'react';

const sections = [
  {
    icon: '🔁',
    title: 'Spaced repetition for people',
    text: 'The app schedules who to reach out to and when — starting frequent, gradually spacing out as you reconnect. Same idea as Duolingo, but for relationships.'
  },
  {
    icon: '➕',
    title: 'Adding someone',
    text: 'Hit Add. Set them as Reconnecting (drifted apart) or Active (already in regular touch). Add activity ideas for what you could actually do together.'
  },
  {
    icon: '📅',
    title: 'Your daily queue',
    text: '"Ready for Contact" is who\'s up today. Your daily limit keeps it manageable — start with 2 and adjust from there.'
  },
  {
    icon: '🧡',
    title: 'Handle with care',
    text: 'For complicated dynamics — a flag for your own awareness. No different scheduling, just a reminder to be thoughtful.'
  }
];

const interactions = [
  { emoji: '💬', label: 'Message', pts: '0.5 pts' },
  { emoji: '📞', label: 'Call',    pts: '1 pt'   },
  { emoji: '📺', label: 'Watch',   pts: '1.5 pts' },
  { emoji: '🎮', label: 'Game',    pts: '1.5 pts' },
  { emoji: '☕', label: 'Meetup',  pts: '2 pts'   },
  { emoji: '✈️', label: 'Trip',    pts: '3 pts'   }
];

const TutorialModal = ({ onClose }) => (
  <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
    <div className="bg-white rounded-2xl shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
      <div className="p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-gray-900">How it works</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-xl leading-none"
            aria-label="Close"
          >
            ✕
          </button>
        </div>

        <div className="space-y-5">
          {sections.map(({ icon, title, text }) => (
            <div key={title} className="flex gap-3">
              <span className="text-2xl flex-shrink-0">{icon}</span>
              <div>
                <p className="font-semibold text-gray-900">{title}</p>
                <p className="text-sm text-gray-600 mt-0.5">{text}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-6 bg-gray-50 rounded-xl p-4">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">
            Interaction types — log after you reach out
          </p>
          <div className="grid grid-cols-3 gap-3">
            {interactions.map(({ emoji, label, pts }) => (
              <div key={label} className="text-center">
                <div className="text-xl">{emoji}</div>
                <div className="text-xs font-medium text-gray-700">{label}</div>
                <div className="text-xs text-gray-400">{pts}</div>
              </div>
            ))}
          </div>
        </div>

        <button
          onClick={onClose}
          className="w-full mt-6 bg-blue-600 text-white py-2.5 rounded-xl hover:bg-blue-700 transition-colors font-medium"
        >
          Got it
        </button>
      </div>
    </div>
  </div>
);

export default TutorialModal;
