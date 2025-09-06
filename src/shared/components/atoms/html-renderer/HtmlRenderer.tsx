import parse from "html-react-parser";
import { useRef, useEffect, useState, useCallback } from "react";
import { Button } from "@/components/ui/button"; // Shadcn button import
import { RiEraserLine, RiMarkPenLine } from "@remixicon/react";

interface HTMLRendererProps {
  htmlString: string;
  className?: string;
  enabledHighlight?: boolean; // ✅ qo‘shildi
}

const HTMLRendererWithHighlight = ({
  htmlString,
  className = "",
  enabledHighlight = true, // default true
}: HTMLRendererProps) => {
  const contentRef = useRef<HTMLDivElement>(null);
  const [selectedRange, setSelectedRange] = useState<Range | null>(null);
  const [dropdownPos, setDropdownPos] = useState<{
    x: number;
    y: number;
  } | null>(null);
  const [selectedHighlight, setSelectedHighlight] =
    useState<HTMLElement | null>(null);

  // Matn tanlaganda ishlaydi
  const handleSelection = useCallback(() => {
    if (!enabledHighlight) return; // ✅ highlight o‘chirilgan bo‘lsa selection ishlamasin

    const selection = window.getSelection();
    if (
      selection &&
      selection.rangeCount > 0 &&
      selection.toString().length > 0 &&
      contentRef.current?.contains(selection.anchorNode!)
    ) {
      const range = selection.getRangeAt(0);
      const rect = range.getBoundingClientRect();

      setSelectedRange(range);
      setSelectedHighlight(null);
      setDropdownPos({
        x: rect.left + window.scrollX,
        y: rect.top + window.scrollY - 40,
      });
    } else {
      setSelectedRange(null);
      setDropdownPos(null);
      setSelectedHighlight(null);
    }
  }, [enabledHighlight]);

  useEffect(() => {
    if (!enabledHighlight) return; // ✅ faqat highlight yoqilganda
    document.addEventListener("mouseup", handleSelection);
    return () => {
      document.removeEventListener("mouseup", handleSelection);
    };
  }, [handleSelection, enabledHighlight]);

  // Highlight qo‘shish
  const handleHighlightClick = () => {
    if (!enabledHighlight) return; // ✅
    if (selectedRange) {
      const span = document.createElement("span");
      span.className = "highlight bg-yellow-300";
      span.dataset.highlightId = Date.now().toString();
      span.textContent = selectedRange.toString();

      selectedRange.deleteContents();
      selectedRange.insertNode(span);

      setSelectedRange(null);
      setSelectedHighlight(span);
      setDropdownPos(null);
    }
  };

  // Faqat tanlangan joydagi highlightni olib tashlash
  const handleClearClick = () => {
    if (!enabledHighlight) return; // ✅
    if (selectedHighlight) {
      const parent = selectedHighlight.parentNode;
      if (parent) {
        parent.replaceChild(
          document.createTextNode(selectedHighlight.textContent || ""),
          selectedHighlight
        );
      }
      setSelectedHighlight(null);
      setDropdownPos(null);
    } else if (selectedRange) {
      const node = selectedRange.startContainer.parentNode as HTMLElement;
      if (node && node.classList.contains("highlight")) {
        const parent = node.parentNode;
        if (parent) {
          parent.replaceChild(
            document.createTextNode(node.textContent || ""),
            node
          );
        }
      }
      setSelectedRange(null);
      setDropdownPos(null);
    }
  };

  return (
    <>
      <div
        ref={contentRef}
        className={`w-full text-sm text-[--foreground] ${className} 
          [&_table]:w-full [&_table]:border-collapse 
          [&_td]:border [&_td]:border-[--border] [&_td]:p-2 
          [&_th]:border [&_th]:border-[--border] [&_th]:p-2 
          [&_p]:mb-2 [&_p]:text-[--foreground] 
          [&_h3]:text-lg [&_h3]:font-semibold [&_h3]:mb-2 [&_h3]:text-[--foreground] 
          [&_strong]:font-bold [&_em]:italic select-text`}
        style={{ userSelect: "text" }}
        onClick={(e) => {
          if (!enabledHighlight) return; // ✅ highlight disable bo‘lsa ishlamasin
          const target = e.target as HTMLElement;
          if (target.classList.contains("highlight")) {
            setSelectedHighlight(target);
            const rect = target.getBoundingClientRect();
            setDropdownPos({
              x: rect.left + window.scrollX,
              y: rect.top + window.scrollY - 40,
            });
          }
        }}
      >
        {parse(htmlString)}
      </div>

      {enabledHighlight && dropdownPos && (
        <div
          className="absolute z-50 flex gap-2 rounded-lg border bg-muted p-2 shadow-lg"
          style={{ left: dropdownPos.x, top: dropdownPos.y }}
        >
          <Button size="sm" onClick={handleHighlightClick}>
            <RiMarkPenLine className="mr-1 h-4 w-4" /> Highlight
          </Button>

          <Button size="sm" variant="destructive" onClick={handleClearClick}>
            <RiEraserLine className="mr-1 h-4 w-4" /> Clear
          </Button>
        </div>
      )}
    </>
  );
};

export default HTMLRendererWithHighlight;
