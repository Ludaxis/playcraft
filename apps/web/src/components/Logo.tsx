/**
 * PlayCraft Logo Component
 * Uses the official PlayCraft logo image
 */

interface LogoProps {
  size?: number;
  className?: string;
  showText?: boolean;
  textClassName?: string;
  variant?: 'full' | 'icon';
}

export function Logo({
  size = 32,
  className = '',
  showText = false,
  textClassName = '',
  variant = 'icon'
}: LogoProps) {
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <img
        src="/PlayCraft.png"
        alt="PlayCraft"
        width={size}
        height={size}
        className="shrink-0"
        style={{ width: size, height: size }}
      />

      {/* Text */}
      {(showText || variant === 'full') && (
        <span className={`font-bold text-xl ${textClassName}`}>
          <span className="text-gradient-gaming">Play</span>
          <span className="text-white">Craft</span>
        </span>
      )}
    </div>
  );
}

/**
 * Compact logo icon only - for favicons, small spaces
 */
export function LogoIcon({ size = 32, className = '' }: { size?: number; className?: string }) {
  return (
    <img
      src="/PlayCraft.png"
      alt="PlayCraft"
      width={size}
      height={size}
      className={`shrink-0 ${className}`}
      style={{ width: size, height: size }}
    />
  );
}

/**
 * Logo mark for backgrounds/watermarks
 */
export function LogoMark({ size = 48, className = '' }: { size?: number; className?: string }) {
  return (
    <img
      src="/PlayCraft.png"
      alt="PlayCraft"
      width={size}
      height={size}
      className={`shrink-0 ${className}`}
      style={{ width: size, height: size }}
    />
  );
}
