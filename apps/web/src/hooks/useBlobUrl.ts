import { useState, useEffect } from 'react';

// Cache for blob URLs to avoid re-fetching
const blobUrlCache = new Map<string, string>();

/**
 * Fetch image as blob and return object URL to bypass COEP restrictions.
 * Pages with Cross-Origin-Embedder-Policy: require-corp block cross-origin
 * images that don't have Cross-Origin-Resource-Policy headers. This hook
 * fetches the image via fetch() and creates a blob URL which bypasses this.
 */
export function useBlobUrl(url: string | null | undefined): string | null {
  const [blobUrl, setBlobUrl] = useState<string | null>(() => {
    // Check cache first
    if (url && blobUrlCache.has(url)) {
      return blobUrlCache.get(url)!;
    }
    return null;
  });

  useEffect(() => {
    if (!url) {
      setBlobUrl(null);
      return;
    }

    // Already cached
    if (blobUrlCache.has(url)) {
      setBlobUrl(blobUrlCache.get(url)!);
      return;
    }

    let cancelled = false;

    fetch(url, { mode: 'cors' })
      .then(res => {
        if (!res.ok) throw new Error('Failed to fetch image');
        return res.blob();
      })
      .then(blob => {
        if (cancelled) return;
        const objectUrl = URL.createObjectURL(blob);
        blobUrlCache.set(url, objectUrl);
        setBlobUrl(objectUrl);
      })
      .catch(() => {
        // Fallback: try using the URL directly (might work without COEP)
        if (!cancelled) setBlobUrl(url);
      });

    return () => {
      cancelled = true;
    };
  }, [url]);

  return blobUrl;
}
