'use client';

import React, { useRef, useEffect, useCallback } from 'react';
import gsap from 'gsap';
import { useNavigation } from '@/store';
import type { ModalId } from '@/types';

// Modal components
import { LevelStartModal } from './LevelStartModal';
import { LevelCompleteModal } from './LevelCompleteModal';
import { LevelFailedModal } from './LevelFailedModal';
import { OutOfLivesModal } from './OutOfLivesModal';
import { RewardClaimModal } from './RewardClaimModal';
import { BoosterSelectModal } from './BoosterSelectModal';
import { FreeLivesModal } from './FreeLivesModal';
import { ProfilePictureModal } from './ProfilePictureModal';
import { EditAvatarModal } from './EditAvatarModal';
import { StarInfoModal } from './StarInfoModal';
import { SignInModal } from './SignInModal';
import { ParentalControlModal } from './ParentalControlModal';
import { PrivacyPolicyModal } from './PrivacyPolicyModal';
import { ChangeUsernameModal } from './ChangeUsernameModal';
import { CardStarsModal } from './CardStarsModal';
import { CollectionInfoModal } from './CollectionInfoModal';
import { GrandPrizeModal } from './GrandPrizeModal';
import { CollectionSetDetailModal } from './CollectionSetDetailModal';
import { CardDetailModal } from './CardDetailModal';
import { ProfileModal } from './ProfileModal';
import { TeamInfoModal } from './TeamInfoModal';
import { MemberProfileModal } from './MemberProfileModal';
import { WeeklyContestInfoModal } from './WeeklyContestInfoModal';

const modalComponents: Partial<Record<NonNullable<ModalId>, React.ComponentType<{ onAnimatedClose?: () => void }>>> = {
  'level-start': LevelStartModal,
  'level-complete': LevelCompleteModal,
  'level-failed': LevelFailedModal,
  'out-of-lives': OutOfLivesModal,
  'reward-claim': RewardClaimModal,
  'booster-select': BoosterSelectModal,
  'free-lives': FreeLivesModal,
  'profile-picture': ProfilePictureModal,
  'edit-avatar': EditAvatarModal,
  'star-info': StarInfoModal,
  'sign-in': SignInModal,
  'parental-control': ParentalControlModal,
  'privacy-policy': PrivacyPolicyModal,
  'change-username': ChangeUsernameModal,
  'card-stars': CardStarsModal,
  'collection-info': CollectionInfoModal,
  'grand-prize': GrandPrizeModal,
  'collection-set-detail': CollectionSetDetailModal,
  'card-detail': CardDetailModal,
  'profile': ProfileModal,
  'team-info': TeamInfoModal,
  'member-profile': MemberProfileModal,
  'weekly-contest-info': WeeklyContestInfoModal,
};

// Animated Modal Wrapper
interface AnimatedModalWrapperProps {
  modalId: ModalId;
  index: number;
  children: React.ReactNode;
}

function AnimatedModalWrapper({ modalId, index, children }: AnimatedModalWrapperProps) {
  const overlayRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const { closeModal } = useNavigation();
  const isAnimatingRef = useRef(false);

  // Animate in on mount
  useEffect(() => {
    if (!overlayRef.current || !contentRef.current) return;

    const overlay = overlayRef.current;
    const content = contentRef.current;

    // Set initial state
    gsap.set(overlay, { opacity: 0 });
    gsap.set(content, { y: -80, opacity: 0, scale: 0.92 });

    // Animate in - slide down from top
    gsap.to(overlay, {
      opacity: 1,
      duration: 0.25,
      ease: 'power2.out',
    });
    gsap.to(content, {
      y: 0,
      opacity: 1,
      scale: 1,
      duration: 0.4,
      ease: 'back.out(1.2)',
      delay: 0.05,
    });
  }, []);

  const animateOut = useCallback((onComplete?: () => void) => {
    if (isAnimatingRef.current) return;
    isAnimatingRef.current = true;

    if (!overlayRef.current || !contentRef.current) {
      onComplete?.();
      return;
    }

    const overlay = overlayRef.current;
    const content = contentRef.current;

    // Animate out - slide up
    gsap.to(content, {
      y: -60,
      opacity: 0,
      scale: 0.95,
      duration: 0.25,
      ease: 'power3.in',
    });
    gsap.to(overlay, {
      opacity: 0,
      duration: 0.2,
      delay: 0.1,
      ease: 'power2.in',
      onComplete: () => {
        onComplete?.();
        closeModal();
      },
    });
  }, [closeModal]);

  return (
    <div
      ref={overlayRef}
      className="fixed inset-0 flex items-center justify-center bg-black/60"
      style={{ zIndex: 50 + index * 10 }}
    >
      <div ref={contentRef}>
        {React.Children.map(children, (child) => {
          if (React.isValidElement(child)) {
            return React.cloneElement(child as React.ReactElement<{ onAnimatedClose?: () => void }>, {
              onAnimatedClose: () => animateOut(),
            });
          }
          return child;
        })}
      </div>
    </div>
  );
}

export function ModalManager() {
  const { modalStack } = useNavigation();

  if (modalStack.length === 0) return null;

  return (
    <>
      {modalStack.map((modalId, index) => {
        if (!modalId) return null;
        const ModalComponent = modalComponents[modalId];
        if (!ModalComponent) return null;
        return (
          <AnimatedModalWrapper key={modalId} modalId={modalId} index={index}>
            <ModalComponent />
          </AnimatedModalWrapper>
        );
      })}
    </>
  );
}
