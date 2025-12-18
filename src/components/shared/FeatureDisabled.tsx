'use client';

import React from 'react';
import { useTranslations } from 'next-intl';
import { useNavigation } from '@/store';
import { Button } from '@/components/base';

interface FeatureDisabledProps {
  /** Display name of the feature */
  featureName: string;
  /** Optional custom message */
  message?: string;
}

/**
 * FeatureDisabled Component
 *
 * Displays a friendly message when a feature is disabled via feature flags.
 * Used by pages/components that check isFeatureEnabled() and need a fallback UI.
 *
 * @example
 * if (!isFeatureEnabled('SHOP')) {
 *   return <FeatureDisabled featureName="Shop" />;
 * }
 */
export function FeatureDisabled({ featureName, message }: FeatureDisabledProps) {
  const { navigate } = useNavigation();
  const t = useTranslations('featureDisabled');

  return (
    <div className="flex flex-col h-full bg-bg-page items-center justify-center p-8 text-center">
      <div className="w-16 h-16 bg-bg-muted rounded-full flex items-center justify-center mb-4 border-2 border-border">
        <img src="/icons/Lock.svg" alt="" className="w-8 h-8 opacity-50" />
      </div>
      <h2 className="text-h3 text-text-primary mb-2">{t('title')}</h2>
      <p className="text-body text-text-secondary mb-6 max-w-xs">
        {message || t('message', { featureName })}
      </p>
      <Button variant="outline" onClick={() => navigate('main-menu')}>
        {t('backToHome')}
      </Button>
    </div>
  );
}

export default FeatureDisabled;
