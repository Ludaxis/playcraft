'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { useNavigation } from '@/store';

interface ParentalControlModalProps {
  onAnimatedClose?: () => void;
}

export function ParentalControlModal({ onAnimatedClose }: ParentalControlModalProps) {
  const { closeModal } = useNavigation();
  const [purchasesEnabled, setPurchasesEnabled] = useState(true);
  const [adsEnabled, setAdsEnabled] = useState(true);

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
        <h2 className="text-text-inverse text-h3">Parental Control</h2>
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
            Control your child&apos;s gaming experience with these settings.
          </p>

          {/* Settings */}
          <div className="space-y-3">
            {/* In-App Purchases */}
            <div className="flex items-center justify-between bg-bg-muted rounded-xl p-3 border border-border">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-bg-page rounded-lg flex items-center justify-center border border-border">
                  <Image
                    src="/icons/Reserve.svg"
                    alt="Purchases"
                    width={24}
                    height={24}
                    className="opacity-70"
                  />
                </div>
                <div>
                  <p className="text-text-primary text-value">In-App Purchases</p>
                  <p className="text-text-secondary text-mini">Require PIN for purchases</p>
                </div>
              </div>
              <button
                onClick={() => setPurchasesEnabled(!purchasesEnabled)}
                className={`w-12 h-7 rounded-full border transition-colors ${
                  purchasesEnabled
                    ? 'bg-bg-inverse border-border'
                    : 'bg-bg-page border-border'
                }`}
              >
                <div
                  className={`w-5 h-5 bg-bg-muted rounded-full transition-transform border border-border ${
                    purchasesEnabled ? 'translate-x-5' : 'translate-x-0.5'
                  }`}
                />
              </button>
            </div>

            {/* Personalized Ads */}
            <div className="flex items-center justify-between bg-bg-muted rounded-xl p-3 border border-border">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-bg-page rounded-lg flex items-center justify-center border border-border">
                  <Image
                    src="/icons/Eye-Slash.svg"
                    alt="Ads"
                    width={24}
                    height={24}
                    className="opacity-70"
                  />
                </div>
                <div>
                  <p className="text-text-primary text-value">Personalized Ads</p>
                  <p className="text-text-secondary text-mini">Show targeted advertisements</p>
                </div>
              </div>
              <button
                onClick={() => setAdsEnabled(!adsEnabled)}
                className={`w-12 h-7 rounded-full border transition-colors ${
                  adsEnabled
                    ? 'bg-bg-inverse border-border'
                    : 'bg-bg-page border-border'
                }`}
              >
                <div
                  className={`w-5 h-5 bg-bg-muted rounded-full transition-transform border border-border ${
                    adsEnabled ? 'translate-x-5' : 'translate-x-0.5'
                  }`}
                />
              </button>
            </div>

            {/* Set PIN Button */}
            <button className="w-full flex items-center justify-center gap-2 bg-bg-muted hover:bg-bg-page rounded-xl py-3 px-4 border border-border mt-4">
              <Image
                src="/icons/Lock.svg"
                alt="PIN"
                width={20}
                height={20}
                className="opacity-70"
              />
              <span className="text-text-primary font-bold">Set PIN Code</span>
            </button>
          </div>

        {/* Privacy Note */}
        <p className="text-text-muted text-mini text-center mt-4">
          These settings help protect younger players from unintended purchases.
        </p>
      </div>
    </div>
  );
}
