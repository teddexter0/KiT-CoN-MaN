// Realistic "Gentle Reconnection" algorithm - much more humane!
export const calculateNextContactDate = (lastContactDate, repCount, contactType = 'estranged') => {
  const baseDate = new Date(lastContactDate);
  
  if (contactType === 'estranged') {
    // New realistic intervals: [1, 7, 14, 21, 30, 45, 60, 90]
    // Total cycle: ~268 days (much more humane than 35 days!)
    const intervals = [1, 7, 14, 21, 30, 45, 60, 90];
    
    // After rep 7, use 90-day maintenance mode
    const intervalIndex = repCount < intervals.length ? repCount : intervals.length - 1;
    const daysToAdd = intervals[intervalIndex];
    
    const nextDate = new Date(baseDate);
    nextDate.setDate(nextDate.getDate() + daysToAdd);
    return nextDate;
  } else {
    // Active relationships - gentle maintenance
    const maintenanceIntervals = [14, 30, 45, 60, 60]; // Sustainable rhythm
    const intervalIndex = Math.min(repCount, maintenanceIntervals.length - 1);
    const daysToAdd = maintenanceIntervals[intervalIndex];
    
    const nextDate = new Date(baseDate);
    nextDate.setDate(nextDate.getDate() + daysToAdd);
    return nextDate;
  }
};

export const formatDate = (dateString) => {
  return new Date(dateString).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });
};

export const getDaysUntil = (dateString) => {
  const today = new Date();
  const targetDate = new Date(dateString);
  const diffTime = targetDate - today;
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  if (diffDays < 0) return `${Math.abs(diffDays)} days overdue`;
  if (diffDays === 0) return 'Today';
  if (diffDays === 1) return 'Tomorrow';
  return `${diffDays} days`;
};

export const getRelationshipStrength = (score) => {
  if (score >= 20) return { label: 'Reconnected', color: 'text-green-600', stars: 5 };
  if (score >= 15) return { label: 'Strong', color: 'text-green-500', stars: 4 };
  if (score >= 10) return { label: 'Building', color: 'text-blue-500', stars: 3 };
  if (score >= 5) return { label: 'Started', color: 'text-yellow-500', stars: 2 };
  return { label: 'New', color: 'text-gray-500', stars: 1 };
};

// Get suggested conversation starters based on rep count
export const getConversationSuggestion = (repCount, contactName, pastConnection) => {
  const suggestions = [
    `Hey ${contactName}! Been thinking about ${pastConnection || 'our time together'} lately. How have you been?`,
    `Good to hear from you! Would love to catch up properly - free for a call this week?`,
    `Want to grab coffee sometime? Would be great to reconnect in person!`,
    `Remember how we used to ${pastConnection || 'hang out'}? Want to try something fun together?`,
    `Hope you're doing amazing! Just wanted you to know I think of you fondly.`
  ];
  
  return suggestions[Math.min(repCount, suggestions.length - 1)];
};

// Calculate realistic daily workload
export const calculateDailyWorkload = (contacts) => {
  const today = new Date();
  const estrangedContacts = contacts.filter(c => c.contactType === 'estranged');
  
  // Intervals: [1, 7, 14, 21, 30, 45, 60, 90] = 268 days total
  const totalCycleDays = 268;
  const averageInteractionsPerPerson = 8;
  
  const dailyAverage = (estrangedContacts.length * averageInteractionsPerPerson) / totalCycleDays;
  
  return {
    dailyAverage: Math.round(dailyAverage * 10) / 10,
    totalPeople: estrangedContacts.length,
    manageable: dailyAverage <= 3,
    recommendation: dailyAverage > 3 ? 'Consider reducing contacts or extending intervals' : 'Sustainable workload'
  };
};