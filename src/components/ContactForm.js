import React, { useState, useEffect } from 'react';

const ContactForm = ({ contact, onSave, onCancel, isEditing = false }) => {
  const [formData, setFormData] = useState({
    name: '',
    contactType: 'estranged',
    lastContact: '',
    notes: '',
    location: '',
    pastConnection: ''
  });

  useEffect(() => {
    if (isEditing && contact) {
      setFormData(contact);
    } else {
      setFormData({
        name: '',
        contactType: 'estranged',
        lastContact: new Date().toISOString().split('T')[0],
        notes: '',
        location: '',
        pastConnection: ''
      });
    }
  }, [contact, isEditing]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.name.trim()) return;
    onSave(formData);
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <h2 className="text-xl font-semibold mb-4">
        {isEditing ? 'Edit Contact' : 'Add New Contact'}
      </h2>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Name *
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Enter contact name"
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Relationship Type
            </label>
            <select
              name="contactType"
              value={formData.contactType}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="estranged">Estranged/Reconnecting</option>
              <option value="active">Active Relationship</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Last Contact Date
            </label>
            <input
              type="date"
              name="lastContact"
              value={formData.lastContact}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Location
            </label>
            <input
              type="text"
              name="location"
              value={formData.location}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="City/Country"
            />
          </div>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Past Connection
          </label>
          <input
            type="text"
            name="pastConnection"
            value={formData.pastConnection}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="e.g., 'Primary school best friend', 'College roommate', 'Former colleague'"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Notes
          </label>
          <textarea
            name="notes"
            value={formData.notes}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="What you remember about them, shared interests, last conversation..."
            rows="3"
          />
        </div>
        
        <div className="flex gap-3">
          <button
            type="submit"
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            {isEditing ? 'Update' : 'Add'} Contact
          </button>
          <button
            type="button"
            onClick={onCancel}
            className="bg-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-400 transition-colors"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
};

export default ContactForm;