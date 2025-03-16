import React, { useState } from 'react';
import { FiLock, FiX } from 'react-icons/fi';
import { SecurityService } from '@/services/security.service';

interface TwoFactorSetupModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const TwoFactorSetupModal: React.FC<TwoFactorSetupModalProps> = ({ isOpen, onClose }) => {
  const [step, setStep] = useState<'setup' | 'verify'>('setup');
  const [qrCode, setQrCode] = useState<string | null>(null);
  const [secret, setSecret] = useState<string | null>(null);
  const [verificationCode, setVerificationCode] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSetup = async () => {
    setError(null);
    setIsLoading(true);

    try {
      const { data, error } = await SecurityService.setupTwoFactor();
      if (error) throw new Error(error);
      if (!data) throw new Error('Failed to get 2FA setup data');

      setQrCode(data.qrCode);
      setSecret(data.secret);
      setStep('verify');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to setup 2FA');
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!secret) return;

    setError(null);
    setIsLoading(true);

    try {
      const { error } = await SecurityService.verifyAndEnableTwoFactor(verificationCode, secret);
      if (error) throw new Error(error);

      // Clear state and close modal
      setVerificationCode('');
      setQrCode(null);
      setSecret(null);
      setStep('setup');
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to verify 2FA');
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    setVerificationCode('');
    setQrCode(null);
    setSecret(null);
    setStep('setup');
    setError(null);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center">
            <FiLock className="text-blue-500 mr-2" size={20} />
            <h2 className="text-xl font-semibold text-gray-900">
              {step === 'setup' ? 'Enable Two-Factor Authentication' : 'Verify Two-Factor Authentication'}
            </h2>
          </div>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-500 transition-colors"
          >
            <FiX size={20} />
          </button>
        </div>

        {error && (
          <div className="mb-4 p-4 bg-red-50 text-red-600 rounded-md">
            {error}
          </div>
        )}

        {step === 'setup' ? (
          <div className="space-y-4">
            <p className="text-gray-600">
              Two-factor authentication adds an extra layer of security to your account.
              Once enabled, you'll need to enter a verification code from your authenticator
              app when signing in.
            </p>

            <div className="flex justify-end space-x-3 mt-6">
              <button
                type="button"
                onClick={handleClose}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSetup}
                disabled={isLoading}
                className={`px-4 py-2 border border-transparent rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${
                  isLoading ? 'opacity-50 cursor-not-allowed' : ''
                }`}
              >
                {isLoading ? 'Setting up...' : 'Continue'}
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleVerify} className="space-y-4">
            <div className="flex justify-center mb-4">
              {qrCode && (
                <img
                  src={qrCode}
                  alt="QR Code for 2FA"
                  className="w-48 h-48"
                />
              )}
            </div>

            <p className="text-gray-600 text-sm">
              1. Scan the QR code with your authenticator app (e.g., Google Authenticator,
              Authy, or 1Password).
              <br />
              2. Enter the verification code shown in your app below.
            </p>

            <div>
              <label htmlFor="verificationCode" className="block text-sm font-medium text-gray-700">
                Verification Code
              </label>
              <input
                type="text"
                id="verificationCode"
                value={verificationCode}
                onChange={(e) => setVerificationCode(e.target.value)}
                placeholder="Enter 6-digit code"
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                required
                pattern="[0-9]{6}"
                maxLength={6}
              />
            </div>

            <div className="flex justify-end space-x-3 mt-6">
              <button
                type="button"
                onClick={handleClose}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isLoading || verificationCode.length !== 6}
                className={`px-4 py-2 border border-transparent rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${
                  (isLoading || verificationCode.length !== 6) ? 'opacity-50 cursor-not-allowed' : ''
                }`}
              >
                {isLoading ? 'Verifying...' : 'Enable 2FA'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default TwoFactorSetupModal; 