/**
 * BlobImage Component
 * Renders an image using blob URLs to bypass COEP restrictions.
 * Use this for any cross-origin images (e.g., Supabase storage) when
 * the page has Cross-Origin-Embedder-Policy: require-corp.
 */

import { useBlobUrl } from '../hooks/useBlobUrl';
import { cn } from '../lib/utils';

interface BlobImageProps {
  src: string | null | undefined;
  alt: string;
  className?: string;
  fallback?: React.ReactNode;
  loadingClassName?: string;
}

export function BlobImage({
  src,
  alt,
  className,
  fallback,
  loadingClassName,
}: BlobImageProps) {
  const blobUrl = useBlobUrl(src);

  // No source provided
  if (!src) {
    return fallback ? <>{fallback}</> : null;
  }

  // Loading state - src exists but blob URL not ready yet
  if (!blobUrl) {
    if (loadingClassName) {
      return <div className={loadingClassName} />;
    }
    // Default loading spinner
    return (
      <div className={cn('flex items-center justify-center', className)}>
        <div className="h-4 w-4 animate-spin rounded-full border-2 border-accent border-t-transparent" />
      </div>
    );
  }

  return (
    <img
      src={blobUrl}
      alt={alt}
      className={className}
    />
  );
}
