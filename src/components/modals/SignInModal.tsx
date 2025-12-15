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
    <div className="relative w-[300px] bg-slate-500 rounded-2xl border-4 border-slate-400 overflow-hidden">
      {/* Header */}
      <div className="bg-slate-600 py-3 px-4 flex items-center justify-between">
        <h2 className="text-white text-lg font-bold">Save Your Progress</h2>
        <button
          onClick={handleClose}
          className="w-8 h-8 bg-red-500 rounded-full flex items-center justify-center border-2 border-red-400"
        >
          <span className="text-white font-bold">X</span>
        </button>
      </div>

        {/* Content */}
        <div className="p-4">
          {/* Info Text */}
          <p className="text-slate-300 text-sm text-center mb-4">
            Sign in to save your progress and play on multiple devices!
          </p>

          {/* Sign In Options */}
          <div className="space-y-3">
            {/* Facebook */}
            <button className="w-full flex items-center gap-3 bg-slate-400 hover:bg-slate-350 rounded-xl py-3 px-4 border-2 border-slate-300">
              <div className="w-8 h-8 bg-slate-500 rounded-lg flex items-center justify-center">
                <Image
                  src="/icons/Facebook.svg"
                  alt="Facebook"
                  width={20}
                  height={20}
                  className="opacity-80"
                />
              </div>
              <span className="text-slate-700 font-bold">Sign in with Facebook</span>
            </button>

            {/* Google */}
            <button className="w-full flex items-center gap-3 bg-slate-400 hover:bg-slate-350 rounded-xl py-3 px-4 border-2 border-slate-300">
              <div className="w-8 h-8 bg-slate-500 rounded-lg flex items-center justify-center">
                <Image
                  src="/icons/Google.svg"
                  alt="Google"
                  width={20}
                  height={20}
                  className="opacity-80"
                />
              </div>
              <span className="text-slate-700 font-bold">Sign in with Google</span>
            </button>

            {/* Apple (placeholder) */}
            <button className="w-full flex items-center gap-3 bg-slate-400 hover:bg-slate-350 rounded-xl py-3 px-4 border-2 border-slate-300">
              <div className="w-8 h-8 bg-slate-500 rounded-lg flex items-center justify-center">
                <span className="text-slate-300 font-bold text-lg">A</span>
              </div>
              <span className="text-slate-700 font-bold">Sign in with Apple</span>
            </button>
          </div>

        {/* Privacy Note */}
        <p className="text-slate-400 text-xs text-center mt-4">
          By signing in, you agree to our Terms of Service and Privacy Policy
        </p>
      </div>
    </div>
  );
}
