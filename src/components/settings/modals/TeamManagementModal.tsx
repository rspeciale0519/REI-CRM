import React, { useState, useEffect } from 'react';
import { FiUsers, FiX, FiMail, FiTrash2, FiEdit2, FiRefreshCw } from 'react-icons/fi';
import { TeamService, TeamMember, InviteData } from '@/services/team.service';
import { usePermissions } from '@/contexts/PermissionContext';
import { Permissions } from '@/types/roles.types';

interface TeamManagementModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const TeamManagementModal: React.FC<TeamManagementModalProps> = ({ isOpen, onClose }) => {
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showInviteForm, setShowInviteForm] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState('member');
  const { hasPermission } = usePermissions();

  // Load team members
  useEffect(() => {
    if (isOpen) {
      loadTeamMembers();
    }
  }, [isOpen]);

  const loadTeamMembers = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const { data, error } = await TeamService.getTeamMembers();
      if (error) throw error;
      if (data) setTeamMembers(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load team members');
    } finally {
      setIsLoading(false);
    }
  };

  const handleInviteMember = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const inviteData: InviteData = {
        email: inviteEmail,
        role: inviteRole,
      };

      const { error } = await TeamService.inviteMember(inviteData);
      if (error) throw error;

      // Clear form and reload members
      setInviteEmail('');
      setInviteRole('member');
      setShowInviteForm(false);
      await loadTeamMembers();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to invite team member');
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateRole = async (memberId: string, newRole: string) => {
    setIsLoading(true);
    setError(null);

    try {
      const { error } = await TeamService.updateMemberRole(memberId, newRole);
      if (error) throw error;
      await loadTeamMembers();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update role');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRemoveMember = async (memberId: string) => {
    if (!window.confirm('Are you sure you want to remove this team member?')) return;

    setIsLoading(true);
    setError(null);

    try {
      const { error } = await TeamService.removeMember(memberId);
      if (error) throw error;
      await loadTeamMembers();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to remove team member');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendInvitation = async (email: string) => {
    setIsLoading(true);
    setError(null);

    try {
      const { error } = await TeamService.resendInvitation(email);
      if (error) throw error;
      // Show success message
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to resend invitation');
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center">
            <FiUsers className="text-blue-500 mr-2" size={24} />
            <h2 className="text-2xl font-semibold text-gray-900">Team Management</h2>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-500 transition-colors"
          >
            <FiX size={24} />
          </button>
        </div>

        {error && (
          <div className="mb-4 p-4 bg-red-50 text-red-600 rounded-md">
            {error}
          </div>
        )}

        {/* Invite Member Form */}
        {hasPermission(Permissions.INVITE_USERS) && (
          <div className="mb-6">
            {showInviteForm ? (
              <form onSubmit={handleInviteMember} className="space-y-4">
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                    Email Address
                  </label>
                  <input
                    type="email"
                    id="email"
                    value={inviteEmail}
                    onChange={(e) => setInviteEmail(e.target.value)}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    required
                  />
                </div>

                <div>
                  <label htmlFor="role" className="block text-sm font-medium text-gray-700">
                    Role
                  </label>
                  <select
                    id="role"
                    value={inviteRole}
                    onChange={(e) => setInviteRole(e.target.value)}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  >
                    <option value="member">Member</option>
                    <option value="admin">Admin</option>
                    <option value="manager">Manager</option>
                  </select>
                </div>

                <div className="flex justify-end space-x-3">
                  <button
                    type="button"
                    onClick={() => setShowInviteForm(false)}
                    className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isLoading}
                    className={`px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 ${
                      isLoading ? 'opacity-50 cursor-not-allowed' : ''
                    }`}
                  >
                    {isLoading ? 'Inviting...' : 'Send Invitation'}
                  </button>
                </div>
              </form>
            ) : (
              <button
                onClick={() => setShowInviteForm(true)}
                className="flex items-center px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
              >
                <FiMail className="mr-2" size={16} />
                Invite New Member
              </button>
            )}
          </div>
        )}

        {/* Team Members List */}
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Member
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Role
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {teamMembers.map((member) => (
                <tr key={member.id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="h-10 w-10 flex-shrink-0">
                        {member.avatar_url ? (
                          <img
                            className="h-10 w-10 rounded-full"
                            src={member.avatar_url}
                            alt=""
                          />
                        ) : (
                          <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center">
                            <span className="text-gray-500 font-medium">
                              {member.first_name?.[0]}
                              {member.last_name?.[0]}
                            </span>
                          </div>
                        )}
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">
                          {member.first_name} {member.last_name}
                        </div>
                        <div className="text-sm text-gray-500">
                          {member.email}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {hasPermission(Permissions.MANAGE_ROLES) ? (
                      <select
                        value={member.role}
                        onChange={(e) => handleUpdateRole(member.id, e.target.value)}
                        className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                      >
                        <option value="member">Member</option>
                        <option value="admin">Admin</option>
                        <option value="manager">Manager</option>
                      </select>
                    ) : (
                      <span className="text-sm text-gray-900">{member.role}</span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      member.status === 'active'
                        ? 'bg-green-100 text-green-800'
                        : member.status === 'invited'
                        ? 'bg-yellow-100 text-yellow-800'
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      {member.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex items-center space-x-3">
                      {member.status === 'invited' && (
                        <button
                          onClick={() => handleResendInvitation(member.email)}
                          className="text-blue-600 hover:text-blue-900"
                          title="Resend Invitation"
                        >
                          <FiRefreshCw size={16} />
                        </button>
                      )}
                      {hasPermission(Permissions.MANAGE_USERS) && (
                        <>
                          <button
                            onClick={() => handleUpdateRole(member.id, member.role)}
                            className="text-blue-600 hover:text-blue-900"
                            title="Edit Member"
                          >
                            <FiEdit2 size={16} />
                          </button>
                          <button
                            onClick={() => handleRemoveMember(member.id)}
                            className="text-red-600 hover:text-red-900"
                            title="Remove Member"
                          >
                            <FiTrash2 size={16} />
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default TeamManagementModal; 