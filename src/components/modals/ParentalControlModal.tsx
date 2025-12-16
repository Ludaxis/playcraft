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
    <div className="relative w-[300px] bg-secondary-light rounded-2xl border-4 border-surface-dark overflow-hidden">
      {/* Header */}
      <div className="bg-secondary py-3 px-4 flex items-center justify-between">
        <h2 className="text-white text-lg font-bold">Parental Control</h2>
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
            Control your child's gaming experience with these settings.
          </p>

          {/* Settings */}
          <div className="space-y-3">
            {/* In-App Purchases */}
            <div className="flex items-center justify-between bg-surface-dark rounded-xl p-3 border-2 border-surface">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-secondary-light rounded-lg flex items-center justify-center">
                  <Image
                    src="/icons/Reserve.svg"
                    alt="Purchases"
                    width={24}
                    height={24}
                    className="opacity-70"
                  />
                </div>
                <div>
                  <p className="text-primary-light text-sm font-bold">In-App Purchases</p>
                  <p className="text-secondary text-xs">Require PIN for purchases</p>
                </div>
              </div>
              <button
                onClick={() => setPurchasesEnabled(!purchasesEnabled)}
                className={`w-12 h-7 rounded-full border-2 transition-colors ${
                  purchasesEnabled
                    ? 'bg-surface border-surface-light'
                    : 'bg-secondary border-secondary-light'
                }`}
              >
                <div
                  className={`w-5 h-5 bg-secondary-light rounded-full transition-transform ${
                    purchasesEnabled ? 'translate-x-5' : 'translate-x-0.5'
                  }`}
                />
              </button>
            </div>

            {/* Personalized Ads */}
            <div className="flex items-center justify-between bg-surface-dark rounded-xl p-3 border-2 border-surface">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-secondary-light rounded-lg flex items-center justify-center">
                  <Image
                    src="/icons/Eye-Slash.svg"
                    alt="Ads"
                    width={24}
                    height={24}
                    className="opacity-70"
                  />
                </div>
                <div>
                  <p className="text-primary-light text-sm font-bold">Personalized Ads</p>
                  <p className="text-secondary text-xs">Show targeted advertisements</p>
                </div>
              </div>
              <button
                onClick={() => setAdsEnabled(!adsEnabled)}
                className={`w-12 h-7 rounded-full border-2 transition-colors ${
                  adsEnabled
                    ? 'bg-surface border-surface-light'
                    : 'bg-secondary border-secondary-light'
                }`}
              >
                <div
                  className={`w-5 h-5 bg-secondary-light rounded-full transition-transform ${
                    adsEnabled ? 'translate-x-5' : 'translate-x-0.5'
                  }`}
                />
              </button>
            </div>

            {/* Set PIN Button */}
            <button className="w-full flex items-center justify-center gap-2 bg-surface-dark hover:bg-surface rounded-xl py-3 px-4 border-2 border-surface mt-4">
              <Image
                src="/icons/Lock.svg"
                alt="PIN"
                width={20}
                height={20}
                className="opacity-70"
              />
              <span className="text-primary-light font-bold">Set PIN Code</span>
            </button>
          </div>

        {/* Privacy Note */}
        <p className="text-surface-dark text-xs text-center mt-4">
          These settings help protect younger players from unintended purchases.
        </p>
      </div>
    </div>
  );
}
