import parse, { Element, domToReact } from "html-react-parser";
import { useRef, useEffect, useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { RiCloseLine, RiEraserLine, RiMarkPenLine } from "@remixicon/react";
import { ReadingFormValues } from "@/features/exams/schemas/reading-schema";
import MyQuestionCheckboxGroup from "@/shared/components/atoms/question-inputs/MyQuestionCheckboxGroup";
import { ReadingQuestionType } from "@/shared/enums/reading-question-type.enum";
import { UseFormReturn, useWatch } from "react-hook-form";
import DragDropTags from "./DragDropTags";
import ReadingQuestionInput from "./ReadingQuestionInput";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  FormControl,
  FormItem,
  FormLabel,
  FormField,
} from "@/components/ui/form";

interface ReadingQuestionRendererProps {
  htmlString: string;
  form: UseFormReturn<ReadingFormValues>;
  className?: string;
  enabledHighlight?: boolean;
  storageKey?: string;
}

const ReadingQuestionRenderer: React.FC<ReadingQuestionRendererProps> = ({
  htmlString,
  form,
  className = "",
  enabledHighlight = true,
  storageKey,
}) => {
  const contentRef = useRef<HTMLDivElement>(null);
  const [selectedRange, setSelectedRange] = useState<Range | null>(null);
  const [dropdownPos, setDropdownPos] = useState<{
    x: number;
    y: number;
  } | null>(null);
  const [selectedHighlight, setSelectedHighlight] =
    useState<HTMLElement | null>(null);
  const [currentHtml, setCurrentHtml] = useState(htmlString);

  const generateId = () =>
    Date.now().toString() + Math.random().toString(36).slice(2);

  // Highlight qo‘shish
  const applyHighlight = (range: Range) => {
    if (!contentRef.current || range.collapsed) return;

    const span = document.createElement("span");
    span.className = "highlight";
    span.dataset.id = generateId();

    try {
      range.surroundContents(span);
    } catch {
      const fragment = range.extractContents();
      span.appendChild(fragment);
      range.insertNode(span);
    }

    if (storageKey) {
      localStorage.setItem(
        `highlights_${storageKey}`,
        contentRef.current.innerHTML
      );
    }
  };

  // Highlight o‘chirish
  const removeHighlight = (el: HTMLElement) => {
    const parent = el.parentNode;
    while (el.firstChild) parent?.insertBefore(el.firstChild, el);
    parent?.removeChild(el);
    parent?.normalize();
    if (storageKey) {
      localStorage.setItem(
        `highlights_${storageKey}`,
        contentRef.current!.innerHTML
      );
    }
  };

  // Selectionni tekshirish
  const checkSelection = useCallback(() => {
    const sel = window.getSelection();
    if (!sel || sel.rangeCount === 0) {
      setSelectedRange(null);
      setDropdownPos(null);
      setSelectedHighlight(null);
      return;
    }

    const range = sel.getRangeAt(0);
    const text = sel.toString().trim();

    if (!text || !contentRef.current?.contains(sel.anchorNode)) {
      setSelectedRange(null);
      setDropdownPos(null);
      setSelectedHighlight(null);
      return;
    }

    // Input ichida bo‘lsa – bloklash
    if (
      range.startContainer.parentElement?.closest("input, button, .FormItem") ||
      range.endContainer.parentElement?.closest("input, button, .FormItem")
    ) {
      sel.removeAllRanges();
      return;
    }

    const rect = range.getBoundingClientRect();
    if (rect.width === 0 || rect.height === 0) return;

    setSelectedRange(range);
    setSelectedHighlight(null);

    const x = rect.left + rect.width / 2 + window.scrollX;
    const y = rect.bottom + window.scrollY + 8;

    setDropdownPos({ x, y });
  }, [storageKey]);

  // Global mouseup
  useEffect(() => {
    if (!enabledHighlight) return;

    const handleMouseUp = () => {
      setTimeout(checkSelection, 10);
    };

    const handleClick = (e: MouseEvent) => {
      if (!contentRef.current?.contains(e.target as Node)) {
        setDropdownPos(null);
        setSelectedHighlight(null);
      }
    };

    document.addEventListener("mouseup", handleMouseUp);
    document.addEventListener("click", handleClick);

    return () => {
      document.removeEventListener("mouseup", handleMouseUp);
      document.removeEventListener("click", handleClick);
    };
  }, [enabledHighlight, checkSelection]);

  // Highlight bosilganda
  const handleHighlightClick = (e: React.MouseEvent<HTMLElement>) => {
    e.stopPropagation();
    const el = e.currentTarget;
    setSelectedHighlight(el);
    setSelectedRange(null);

    const rect = el.getBoundingClientRect();
    setDropdownPos({
      x: rect.left + rect.width / 2 + window.scrollX,
      y: rect.bottom + window.scrollY + 8,
    });
  };

  // Highlight tugmasi
  const onHighlight = () => {
    if (selectedRange) {
      applyHighlight(selectedRange.cloneRange());
      setSelectedRange(null);
      setDropdownPos(null);
    }
  };

  // Clear tugmasi
  const onClear = () => {
    if (selectedHighlight) {
      removeHighlight(selectedHighlight);
    } else if (selectedRange) {
      const walker = document.createTreeWalker(
        contentRef.current!,
        NodeFilter.SHOW_ELEMENT,
        {
          acceptNode: (n) =>
            n instanceof HTMLElement &&
            n.classList.contains("highlight") &&
            selectedRange!.intersectsNode(n)
              ? NodeFilter.FILTER_ACCEPT
              : NodeFilter.FILTER_SKIP,
        }
      );
      let node;
      while ((node = walker.nextNode())) {
        removeHighlight(node as HTMLElement);
      }
    }
    setSelectedRange(null);
    setSelectedHighlight(null);
    setDropdownPos(null);
  };

  // LocalStorage dan yuklash
  useEffect(() => {
    if (!storageKey || !contentRef.current) return;
    const saved = localStorage.getItem(`highlights_${storageKey}`);
    if (saved) {
      contentRef.current.innerHTML = saved;
    }
  }, [storageKey]);

  useEffect(() => {
    setCurrentHtml(htmlString);
  }, [htmlString]);

  const parsed = parse(currentHtml, {
    replace: (domNode) => {
      if (!(domNode instanceof Element)) return;

      // Highlight span
      if (
        domNode.name === "span" &&
        domNode.attribs.class?.includes("highlight")
      ) {
        return (
          <span
            {...domNode.attribs}
            onClick={handleHighlightClick}
            style={{ cursor: "pointer" }}
          >
            {domToReact(domNode.children)}
          </span>
        );
      }

      // TABLE-TEGS-INPUT – 100% SELECTION ISHLAYDI!
      if (domNode.name === "table-tegs-input") {
        const opts = JSON.parse(domNode.attribs["data-options"] || "[]");
        const questions = JSON.parse(domNode.attribs["data-questions"] || "[]");
        const repeat = domNode.attribs["repeat_answer"] !== "False";

        const Row = ({ q }: { q: any }) => {
          const idx = q.question_number - 1;
          const value = useWatch({
            control: form.control,
            name: `answers.${idx}.answer`,
          });
          const answers = useWatch({ control: form.control, name: "answers" });
          const used = !repeat
            ? questions
                .filter((x: any) => x.question_number !== q.question_number)
                .map((x: any) => answers?.[x.question_number - 1]?.answer)
                .filter(Boolean)
            : [];

          return (
            <TableRow key={q.question_number}>
              <TableCell
                className="question-text-cell"
                style={{
                  userSelect: "text",
                  WebkitUserSelect: "text",
                  cursor: "text",
                  position: "relative",
                  zIndex: 1,
                }}
                onMouseDown={(e) => {
                  const t = e.target as HTMLElement;
                  if (t.tagName === "INPUT") return;
                  e.preventDefault();
                  e.stopPropagation();
                }}
                onMouseUp={(e) => {
                  const t = e.target as HTMLElement;
                  if (t.closest("input")) return;
                  e.stopPropagation();
                  setTimeout(checkSelection, 10);
                }}
              >
                {q.question_number}. {q.question_text}
              </TableCell>
              {opts.map((opt: any) => {
                const disabled =
                  !repeat && used.includes(opt.value) && value !== opt.value;
                return (
                  <TableCell key={opt.value}>
                    <FormField
                      control={form.control}
                      name={`answers.${idx}.answer`}
                      render={({ field }) => (
                        <FormItem className="flex justify-center">
                          <FormControl>
                            <input
                              type="radio"
                              checked={value === opt.value}
                              onChange={() =>
                                !disabled && field.onChange(opt.value)
                              }
                              onMouseDown={(e) => e.stopPropagation()}
                              disabled={disabled}
                              style={{
                                userSelect: "none",
                                pointerEvents: "auto",
                                width: 20,
                                height: 20,
                                accentColor: "#3b82f6",
                              }}
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                  </TableCell>
                );
              })}
            </TableRow>
          );
        };

        return (
          <div className="my-8 overflow-x-auto">
            <Table className="min-w-full border-collapse">
              <TableHeader>
                <TableRow>
                  <TableHead className="w-64"></TableHead>
                  {opts.map((o: any) => (
                    <TableHead key={o.value} className="text-center">
                      {o.value}
                    </TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {questions.map((q: any) => (
                  <Row key={q.question_number} q={q} />
                ))}
              </TableBody>
            </Table>
          </div>
        );
      }

      return undefined;
    },
  });

  return (
    <>
      <style jsx>{`
        .highlight {
          background-color: #fef08a !important;
          padding: 0 2px;
          border-radius: 2px;
          transition: background-color 0.2s;
        }
        .highlight:hover {
          background-color: #fde047 !important;
        }
        .question-text-cell,
        .question-text-cell * {
          user-select: text !important;
          -webkit-user-select: text !important;
          -moz-user-select: text !important;
          cursor: text !important;
        }
        input[type="radio"] {
          user-select: none !important;
          -webkit-user-select: none !important;
        }
      `}</style>

      <div
        ref={contentRef}
        className={`prose max-w-none ${className}`}
        style={{ userSelect: "text" }}
      >
        {parsed}
      </div>

      {/* Dropdown */}
      {enabledHighlight && dropdownPos && (
        <div
          className="fixed z-50 flex gap-1 rounded-md border bg-white p-1 shadow-lg"
          style={{
            left: dropdownPos.x,
            top: dropdownPos.y,
            transform: "translateX(-50%)",
          }}
          onMouseDown={(e) => e.stopPropagation()}
        >
          {!selectedHighlight && (
            <Button
              size="sm"
              onClick={onHighlight}
              className="h-8 px-2 text-xs"
            >
              <RiMarkPenLine className="mr-1 h-3 w-3" />
              Highlight
            </Button>
          )}
          <Button
            size="sm"
            variant="destructive"
            onClick={onClear}
            className="h-8 px-2 text-xs"
          >
            <RiEraserLine className="mr-1 h-3 w-3" />
            Clear
          </Button>
        </div>
      )}
    </>
  );
};

export default ReadingQuestionRenderer;
