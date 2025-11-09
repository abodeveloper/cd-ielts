import { useCallback, useEffect, useRef } from "react";

interface HighlightStorage {
  [key: string]: string; // key: testType-partId-contentType, value: HTML with highlights
}

// In-memory storage for highlights (persists during session)
const highlightStorage: HighlightStorage = {};

/**
 * Hook to persist and restore highlights for test parts
 * @param storageKey - Unique key for this content (e.g., "reading-123-content")
 * @param originalHtml - The original HTML string without highlights
 * @param onHtmlChange - Callback when HTML changes (to save highlights)
 */
export const useHighlightPersistence = (
  storageKey: string,
  originalHtml: string,
  onHtmlChange?: (html: string) => void
) => {
  const storageKeyRef = useRef(storageKey);
  const onHtmlChangeRef = useRef(onHtmlChange);

  // Update refs when props change
  useEffect(() => {
    storageKeyRef.current = storageKey;
    onHtmlChangeRef.current = onHtmlChange;
  }, [storageKey, onHtmlChange]);

  // Get HTML with saved highlights or return original
  const getHtmlWithHighlights = useCallback((): string => {
    if (!storageKeyRef.current) {
      return originalHtml;
    }
    const saved = highlightStorage[storageKeyRef.current];
    // Validate that saved HTML is a valid string
    if (saved && typeof saved === "string" && saved.trim().length > 0) {
      return saved;
    }
    return originalHtml;
  }, [originalHtml]);

  // Save current HTML (with highlights) to storage
  const saveHtml = useCallback((html: string) => {
    if (!storageKeyRef.current) {
      return;
    }
    // Validate HTML before saving
    if (html && typeof html === "string" && html.trim().length > 0) {
      highlightStorage[storageKeyRef.current] = html;
      if (onHtmlChangeRef.current) {
        onHtmlChangeRef.current(html);
      }
    }
  }, []);

  // Clear saved highlights for this key
  const clearHighlights = useCallback(() => {
    delete highlightStorage[storageKeyRef.current];
    if (onHtmlChangeRef.current) {
      onHtmlChangeRef.current(originalHtml);
    }
  }, [originalHtml]);

  // Initialize: restore saved HTML if it exists
  // Also restore when storageKey or originalHtml changes (e.g., when switching parts)
  useEffect(() => {
    const saved = highlightStorage[storageKeyRef.current];
    if (saved && onHtmlChangeRef.current) {
      onHtmlChangeRef.current(saved);
    } else if (!saved && onHtmlChangeRef.current) {
      // If no saved version, use original HTML
      onHtmlChangeRef.current(originalHtml);
    }
  }, [storageKey, originalHtml]);

  return {
    getHtmlWithHighlights,
    saveHtml,
    clearHighlights,
  };
};

