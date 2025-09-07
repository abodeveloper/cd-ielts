import parse from "html-react-parser";
import { useRef, useEffect, useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { RiEraserLine, RiMarkPenLine } from "@remixicon/react";

interface HTMLRendererProps {
  htmlString: string;
  className?: string;
  enabledHighlight?: boolean;
}

const HTMLRendererWithHighlight = ({
  htmlString,
  className = "",
  enabledHighlight = true,
}: HTMLRendererProps) => {
  const contentRef = useRef<HTMLDivElement>(null);
  const [selectedRange, setSelectedRange] = useState<Range | null>(null);
  const [dropdownPos, setDropdownPos] = useState<{
    x: number;
    y: number;
    width: number; // Dropdownni markazlashtirish uchun
  } | null>(null);
  const [selectedHighlightElement, setSelectedHighlightElement] =
    useState<HTMLElement | null>(null); // Highlight elementini saqlash uchun

  // Matn tanlaganda ishlaydi (mouseup hodisasi)
  const handleSelection = useCallback(() => {
    if (!enabledHighlight) return;

    const selection = window.getSelection();
    if (
      selection &&
      selection.rangeCount > 0 &&
      selection.toString().length > 0 &&
      contentRef.current?.contains(selection.anchorNode!) // Tanlov bizning kontent ichida bo'lishi shart
    ) {
      const range = selection.getRangeAt(0);
      const rect = range.getBoundingClientRect();

      // Agar tanlov highlight elementi ichida bo'lsa, uni selectedHighlightElement qilib o'rnatamiz
      let commonAncestor = range.commonAncestorContainer as HTMLElement;
      if (commonAncestor.nodeType === Node.TEXT_NODE) {
        commonAncestor = commonAncestor.parentNode as HTMLElement;
      }

      if (
        commonAncestor &&
        commonAncestor.classList &&
        commonAncestor.classList.contains("highlight")
      ) {
        setSelectedHighlightElement(commonAncestor);
        setSelectedRange(null); // Highlight tanlangan bo'lsa range ni tozalaymiz
      } else {
        setSelectedHighlightElement(null);
        setSelectedRange(range); // Yangi tanlovni o'rnatamiz
      }

      setDropdownPos({
        x: rect.left + window.scrollX + rect.width / 2, // Markazga joylashtirish
        y: rect.top + window.scrollY - 40,
        width: 0, // Bu holatda kerak emas, lekin struktura uchun qoldiramiz
      });
    } else {
      // Tanlov yo'q bo'lsa, barcha holatlarni tozalaymiz
      setSelectedRange(null);
      setSelectedHighlightElement(null);
      setDropdownPos(null);
    }
  }, [enabledHighlight]);

  useEffect(() => {
    if (!enabledHighlight) return;
    document.addEventListener("mouseup", handleSelection);
    return () => {
      document.removeEventListener("mouseup", handleSelection);
    };
  }, [handleSelection, enabledHighlight]);

  // Highlight qo‘shish
  const handleHighlightClick = () => {
    if (!enabledHighlight || !selectedRange) return;

    // selectedRange.extractContents() to'g'ridan-to'g'ri ishlash o'rniga,
    // matn tugunlarini topib, ularni spanlar bilan almashtiramiz.
    // Bu DOM strukturasini buzmasdan, highlightni to'g'ri joylashtiradi.

    // Oldingi highlightni tozalab olamiz, agar tanlov uning ustida bo'lsa
    if (selectedHighlightElement) {
      handleClearClick(); // Avvalgi highlightni o'chiramiz
    }

    const fragment = selectedRange.extractContents(); // Tanlangan kontentni ajratib olamiz
    const span = document.createElement("span");
    span.className = "highlight bg-yellow-300";
    span.dataset.highlightId = Date.now().toString(); // Unikal ID
    span.appendChild(fragment); // Ajratilgan kontentni span ichiga joylashtiramiz

    selectedRange.insertNode(span); // Span ni asl joyiga kiritamiz

    // Holatlarni tozalaymiz
    setSelectedRange(null);
    setSelectedHighlightElement(span); // Yangi highlight qilingan elementni belgilaymiz
    setDropdownPos(null);
  };

  // Faqat tanlangan joydagi highlightni olib tashlash
  const handleClearClick = () => {
    if (!enabledHighlight) return;

    let targetElement: HTMLElement | null = null;

    if (selectedHighlightElement) {
      targetElement = selectedHighlightElement;
    } else if (selectedRange) {
      // Agar tanlov highlight ichida bo'lsa, o'sha highlightni topishga harakat qilamiz
      let commonAncestor = selectedRange.commonAncestorContainer as HTMLElement;
      if (commonAncestor.nodeType === Node.TEXT_NODE) {
        commonAncestor = commonAncestor.parentNode as HTMLElement;
      }
      if (
        commonAncestor &&
        commonAncestor.classList &&
        commonAncestor.classList.contains("highlight")
      ) {
        targetElement = commonAncestor;
      }
    }

    if (targetElement) {
      const parent = targetElement.parentNode;
      if (parent) {
        // Highlight ichidagi kontentni qaytarib joylashtiramiz
        while (targetElement.firstChild) {
          parent.insertBefore(targetElement.firstChild, targetElement);
        }
        parent.removeChild(targetElement); // Highlight spanini olib tashlaymiz
      }
    }

    // Holatlarni tozalaymiz
    setSelectedRange(null);
    setSelectedHighlightElement(null);
    setDropdownPos(null);
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
          if (!enabledHighlight) return;
          const target = e.target as HTMLElement;
          // Agar highlight elementiga bosilsa, uni tanlangan highlight deb belgilaymiz
          if (target.classList.contains("highlight")) {
            setSelectedHighlightElement(target);
            setSelectedRange(null); // Highlight tanlangan bo'lsa, range ni tozalaymiz
            const rect = target.getBoundingClientRect();
            setDropdownPos({
              x: rect.left + window.scrollX + rect.width / 2, // Markazga joylashtirish
              y: rect.top + window.scrollY - 40,
              width: 0,
            });
          } else if (!dropdownPos) {
            // Agar dropdown allaqachon ko'rinmayotgan bo'lsa
            setSelectedHighlightElement(null);
            setSelectedRange(null);
            setDropdownPos(null);
          }
        }}
      >
        {parse(htmlString)}
      </div>

      {enabledHighlight &&
        dropdownPos &&
        (selectedRange || selectedHighlightElement) && (
          <div
            className="absolute z-50 flex gap-2 rounded-lg border bg-muted p-2 shadow-lg -translate-x-1/2" // -translate-x-1/2 qo'shamiz
            style={{ left: dropdownPos.x, top: dropdownPos.y }}
          >
            {!selectedHighlightElement && ( // Agar highlight elementi tanlanmagan bo'lsa, "Highlight" tugmasini ko'rsatamiz
              <Button size="sm" onClick={handleHighlightClick}>
                <RiMarkPenLine className="mr-1 h-4 w-4" /> Highlight
              </Button>
            )}

            <Button size="sm" variant="destructive" onClick={handleClearClick}>
              <RiEraserLine className="mr-1 h-4 w-4" /> Clear
            </Button>
          </div>
        )}
    </>
  );
};

export default HTMLRendererWithHighlight;
