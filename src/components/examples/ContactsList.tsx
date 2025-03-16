import React, { useEffect, useState } from 'react';
import { Contact, ContactType } from '@/types/database.types';
import { ContactService } from '@/services/contact.service';
import { ServiceResponse } from '@/services/base.service';

// Initialize the contact service
const contactService = new ContactService();

export default function ContactsList() {
  // State for contacts and loading status
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // State for filters
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState<ContactType | ''>('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);

  // Load contacts on component mount and when filters change
  useEffect(() => {
    loadContacts();
  }, [searchQuery, selectedType, selectedTags]);

  // Function to load contacts with current filters
  const loadContacts = async () => {
    setLoading(true);
    setError(null);

    try {
      const response: ServiceResponse<Contact[]> = await contactService.search({
        query: searchQuery || undefined,
        type: (selectedType as ContactType) || undefined,
        tags: selectedTags.length > 0 ? selectedTags : undefined,
      });

      if (response.error) {
        throw new Error(response.error.message);
      }

      setContacts(response.data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  // Function to update contact tags
  const handleUpdateTags = async (contactId: string, newTags: string[]) => {
    try {
      const response = await contactService.updateTags(contactId, newTags);
      if (response.error) {
        throw new Error(response.error.message);
      }
      
      // Update the contact in the local state
      setContacts(prevContacts => 
        prevContacts.map(contact => 
          contact.id === contactId ? { ...contact, tags: newTags } : contact
        )
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update tags');
    }
  };

  if (loading) {
    return <div>Loading contacts...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  return (
    <div className="space-y-4">
      {/* Search and filter controls */}
      <div className="flex gap-4 mb-4">
        <input
          type="text"
          placeholder="Search contacts..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="px-4 py-2 border rounded"
        />
        
        <select
          value={selectedType}
          onChange={(e) => setSelectedType(e.target.value as ContactType)}
          className="px-4 py-2 border rounded"
        >
          <option value="">All Types</option>
          <option value="buyer">Buyers</option>
          <option value="seller">Sellers</option>
          <option value="agent">Agents</option>
          <option value="vendor">Vendors</option>
          <option value="other">Others</option>
        </select>
      </div>

      {/* Contacts list */}
      <div className="grid gap-4">
        {contacts.map(contact => (
          <div key={contact.id} className="p-4 border rounded shadow">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="text-lg font-semibold">
                  {contact.first_name} {contact.last_name}
                </h3>
                <p className="text-gray-600">{contact.email}</p>
                <p className="text-sm text-gray-500">{contact.contact_type}</p>
              </div>
              
              {/* Tags */}
              <div className="flex flex-wrap gap-2">
                {contact.tags?.map(tag => (
                  <span
                    key={tag}
                    className="px-2 py-1 text-sm bg-blue-100 text-blue-800 rounded"
                  >
                    {tag}
                  </span>
                ))}
                <button
                  onClick={() => handleUpdateTags(contact.id, [...(contact.tags || []), 'new-tag'])}
                  className="px-2 py-1 text-sm bg-gray-100 text-gray-800 rounded"
                >
                  + Add Tag
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
} 