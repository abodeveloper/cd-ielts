import React, { useState, useRef, useCallback } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import parse from "html-react-parser";

interface HTMLRendererProps {
  htmlString: string;
  className?: string;
  enableHighlight?: boolean;
}

const HTMLRendererWithHighlight = ({
  htmlString,
  className = "",
  enableHighlight = true,
}: HTMLRendererProps) => {
  const [selection, setSelection] = useState<{
    text: string;
    range: Range;
  } | null>(null);
  const [dropdownPosition, setDropdownPosition] = useState<{
    x: number;
    y: number;
  }>({ x: 0, y: 0 });
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const contentRef = useRef<HTMLDivElement>(null);

  const handleMouseUp = useCallback(() => {
    if (!enableHighlight) return;
    const sel = window.getSelection();
    if (
      sel &&
      sel.toString().trim() &&
      contentRef.current?.contains(sel.anchorNode)
    ) {
      const range = sel.getRangeAt(0);
      const rect = range.getBoundingClientRect();
      const dropdownWidth = 150; // Taxminiy dropdown kengligi
      // Dropdownni tanlangan matnning o'ng yonida joylashtirish, ekran chegarasiga moslash
      const adjustX =
        rect.right + 5 > window.innerWidth - dropdownWidth
          ? Math.max(5, rect.left - dropdownWidth - 5) // Chapga siljitish
          : rect.right + 5; // O'ngda qoldirish
      const adjustY = rect.top + window.scrollY - rect.height / 2; // Matnning o'rtasida vertikal joylashish
      setSelection({ text: sel.toString(), range });
      setDropdownPosition({ x: adjustX, y: adjustY });
      setTimeout(() => setIsDropdownOpen(true), 0);
    } else {
      setIsDropdownOpen(false);
    }
  }, [enableHighlight]);

  const highlightText = useCallback(() => {
    if (!selection) return;
    const { range } = selection;
    const span = document.createElement("span");
    span.className = "bg-yellow-200 px-1 rounded";
    try {
      range.surroundContents(span);
    } catch (e) {
      console.error("Highlight qilishda xato:", e);
    }
    window.getSelection()?.removeAllRanges();
    setIsDropdownOpen(false);
  }, [selection]);

  const clearHighlight = useCallback(() => {
    if (!selection) return;
    const { range } = selection;
    const parent = range.commonAncestorContainer.parentElement;
    if (parent?.classList.contains("bg-yellow-200")) {
      parent.replaceWith(document.createTextNode(parent.textContent || ""));
    }
    window.getSelection()?.removeAllRanges();
    setIsDropdownOpen(false);
  }, [selection]);

  return (
    <div className="relative">
      <div
        ref={contentRef}
        onMouseUp={enableHighlight ? handleMouseUp : undefined}
        className={`w-full text-sm text-[--foreground] ${className} [&_table]:w-full [&_table]:border-collapse [&_td]:border [&_td]:border-[--border] [&_td]:p-2 [&_th]:border [&_th]:border-[--border] [&_th]:p-2 [&_p]:mb-2 [&_p]:text-[--foreground] [&_h3]:text-lg [&_h3]:font-semibold [&_h3]:mb-2 [&_h3]:text-[--foreground] [&_strong]:font-bold [&_em]:italic select-text`}
        style={{ userSelect: "text" }}
      >
        {parse(htmlString)}
      </div>

      {enableHighlight && isDropdownOpen && (
        <div
          style={{
            position: "absolute",
            top: `${dropdownPosition.y}px`,
            left: `${dropdownPosition.x}px`,
            zIndex: 1000,
          }}
        >
          <DropdownMenu open={isDropdownOpen} onOpenChange={setIsDropdownOpen}>
            <DropdownMenuTrigger asChild>
              <span className="hidden" />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start">
              <DropdownMenuItem onSelect={highlightText}>
                Highlight
              </DropdownMenuItem>
              <DropdownMenuItem onSelect={clearHighlight}>
                Clear Highlight
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      )}
    </div>
  );
};

export default HTMLRendererWithHighlight;
