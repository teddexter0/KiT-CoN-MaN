import React from 'react';
import { MessageCircle, Phone, Coffee, Plane, Edit, Trash2, Star, Lightbulb } from 'lucide-react';
import { formatDate, getDaysUntil, getRelationshipStrength, getConversationSuggestion } from '../utils/dateUtils';

const ContactCard = ({ contact, onContact, onEdit, onDelete, isDue = false }) => {
  const interactionTypes = {
    'message': { label: 'Message', weight: 0.5, icon: MessageCircle, color: 'green' },
    'call': { label: 'Call', weight: 1, icon: Phone, color: 'blue' },
    'meetup': { label: 'Coffee', weight: 2, icon: Coffee, color: 'purple' },
    'trip': { label: 'Adventure', weight: 3, icon: Plane, color: 'orange' }
  };

  const relationshipStrength = getRelationshipStrength(contact.relationshipScore || 0);
  
  const getSuggestedInteraction = () => {
    const repCount = contact.repCount || 0;
    
    if (contact.contactType === 'estranged') {
      // Follow the gentle reconnection phases
      if (repCount === 0) return 'message'; // Initial reach out
      if (repCount === 1) return 'message'; // Follow up
      if (repCount === 2) return 'call';    // Deeper conversation
      if (repCount >= 3) return 'meetup';   // In-person connection
      return 'message';
    } else {
      // Active relationships
      const daysSinceLastContact = Math.floor((new Date() - new Date(contact.lastContact)) / (1000 * 60 * 60 * 24));
      if (daysSinceLastContact >= 14) return 'call';
      return 'message';
    }
  };

  const suggestedMethod = getSuggestedInteraction();
  const conversationSuggestion = isDue ? getConversationSuggestion(
    contact.repCount || 0, 
    contact.name.split(' ')[0], 
    contact.pastConnection
  ) : null;

  // Get phase description
  const getPhaseDescription = (repCount) => {
    if (repCount === 0) return "Initial reconnection";
    if (repCount === 1) return "Follow-up phase";
    if (repCount === 2) return "Deepening connection";
    if (repCount >= 3) return "Building friendship";
    return "Reconnecting";
  };

  return (
    <div className={`p-4 rounded-lg border ${isDue ? 'bg-red-50 border-red-200' : 'bg-gray-50 border-gray-200'}`}>
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <h3 className="font-medium text-gray-900">{contact.name}</h3>
            <span className={`px-2 py-1 text-xs rounded-full ${
              contact.contactType === 'estranged' 
                ? 'bg-orange-100 text-orange-800' 
                : 'bg-blue-100 text-blue-800'
            }`}>
              {contact.contactType === 'estranged' 
                ? `Rep ${contact.repCount || 0} - ${getPhaseDescription(contact.repCount || 0)}`
                : 'Active'
              }
            </span>
            <div className="flex items-center gap-1">
              {[...Array(relationshipStrength.stars)].map((_, i) => (
                <Star key={i} size={12} className={`${relationshipStrength.color} fill-current`} />
              ))}
              <span className={`text-xs ${relationshipStrength.color} ml-1`}>
                {relationshipStrength.label}
              </span>
            </div>
          </div>
          
          <div className="text-sm text-gray-600 mb-2">
            <span>Last contacted: {formatDate(contact.lastContact)}</span>
            {contact.lastMethod && (
              <span className="ml-2">via {interactionTypes[contact.lastMethod]?.label}</span>
            )}
            <span className="ml-2">• {getDaysUntil(contact.nextContact)}</span>
            {contact.location && (
              <span className="ml-2">• 📍 {contact.location}</span>
            )}
          </div>

          {isDue && (
            <div className="text-sm bg-yellow-100 text-yellow-800 px-3 py-2 rounded mb-2 flex items-start gap-2">
              <Lightbulb size={14} className="mt-0.5 flex-shrink-0" />
              <div>
                <div className="font-medium">Suggested: {interactionTypes[suggestedMethod]?.label}</div>
                {conversationSuggestion && (
                  <div className="text-xs mt-1 italic">"{conversationSuggestion}"</div>
                )}
              </div>
            </div>
          )}
          
          {contact.notes && (
            <p className="text-sm text-gray-500 mt-2">📝 {contact.notes}</p>
          )}
          
          {contact.pastConnection && (
            <p className="text-sm text-blue-600 mt-1">🎯 {contact.pastConnection}</p>
          )}

          {contact.interactions && contact.interactions.length > 0 && (
            <div className="text-xs text-gray-400 mt-2">
              Recent: {contact.interactions.slice(-3).map(i => 
                `${interactionTypes[i.method]?.label} (${formatDate(i.date)})`
              ).join(', ')}
            </div>
          )}
        </div>
        
        <div className="flex flex-col gap-2 ml-4">
          {Object.entries(interactionTypes).map(([method, config]) => {
            const Icon = config.icon;
            const isRecommended = method === suggestedMethod;
            return (
              <button
                key={method}
                onClick={() => onContact(contact.id, method)}
                className={`p-2 rounded-lg transition-colors flex items-center gap-1 text-xs ${
                  isRecommended 
                    ? `bg-${config.color}-200 text-${config.color}-800 border-2 border-${config.color}-400 font-semibold`
                    : `bg-${config.color}-100 text-${config.color}-700 hover:bg-${config.color}-200`
                }`}
                title={`${config.label} (+${config.weight} pts)`}
              >
                <Icon size={14} />
                {isRecommended && '⭐'}
              </button>
            );
          })}
          <button
            onClick={() => onEdit(contact)}
            className="p-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
            title="Edit contact"
          >
            <Edit size={14} />
          </button>
          <button
            onClick={() => onDelete(contact.id)}
            className="p-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors"
            title="Delete contact"
          >
            <Trash2 size={14} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default ContactCard;