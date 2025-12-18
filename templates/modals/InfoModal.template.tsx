/**
 * ╔═══════════════════════════════════════════════════════════════════════════╗
 * ║                          INFO MODAL TEMPLATE                               ║
 * ╠═══════════════════════════════════════════════════════════════════════════╣
 * ║  Use this for: Information display, help text, feature explanations        ║
 * ║                                                                            ║
 * ║  Features:                                                                 ║
 * ║  - Title and content sections                                              ║
 * ║  - Optional icon/image                                                     ║
 * ║  - Bullet point lists                                                      ║
 * ║  - Single dismiss button                                                   ║
 * ╚═══════════════════════════════════════════════════════════════════════════╝
 */

'use client';

import React from 'react';
import { useModal, useModalParams } from '@/hooks';

// ═══════════════════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════════════════

interface InfoSection {
  title?: string;
  content: string | string[];
}

interface InfoModalParams extends Record<string, unknown> {
  title?: string;
  icon?: string;
  description?: string;
  sections?: InfoSection[];
  buttonText?: string;
}

// ═══════════════════════════════════════════════════════════════════════════
// DEFAULT VALUES
// ═══════════════════════════════════════════════════════════════════════════

const DEFAULTS = {
  title: 'Information',
  icon: '/icons/Info.svg',
  description: 'Here is some helpful information.',
  buttonText: 'Got it!',
  sections: [] as InfoSection[],
};

// ═══════════════════════════════════════════════════════════════════════════
// MODAL COMPONENT
// ═══════════════════════════════════════════════════════════════════════════

interface Props {
  onAnimatedClose?: () => void;
}

export function InfoModal({ onAnimatedClose }: Props) {
  const { close } = useModal();
  const params = useModalParams<InfoModalParams>();

  // Use params or defaults
  const title = params.title ?? DEFAULTS.title;
  const icon = params.icon ?? DEFAULTS.icon;
  const description = params.description ?? DEFAULTS.description;
  const sections = params.sections ?? DEFAULTS.sections;
  const buttonText = params.buttonText ?? DEFAULTS.buttonText;

  // ─────────────────────────────────────────────────────────────────────
  // HANDLERS
  // ─────────────────────────────────────────────────────────────────────

  const handleClose = () => {
    if (onAnimatedClose) {
      onAnimatedClose();
    } else {
      close();
    }
  };

  // ─────────────────────────────────────────────────────────────────────
  // RENDER
  // ─────────────────────────────────────────────────────────────────────

  return (
    <div className="w-[320px] bg-bg-card rounded-xl border-2 border-border overflow-hidden max-h-[80vh] flex flex-col">
      {/* Header */}
      <div className="bg-bg-inverse py-2.5 px-3 flex items-center justify-center relative flex-shrink-0">
        <h2 className="text-text-inverse text-h4">{title}</h2>
        <button
          onClick={handleClose}
          className="absolute right-2 w-7 h-7 bg-bg-muted rounded-full flex items-center justify-center border border-border hover:opacity-80"
        >
          <span className="text-text-primary text-value">&times;</span>
        </button>
      </div>

      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto p-4">
        {/* Icon */}
        {icon && (
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 rounded-full bg-bg-muted flex items-center justify-center border-2 border-border">
              <img src={icon} alt="" className="w-8 h-8" />
            </div>
          </div>
        )}

        {/* Description */}
        <p className="text-body text-text-secondary text-center mb-4">
          {description}
        </p>

        {/* Sections */}
        {sections.length > 0 && (
          <div className="space-y-4">
            {sections.map((section, index) => (
              <InfoSection key={index} section={section} />
            ))}
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="p-4 border-t border-border flex-shrink-0">
        <button
          onClick={handleClose}
          className="w-full py-2.5 bg-bg-inverse text-text-inverse rounded-lg font-bold hover:opacity-90 transition-opacity"
        >
          {buttonText}
        </button>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// INFO SECTION COMPONENT
// ═══════════════════════════════════════════════════════════════════════════

interface InfoSectionProps {
  section: InfoSection;
}

function InfoSection({ section }: InfoSectionProps) {
  const content = section.content;

  return (
    <div className="bg-bg-muted rounded-lg p-3">
      {/* Section Title */}
      {section.title && (
        <h3 className="text-label font-bold text-text-primary mb-2">
          {section.title}
        </h3>
      )}

      {/* Content */}
      {typeof content === 'string' ? (
        <p className="text-body-sm text-text-secondary">{content}</p>
      ) : (
        <ul className="text-body-sm text-text-secondary space-y-1">
          {content.map((item, index) => (
            <li key={index} className="flex items-start gap-2">
              <span className="text-text-muted mt-1">&bull;</span>
              <span>{item}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// EXPORTS
// ═══════════════════════════════════════════════════════════════════════════

export default InfoModal;
