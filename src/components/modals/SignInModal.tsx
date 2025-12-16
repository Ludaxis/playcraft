'use client';

import React from 'react';
import Image from 'next/image';
import { useNavigation } from '@/store';

interface SignInModalProps {
  onAnimatedClose?: () => void;
}

export function SignInModal({ onAnimatedClose }: SignInModalProps) {
  const { closeModal } = useNavigation();

  const handleClose = () => {
    if (onAnimatedClose) {
      onAnimatedClose();
    } else {
      closeModal();
    }
  };

  return (
    <div className="relative w-[300px] bg-secondary-light rounded-2xl border-4 border-surface-dark overflow-hidden">
      {/* Header */}
      <div className="bg-secondary py-3 px-4 flex items-center justify-between">
        <h2 className="text-white text-lg font-bold">Save Your Progress</h2>
        <button
          onClick={handleClose}
          className="w-8 h-8 bg-error rounded-full flex items-center justify-center border-2 border-error-light"
        >
          <span className="text-white font-bold">X</span>
        </button>
      </div>

        {/* Content */}
        <div className="p-4">
          {/* Info Text */}
          <p className="text-surface text-sm text-center mb-4">
            Sign in to save your progress and play on multiple devices!
          </p>

          {/* Sign In Options */}
          <div className="space-y-3">
            {/* Facebook */}
            <button className="w-full flex items-center gap-3 bg-surface-dark hover:bg-surface rounded-xl py-3 px-4 border-2 border-surface">
              <div className="w-8 h-8 bg-secondary-light rounded-lg flex items-center justify-center">
                <Image
                  src="/icons/Facebook.svg"
                  alt="Facebook"
                  width={20}
                  height={20}
                  className="opacity-80"
                />
              </div>
              <span className="text-primary-light font-bold">Sign in with Facebook</span>
            </button>

            {/* Google */}
            <button className="w-full flex items-center gap-3 bg-surface-dark hover:bg-surface rounded-xl py-3 px-4 border-2 border-surface">
              <div className="w-8 h-8 bg-secondary-light rounded-lg flex items-center justify-center">
                <Image
                  src="/icons/Google.svg"
                  alt="Google"
                  width={20}
                  height={20}
                  className="opacity-80"
                />
              </div>
              <span className="text-primary-light font-bold">Sign in with Google</span>
            </button>

            {/* Apple (placeholder) */}
            <button className="w-full flex items-center gap-3 bg-surface-dark hover:bg-surface rounded-xl py-3 px-4 border-2 border-surface">
              <div className="w-8 h-8 bg-secondary-light rounded-lg flex items-center justify-center">
                <span className="text-surface font-bold text-lg">A</span>
              </div>
              <span className="text-primary-light font-bold">Sign in with Apple</span>
            </button>
          </div>

        {/* Privacy Note */}
        <p className="text-surface-dark text-xs text-center mt-4">
          By signing in, you agree to our Terms of Service and Privacy Policy
        </p>
      </div>
    </div>
  );
}
