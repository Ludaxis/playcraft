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
    <div className="relative w-full max-w-[300px] bg-bg-card rounded-2xl border-2 border-border overflow-hidden">
      {/* Header */}
      <div className="bg-bg-inverse py-3 px-4 flex items-center justify-between">
        <h2 className="text-text-inverse text-h3">Save Your Progress</h2>
        <button
          onClick={handleClose}
          className="w-8 h-8 bg-bg-muted rounded-full flex items-center justify-center border border-border hover:opacity-80"
        >
          <span className="text-text-primary font-bold">X</span>
        </button>
      </div>

        {/* Content */}
        <div className="p-4 bg-bg-card">
          {/* Info Text */}
          <p className="text-text-secondary text-caption text-center mb-4">
            Sign in to save your progress and play on multiple devices!
          </p>

          {/* Sign In Options */}
          <div className="space-y-3">
            {/* Facebook */}
            <button className="w-full flex items-center gap-3 bg-bg-muted hover:bg-bg-page rounded-xl py-3 px-4 border border-border">
              <div className="w-8 h-8 bg-bg-page rounded-lg flex items-center justify-center border border-border">
                <Image
                  src="/icons/Facebook.svg"
                  alt="Facebook"
                  width={20}
                  height={20}
                  className="opacity-80"
                />
              </div>
              <span className="text-text-primary font-bold">Sign in with Facebook</span>
            </button>

            {/* Google */}
            <button className="w-full flex items-center gap-3 bg-bg-muted hover:bg-bg-page rounded-xl py-3 px-4 border border-border">
              <div className="w-8 h-8 bg-bg-page rounded-lg flex items-center justify-center border border-border">
                <Image
                  src="/icons/Google.svg"
                  alt="Google"
                  width={20}
                  height={20}
                  className="opacity-80"
                />
              </div>
              <span className="text-text-primary font-bold">Sign in with Google</span>
            </button>

            {/* Apple (placeholder) */}
            <button className="w-full flex items-center gap-3 bg-bg-muted hover:bg-bg-page rounded-xl py-3 px-4 border border-border">
              <div className="w-8 h-8 bg-bg-page rounded-lg flex items-center justify-center border border-border">
                <span className="text-text-secondary font-bold text-value">A</span>
              </div>
              <span className="text-text-primary font-bold">Sign in with Apple</span>
            </button>
          </div>

        {/* Privacy Note */}
        <p className="text-text-muted text-mini text-center mt-4">
          By signing in, you agree to our Terms of Service and Privacy Policy
        </p>
      </div>
    </div>
  );
}
