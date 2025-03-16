import React, { useState } from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  helperText?: string;
  showCharCount?: boolean;
  maxLength?: number;
}

const Input: React.FC<InputProps> = ({
  label,
  error,
  leftIcon,
  rightIcon,
  helperText,
  showCharCount,
  maxLength,
  className = '',
  ...props
}) => {
  const [isFocused, setIsFocused] = useState(false);
  const charCount = props.value?.toString().length || 0;

  return (
    <div className="w-full">
      {/* Label with optional character count */}
      {(label || (showCharCount && maxLength)) && (
        <div className="flex justify-between items-center mb-1.5">
          {label && (
            <label className="block text-sm font-medium text-gray-700">
              {label}
            </label>
          )}
          {showCharCount && maxLength && (
            <span className="text-xs text-gray-500">
              {charCount}/{maxLength}
            </span>
          )}
        </div>
      )}

      {/* Input container */}
      <div className="relative">
        {/* Left icon */}
        {leftIcon && (
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-500">
            {leftIcon}
          </div>
        )}

        {/* Input field */}
        <input
          className={`
            peer
            ${leftIcon ? 'pl-10' : ''}
            ${rightIcon ? 'pr-10' : ''}
            ${error ? 'border-red-300 focus:border-red-500 focus:ring-red-100' : ''}
            ${className}
          `}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          {...props}
        />

        {/* Right icon */}
        {rightIcon && (
          <div className={`
            absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none
            ${isFocused ? 'text-blue-500' : 'text-gray-500'}
          `}>
            {rightIcon}
          </div>
        )}
      </div>

      {/* Error or helper text */}
      {(error || helperText) && (
        <div className="mt-1.5">
          {error && (
            <p className="text-sm text-red-600">{error}</p>
          )}
          {!error && helperText && (
            <p className="text-sm text-gray-500">{helperText}</p>
          )}
        </div>
      )}
    </div>
  );
};

export default Input;
