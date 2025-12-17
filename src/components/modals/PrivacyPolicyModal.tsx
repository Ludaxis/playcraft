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
    <div className="relative w-[320px] max-h-[80vh] bg-brand-muted rounded-2xl border-4 border-border-strong overflow-hidden flex flex-col">
      {/* Header */}
      <div className="bg-bg-inverse py-3 px-4 flex items-center justify-between">
        <h2 className="text-text-inverse text-h3">Terms & Privacy</h2>
        <button
          onClick={handleClose}
          className="w-8 h-8 bg-status-error rounded-full flex items-center justify-center border-2 border-error-light"
        >
          <span className="text-text-inverse font-bold">X</span>
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
              <h3 className="text-text-primary font-bold">Terms of Service</h3>
            </div>
            <div className="bg-border-strong rounded-xl p-3 border-2 border-border">
              <p className="text-text-secondary text-xs leading-relaxed">
                By using this application, you agree to our terms of service.
                This is a prototype application for demonstration purposes only.
                Game data may be reset at any time. Virtual currency has no real-world value.
              </p>
              <button className="mt-2 text-text-secondary text-value-sm underline">
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
              <h3 className="text-text-primary font-bold">Privacy Policy</h3>
            </div>
            <div className="bg-border-strong rounded-xl p-3 border-2 border-border">
              <p className="text-text-secondary text-xs leading-relaxed">
                We respect your privacy. Your personal data is stored locally on your device.
                We do not sell or share your data with third parties.
                Analytics may be collected to improve the game experience.
              </p>
              <button className="mt-2 text-text-secondary text-value-sm underline">
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
              <h3 className="text-text-primary font-bold">Data Collection</h3>
            </div>
            <div className="bg-border-strong rounded-xl p-3 border-2 border-border">
              <ul className="text-text-secondary text-xs space-y-1">
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
              <h3 className="text-text-primary font-bold">Contact Us</h3>
            </div>
            <div className="bg-border-strong rounded-xl p-3 border-2 border-border">
              <p className="text-text-secondary text-xs">
                For privacy concerns or data deletion requests, contact us at:
              </p>
              <p className="text-text-secondary text-value-sm mt-1">
                privacy@example.com
              </p>
            </div>
          </div>
        </div>

      {/* Accept Button */}
      <div className="p-4 bg-brand-muted border-t-2 border-border-strong">
        <button
          onClick={handleClose}
          className="w-full bg-border-strong hover:bg-bg-muted rounded-xl py-3 border-2 border-border"
        >
          <span className="text-text-primary font-bold">I Understand</span>
        </button>
      </div>
    </div>
  );
}
