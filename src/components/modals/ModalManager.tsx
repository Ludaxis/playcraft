'use client';

import React, { useRef, useEffect, useCallback } from 'react';
import dynamic from 'next/dynamic';
import gsap from 'gsap';
import { useNavigation } from '@/store';
import type { ModalId } from '@/types';

// Modal loading fallback
function ModalSkeleton() {
  return (
    <div className="w-[320px] bg-bg-card rounded-xl border-2 border-border overflow-hidden animate-pulse">
      <div className="bg-bg-muted py-3 px-4">
        <div className="h-6 bg-border rounded w-32 mx-auto" />
      </div>
      <div className="p-4 space-y-3">
        <div className="h-16 bg-bg-muted rounded-lg" />
        <div className="h-4 bg-bg-muted rounded w-3/4" />
        <div className="h-10 bg-bg-muted rounded" />
      </div>
    </div>
  );
}

// Eager imports - frequently used modals
import { LevelStartModal } from './LevelStartModal';
import { LevelCompleteModal } from './LevelCompleteModal';
import { LevelFailedModal } from './LevelFailedModal';

// Lazy-loaded modals
const OutOfLivesModal = dynamic(() => import('./OutOfLivesModal').then(m => ({ default: m.OutOfLivesModal })), { loading: () => <ModalSkeleton /> });
const RewardClaimModal = dynamic(() => import('./RewardClaimModal').then(m => ({ default: m.RewardClaimModal })), { loading: () => <ModalSkeleton /> });
const BoosterSelectModal = dynamic(() => import('./BoosterSelectModal').then(m => ({ default: m.BoosterSelectModal })), { loading: () => <ModalSkeleton /> });
const FreeLivesModal = dynamic(() => import('./FreeLivesModal').then(m => ({ default: m.FreeLivesModal })), { loading: () => <ModalSkeleton /> });
const ProfilePictureModal = dynamic(() => import('./ProfilePictureModal').then(m => ({ default: m.ProfilePictureModal })), { loading: () => <ModalSkeleton /> });
const EditAvatarModal = dynamic(() => import('./EditAvatarModal').then(m => ({ default: m.EditAvatarModal })), { loading: () => <ModalSkeleton /> });
const StarInfoModal = dynamic(() => import('./StarInfoModal').then(m => ({ default: m.StarInfoModal })), { loading: () => <ModalSkeleton /> });
const SignInModal = dynamic(() => import('./SignInModal').then(m => ({ default: m.SignInModal })), { loading: () => <ModalSkeleton /> });
const ParentalControlModal = dynamic(() => import('./ParentalControlModal').then(m => ({ default: m.ParentalControlModal })), { loading: () => <ModalSkeleton /> });
const PrivacyPolicyModal = dynamic(() => import('./PrivacyPolicyModal').then(m => ({ default: m.PrivacyPolicyModal })), { loading: () => <ModalSkeleton /> });
const ChangeUsernameModal = dynamic(() => import('./ChangeUsernameModal').then(m => ({ default: m.ChangeUsernameModal })), { loading: () => <ModalSkeleton /> });
const CardStarsModal = dynamic(() => import('./CardStarsModal').then(m => ({ default: m.CardStarsModal })), { loading: () => <ModalSkeleton /> });
const CollectionInfoModal = dynamic(() => import('./CollectionInfoModal').then(m => ({ default: m.CollectionInfoModal })), { loading: () => <ModalSkeleton /> });
const GrandPrizeModal = dynamic(() => import('./GrandPrizeModal').then(m => ({ default: m.GrandPrizeModal })), { loading: () => <ModalSkeleton /> });
const CollectionSetDetailModal = dynamic(() => import('./CollectionSetDetailModal').then(m => ({ default: m.CollectionSetDetailModal })), { loading: () => <ModalSkeleton /> });
const CardDetailModal = dynamic(() => import('./CardDetailModal').then(m => ({ default: m.CardDetailModal })), { loading: () => <ModalSkeleton /> });
const ProfileModal = dynamic(() => import('./ProfileModal').then(m => ({ default: m.ProfileModal })), { loading: () => <ModalSkeleton /> });
const TeamInfoModal = dynamic(() => import('./TeamInfoModal').then(m => ({ default: m.TeamInfoModal })), { loading: () => <ModalSkeleton /> });
const MemberProfileModal = dynamic(() => import('./MemberProfileModal').then(m => ({ default: m.MemberProfileModal })), { loading: () => <ModalSkeleton /> });
const WeeklyContestInfoModal = dynamic(() => import('./WeeklyContestInfoModal').then(m => ({ default: m.WeeklyContestInfoModal })), { loading: () => <ModalSkeleton /> });

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
  index: number;
  children: React.ReactNode;
}

function AnimatedModalWrapper({ index, children }: AnimatedModalWrapperProps) {
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
        {/* eslint-disable-next-line react-hooks/refs -- React.Children.map callback doesn't access refs */}
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
          <AnimatedModalWrapper key={`${modalId}-${index}`} index={index}>
            <ModalComponent />
          </AnimatedModalWrapper>
        );
      })}
    </>
  );
}
