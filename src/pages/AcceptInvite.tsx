import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { FiCheck, FiX, FiLoader } from 'react-icons/fi';

const AcceptInvite: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [companyName, setCompanyName] = useState('');

  const token = searchParams.get('token');
  const companyId = searchParams.get('company');

  useEffect(() => {
    validateInvitation();
  }, [token, companyId]);

  const validateInvitation = async () => {
    if (!token || !companyId) {
      setError('Invalid invitation link');
      setIsLoading(false);
      return;
    }

    try {
      // Check if the invitation exists and is valid
      const { data: member, error: memberError } = await supabase
        .from('team_members')
        .select('status, role')
        .eq('id', token)
        .eq('company_id', companyId)
        .single();

      if (memberError) throw memberError;
      if (!member) throw new Error('Invitation not found');
      if (member.status === 'active') throw new Error('Invitation has already been accepted');

      // Get company name
      const { data: company, error: companyError } = await supabase
        .from('companies')
        .select('name')
        .eq('id', companyId)
        .single();

      if (companyError) throw companyError;
      if (!company) throw new Error('Company not found');

      setCompanyName(company.name);
      setIsLoading(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to validate invitation');
      setIsLoading(false);
    }
  };

  const handleAcceptInvitation = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      setIsLoading(false);
      return;
    }

    if (password.length < 8) {
      setError('Password must be at least 8 characters long');
      setIsLoading(false);
      return;
    }

    try {
      // Update the user's password
      const { error: updateError } = await supabase.auth
        .updateUser({ password });

      if (updateError) throw updateError;

      // Update team member status
      const { error: memberError } = await supabase
        .from('team_members')
        .update({ status: 'active' })
        .eq('id', token)
        .eq('company_id', companyId);

      if (memberError) throw memberError;

      setSuccess(true);
      setTimeout(() => {
        navigate('/dashboard');
      }, 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to accept invitation');
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="flex items-center space-x-2">
          <FiLoader className="animate-spin h-5 w-5 text-blue-500" />
          <span className="text-gray-600">Validating invitation...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        {error ? (
          <div className="rounded-md bg-red-50 p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <FiX className="h-5 w-5 text-red-400" />
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800">Error</h3>
                <div className="mt-2 text-sm text-red-700">{error}</div>
              </div>
            </div>
          </div>
        ) : success ? (
          <div className="rounded-md bg-green-50 p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <FiCheck className="h-5 w-5 text-green-400" />
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-green-800">Success!</h3>
                <div className="mt-2 text-sm text-green-700">
                  You have successfully joined {companyName}. Redirecting to dashboard...
                </div>
              </div>
            </div>
          </div>
        ) : (
          <>
            <div>
              <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
                Join {companyName}
              </h2>
              <p className="mt-2 text-center text-sm text-gray-600">
                Please set your password to complete your account setup
              </p>
            </div>
            <form className="mt-8 space-y-6" onSubmit={handleAcceptInvitation}>
              <div className="rounded-md shadow-sm -space-y-px">
                <div>
                  <label htmlFor="password" className="sr-only">
                    Password
                  </label>
                  <input
                    id="password"
                    name="password"
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                    placeholder="Password"
                    minLength={8}
                  />
                </div>
                <div>
                  <label htmlFor="confirm-password" className="sr-only">
                    Confirm Password
                  </label>
                  <input
                    id="confirm-password"
                    name="confirm-password"
                    type="password"
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                    placeholder="Confirm Password"
                    minLength={8}
                  />
                </div>
              </div>

              <div>
                <button
                  type="submit"
                  disabled={isLoading}
                  className={`group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${
                    isLoading ? 'opacity-50 cursor-not-allowed' : ''
                  }`}
                >
                  {isLoading ? (
                    <div className="flex items-center">
                      <FiLoader className="animate-spin -ml-1 mr-2 h-4 w-4" />
                      Processing...
                    </div>
                  ) : (
                    'Accept Invitation'
                  )}
                </button>
              </div>
            </form>
          </>
        )}
      </div>
    </div>
  );
};

export default AcceptInvite; 