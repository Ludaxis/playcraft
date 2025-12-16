'use client';

import React from 'react';
import Image from 'next/image';
import { useNavigation } from '@/store';

interface PrivacyPolicyModalProps {
  onAnimatedClose?: () => void;
}

export function PrivacyPolicyModal({ onAnimatedClose }: PrivacyPolicyModalProps) {
  const { closeModal } = useNavigation();

  const handleClose = () => {
    if (onAnimatedClose) {
      onAnimatedClose();
    } else {
      closeModal();
    }
  };

  return (
    <div className="relative w-[320px] max-h-[80vh] bg-secondary-light rounded-2xl border-4 border-surface-dark overflow-hidden flex flex-col">
      {/* Header */}
      <div className="bg-secondary py-3 px-4 flex items-center justify-between">
        <h2 className="text-white text-lg font-bold">Terms & Privacy</h2>
        <button
          onClick={handleClose}
          className="w-8 h-8 bg-error rounded-full flex items-center justify-center border-2 border-error-light"
        >
          <span className="text-white font-bold">X</span>
        </button>
      </div>

        {/* Content - Scrollable */}
        <div className="flex-1 overflow-y-auto p-4">
          {/* Terms of Service */}
          <div className="mb-4">
            <div className="flex items-center gap-2 mb-2">
              <Image
                src="/icons/Document-Text.svg"
                alt="Terms"
                width={20}
                height={20}
                className="opacity-70"
              />
              <h3 className="text-surface font-bold">Terms of Service</h3>
            </div>
            <div className="bg-surface-dark rounded-xl p-3 border-2 border-surface">
              <p className="text-primary-light text-xs leading-relaxed">
                By using this application, you agree to our terms of service.
                This is a prototype application for demonstration purposes only.
                Game data may be reset at any time. Virtual currency has no real-world value.
              </p>
              <button className="mt-2 text-secondary text-xs font-bold underline">
                Read Full Terms
              </button>
            </div>
          </div>

          {/* Privacy Policy */}
          <div className="mb-4">
            <div className="flex items-center gap-2 mb-2">
              <Image
                src="/icons/Security.svg"
                alt="Privacy"
                width={20}
                height={20}
                className="opacity-70"
              />
              <h3 className="text-surface font-bold">Privacy Policy</h3>
            </div>
            <div className="bg-surface-dark rounded-xl p-3 border-2 border-surface">
              <p className="text-primary-light text-xs leading-relaxed">
                We respect your privacy. Your personal data is stored locally on your device.
                We do not sell or share your data with third parties.
                Analytics may be collected to improve the game experience.
              </p>
              <button className="mt-2 text-secondary text-xs font-bold underline">
                Read Full Policy
              </button>
            </div>
          </div>

          {/* Data Collection */}
          <div className="mb-4">
            <div className="flex items-center gap-2 mb-2">
              <Image
                src="/icons/Chart.svg"
                alt="Data"
                width={20}
                height={20}
                className="opacity-70"
              />
              <h3 className="text-surface font-bold">Data Collection</h3>
            </div>
            <div className="bg-surface-dark rounded-xl p-3 border-2 border-surface">
              <ul className="text-primary-light text-xs space-y-1">
                <li>- Game progress and scores</li>
                <li>- Device information</li>
                <li>- Usage statistics</li>
                <li>- Crash reports</li>
              </ul>
            </div>
          </div>

          {/* Contact */}
          <div className="mb-4">
            <div className="flex items-center gap-2 mb-2">
              <Image
                src="/icons/Mail.svg"
                alt="Contact"
                width={20}
                height={20}
                className="opacity-70"
              />
              <h3 className="text-surface font-bold">Contact Us</h3>
            </div>
            <div className="bg-surface-dark rounded-xl p-3 border-2 border-surface">
              <p className="text-primary-light text-xs">
                For privacy concerns or data deletion requests, contact us at:
              </p>
              <p className="text-secondary text-xs font-bold mt-1">
                privacy@example.com
              </p>
            </div>
          </div>
        </div>

      {/* Accept Button */}
      <div className="p-4 bg-secondary-light border-t-2 border-surface-dark">
        <button
          onClick={handleClose}
          className="w-full bg-surface-dark hover:bg-surface rounded-xl py-3 border-2 border-surface"
        >
          <span className="text-primary-light font-bold">I Understand</span>
        </button>
      </div>
    </div>
  );
}
