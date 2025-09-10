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
    width: number;
  } | null>(null);
  const [selectedHighlightElement, setSelectedHighlightElement] =
    useState<HTMLElement | null>(null);

  const generateHighlightId = () =>
    Date.now().toString() + Math.random().toString(36).slice(2);

  const getAllBlocksInRange = (range: Range): HTMLElement[] => {
    if (!contentRef.current) return [];

    const blocks: HTMLElement[] = [];
    const treeWalker = document.createTreeWalker(
      contentRef.current,
      NodeFilter.SHOW_ELEMENT,
      {
        acceptNode(node) {
          if (!(node instanceof HTMLElement)) return NodeFilter.FILTER_REJECT;
          const style = window.getComputedStyle(node);
          if (
            style.display === "block" ||
            style.display === "list-item" ||
            style.display === "table" ||
            ["P", "DIV", "LI"].includes(node.tagName)
          ) {
            if (range.intersectsNode(node)) {
              return NodeFilter.FILTER_ACCEPT;
            }
          }
          return NodeFilter.FILTER_SKIP;
        },
      },
      false
    );

    let currentNode = treeWalker.nextNode();
    while (currentNode) {
      blocks.push(currentNode as HTMLElement);
      currentNode = treeWalker.nextNode();
    }
    return blocks;
  };

  const applyHighlightToRange = (range: Range, highlightId: string) => {
    const fragment = range.extractContents();
    const span = document.createElement("span");
    span.className = "highlight";
    span.dataset.highlightId = highlightId;
    span.appendChild(fragment);
    range.insertNode(span);
  };

  const handleHighlightClick = () => {
    if (!enabledHighlight || !selectedRange) return;

    const range = selectedRange.cloneRange();
    const highlightId = generateHighlightId();

    const blocks = getAllBlocksInRange(range);
    if (blocks.length === 0) {
      applyHighlightToRange(range, highlightId);
    } else {
      blocks.forEach((block) => {
        const blockRange = document.createRange();

        let startContainer = range.startContainer;
        let startOffset = range.startOffset;
        let endContainer = range.endContainer;
        let endOffset = range.endOffset;

        if (!block.contains(startContainer)) {
          startContainer = block;
          startOffset = 0;
        }

        if (!block.contains(endContainer)) {
          endContainer = block;
          endOffset = block.childNodes.length;
        }

        try {
          blockRange.setStart(startContainer, startOffset);
          blockRange.setEnd(endContainer, endOffset);

          if (!blockRange.collapsed) {
            applyHighlightToRange(blockRange, highlightId);
          }
        } catch {
          // Ignore range errors
        }
      });
    }

    setSelectedRange(null);
    setDropdownPos(null);
    setSelectedHighlightElement(null);
  };

  const handleSelection = useCallback(() => {
    if (!enabledHighlight) return;

    const selection = window.getSelection();
    if (
      selection &&
      selection.rangeCount > 0 &&
      selection.toString().length > 0 &&
      contentRef.current?.contains(selection.anchorNode!)
    ) {
      const range = selection.getRangeAt(0);
      const rect = range.getBoundingClientRect();

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
        setSelectedRange(null);
      } else {
        setSelectedHighlightElement(null);
        setSelectedRange(range);
      }

      setDropdownPos({
        x: rect.left + window.scrollX + rect.width / 2,
        y: rect.top + window.scrollY - 40,
        width: 0,
      });
    } else {
      setSelectedRange(null);
      setSelectedHighlightElement(null);
      setDropdownPos(null);
    }
  }, [enabledHighlight]);

  useEffect(() => {
    if (!enabledHighlight) return;
    document.addEventListener("mouseup", handleSelection);

    const handleBodyClick = (e: MouseEvent) => {
      if (!contentRef.current?.contains(e.target as Node)) {
        setSelectedHighlightElement(null);
        setDropdownPos(null);
      }
    };
    document.body.addEventListener("click", handleBodyClick);

    return () => {
      document.removeEventListener("mouseup", handleSelection);
      document.body.removeEventListener("click", handleBodyClick);
    };
  }, [handleSelection, enabledHighlight]);

  const handleHighlightElementClick = (e: React.MouseEvent<HTMLElement>) => {
    e.stopPropagation();
    const target = e.currentTarget;
    setSelectedHighlightElement(target);
    setSelectedRange(null);

    const rect = target.getBoundingClientRect();
    setDropdownPos({
      x: rect.left + window.scrollX + rect.width / 2,
      y: rect.top + window.scrollY - 40,
      width: 0,
    });
  };

  const handleClearClick = () => {
    if (!enabledHighlight) return;

    if (selectedHighlightElement) {
      // Agar bitta highlight tanlangan bo‘lsa, uni o‘chirish
      const targetElement = selectedHighlightElement;
      const parent = targetElement.parentNode;
      if (parent) {
        while (targetElement.firstChild) {
          parent.insertBefore(targetElement.firstChild, targetElement);
        }
        parent.removeChild(targetElement);
      }
    } else if (selectedRange && !selectedHighlightElement) {
      // Tanlovdagi barcha highlightlarni olib tashlash
      const range = selectedRange.cloneRange();
      if (!contentRef.current) return;

      const highlightsToRemove: HTMLElement[] = [];
      const treeWalker = document.createTreeWalker(
        contentRef.current,
        NodeFilter.SHOW_ELEMENT,
        {
          acceptNode(node) {
            if (
              node instanceof HTMLElement &&
              node.classList.contains("highlight") &&
              range.intersectsNode(node)
            ) {
              return NodeFilter.FILTER_ACCEPT;
            }
            return NodeFilter.FILTER_SKIP;
          },
        },
        false
      );

      let currentNode = treeWalker.nextNode();
      while (currentNode) {
        highlightsToRemove.push(currentNode as HTMLElement);
        currentNode = treeWalker.nextNode();
      }

      highlightsToRemove.forEach((el) => {
        const parent = el.parentNode;
        if (parent) {
          while (el.firstChild) {
            parent.insertBefore(el.firstChild, el);
          }
          parent.removeChild(el);
        }
      });
    }

    setSelectedHighlightElement(null);
    setSelectedRange(null);
    setDropdownPos(null);
  };

  const parsedHtml = parse(htmlString, {
    replace: (domNode) => {
      if (
        domNode.type === "tag" &&
        domNode.name === "span" &&
        domNode.attribs &&
        domNode.attribs.class &&
        domNode.attribs.class.includes("highlight")
      ) {
        return (
          <span
            {...domNode.attribs}
            onClick={handleHighlightElementClick}
            style={{ cursor: "pointer" }}
            key={domNode.attribs["data-highlight-id"] || undefined}
          >
            {domNode.children &&
              domNode.children.map((child: any, idx: number) => parse(child))}
          </span>
        );
      }
      return undefined;
    },
  });

  return (
    <>
      <style>{`
        .highlight {
          background-color: #fde68a;
          font-weight: 800;
        }
      `}</style>

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
      >
        {parsedHtml}
      </div>

      {enabledHighlight &&
        dropdownPos &&
        (selectedRange || selectedHighlightElement) && (
          <div
            className="absolute z-50 flex gap-2 rounded-lg border bg-muted p-2 shadow-lg -translate-x-1/2"
            style={{ left: dropdownPos.x, top: dropdownPos.y }}
          >
            {!selectedHighlightElement && (
              <Button size="sm" onClick={handleHighlightClick}>
                <RiMarkPenLine className="mr-1 h-4 w-4" /> Highlight
              </Button>
            )}
            <Button
              size="sm"
              variant="destructive"
              onClick={handleClearClick}
              disabled={!selectedHighlightElement && !selectedRange}
            >
              <RiEraserLine className="mr-1 h-4 w-4" /> Clear
            </Button>
          </div>
        )}
    </>
  );
};

export default HTMLRendererWithHighlight;
