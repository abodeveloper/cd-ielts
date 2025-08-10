import React, { useState, useRef } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const TextHighlight = () => {
  const [selection, setSelection] = useState(null);
  const [dropdownPosition, setDropdownPosition] = useState({ x: 0, y: 0 });
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const contentRef = useRef(null);

  const handleMouseUp = () => {
    const sel = window.getSelection();
    if (sel.toString().trim() !== "") {
      const range = sel.getRangeAt(0);
      const rect = range.getBoundingClientRect();
      setSelection({ text: sel.toString(), range });
      setDropdownPosition({ x: rect.left, y: rect.bottom + window.scrollY });
      setIsDropdownOpen(true);
    } else {
      setIsDropdownOpen(false);
    }
  };

  const highlightText = () => {
    if (!selection) return;
    const { range } = selection;
    const span = document.createElement("span");
    span.className = "bg-yellow-200 px-1 rounded";
    range.surroundContents(span);
    window.getSelection().removeAllRanges();
    setIsDropdownOpen(false);
  };

  const clearHighlight = () => {
    if (!selection) return;
    const { range } = selection;
    const parent = range.commonAncestorContainer.parentElement;
    if (parent.classList.contains("bg-yellow-200")) {
      const text = parent.textContent;
      parent.replaceWith(document.createTextNode(text));
    }
    window.getSelection().removeAllRanges();
    setIsDropdownOpen(false);
  };

  return (
    <div className="p-4">
      <div
        ref={contentRef}
        onMouseUp={handleMouseUp}
        className="p-4 border rounded-md bg-white"
      >
        Bu matn ichida ixtiyoriy qismni tanlang, so'ngra dropdown menyudan
        "Highlight" yoki "Clear Highlight" tugmalarini bosing. Misol uchun,
        ushbu matnni tanlab, uni sariq rang bilan belgilashingiz mumkin.
      </div>

      {isDropdownOpen && (
        <div
          style={{
            position: "absolute",
            top: `${dropdownPosition.y}px`,
            left: `${dropdownPosition.x}px`,
          }}
        >
          <DropdownMenu open={isDropdownOpen} onOpenChange={setIsDropdownOpen}>
            <DropdownMenuTrigger asChild>
              <span />
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem onClick={highlightText}>
                Highlight
              </DropdownMenuItem>
              <DropdownMenuItem onClick={clearHighlight}>
                Clear Highlight
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      )}
    </div>
  );
};

export default TextHighlight;
