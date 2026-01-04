import type React from "react";
import parse, { Element, domToReact } from "html-react-parser";
import { useRef, useEffect, useState, useCallback, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { RiCloseLine, RiEraserLine, RiMarkPenLine } from "@remixicon/react";
import { ReadingFormValues } from "@/features/exams/schemas/reading-schema";
import MyQuestionCheckboxGroup from "@/shared/components/atoms/question-inputs/MyQuestionCheckboxGroup";
import { ReadingQuestionType } from "@/shared/enums/reading-question-type.enum";
import { UseFormReturn, useWatch } from "react-hook-form";
import DragDropTags from "./DragDropTags";
import ReadingQuestionInput from "./ReadingQuestionInput";
import ImageDrawer from "@/shared/components/atoms/image-drawer/ImageDrawer";
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
  FormField,
  FormItem,
  FormLabel,
} from "@/components/ui/form";
interface ReadingQuestionRendererProps {
  htmlString: string;
  form: UseFormReturn<ReadingFormValues>;
  className?: string;
  enabledHighlight?: boolean;
  storageKey?: string; // Optional: unique key for persistence
}

type TableOption = {
  value: string;
  label: string;
};

type TableQuestion = {
  question_number: number | string;
  question_text: string;
};

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
    width: number;
  } | null>(null);
  const [selectedHighlightElement, setSelectedHighlightElement] =
    useState<HTMLElement | null>(null);
  const lastMouseUpTimeRef = useRef<number>(0);
  const selectionTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const answers = useWatch({
    control: form.control,
    name: "answers",
  });

  // Use localStorage for highlights (separate from form values)
  const [currentHtml, setCurrentHtml] = useState<string>(htmlString);
  const highlightsAppliedRef = useRef(false);
  const generateHighlightId = () =>
    Date.now().toString() + Math.random().toString(36).slice(2);
  const isNonSelectableElement = (node: Node): boolean => {
    if (node instanceof HTMLElement) {
      const tagName = node.tagName.toLowerCase();
      // Check if it's a non-selectable element (input, button, etc.)
      if (["input", "button", "textarea", "select"].includes(tagName)) {
        return true;
      }
      // Allow highlighting in labels - they contain the option text
      if (tagName === "label" || node.closest("label")) {
        return false;
      }
      // Check if it's directly inside FormControl (the actual input wrapper)
      // But allow FormItem and FormLabel for highlighting option text
      const closestFormControl = node.closest(".FormControl");
      if (closestFormControl) {
        // Allow highlighting if it's in a label or FormLabel
        if (node.closest("label, .FormLabel, [role='label']")) {
          return false;
        }
        return true;
      }
      // Allow highlighting in FormItem and FormLabel (option text areas)
      if (node.closest(".FormItem, .FormLabel")) {
        return false;
      }
    }
    // For text nodes, check if parent is a form control
    if (node.nodeType === Node.TEXT_NODE && node.parentElement) {
      const parent = node.parentElement;
      // Allow highlighting text in labels and FormLabel
      if (parent.tagName.toLowerCase() === "label" || 
          parent.closest("label, .FormLabel, [role='label']")) {
        return false;
      }
      // Don't highlight text directly inside FormControl (the input wrapper)
      if (parent.closest(".FormControl")) {
        // But allow if it's in a label
        if (parent.closest("label, .FormLabel")) {
          return false;
        }
        return true;
      }
      // Allow highlighting question text in table cells and FormItem
      if (parent.closest(".FormItem")) {
        return false;
      }
      return false;
    }
    return false;
  };
  const applyHighlightToRange = (range: Range, highlightId: string) => {
    try {
      if (range.collapsed) return;
      if (
        isNonSelectableElement(range.startContainer) ||
        isNonSelectableElement(range.endContainer)
      ) {
        return;
      }
      if (
        range.startContainer.nodeType === Node.TEXT_NODE &&
        range.startOffset > 0
      ) {
        const newNode = range.startContainer.splitText(range.startOffset);
        range.setStart(newNode, 0);
      }
      if (
        range.endContainer.nodeType === Node.TEXT_NODE &&
        range.endOffset < range.endContainer.textContent!.length
      ) {
        range.endContainer.splitText(range.endOffset);
      }
      const fragment = range.extractContents();
      const span = document.createElement("span");
      span.className = "highlight";
      span.dataset.highlightId = highlightId;
      span.appendChild(fragment);
      range.insertNode(span);
      span.parentNode?.normalize();
      // Save highlights to localStorage
      if (storageKey && contentRef.current) {
        setTimeout(() => {
          if (contentRef.current) {
            try {
              localStorage.setItem(
                `highlights_${storageKey}`,
                contentRef.current.innerHTML
              );
            } catch (error) {
              console.warn("Failed to save highlights:", error);
            }
          }
        }, 0);
      }
    } catch (error) {
      console.warn("Error applying highlight:", error);
    }
  };
  const getAllNodesInRange = (range: Range): Node[] => {
    if (!contentRef.current) return [];
    const nodes: Node[] = [];
    const treeWalker = document.createTreeWalker(
      contentRef.current,
      NodeFilter.SHOW_TEXT | NodeFilter.SHOW_ELEMENT,
      {
        acceptNode(node) {
          if (isNonSelectableElement(node)) return NodeFilter.FILTER_REJECT;
          if (range.intersectsNode(node)) return NodeFilter.FILTER_ACCEPT;
          return NodeFilter.FILTER_SKIP;
        },
      }
    );
    let currentNode = treeWalker.nextNode();
    while (currentNode) {
      nodes.push(currentNode);
      currentNode = treeWalker.nextNode();
    }
    return nodes;
  };
  const handleHighlightClick = () => {
    if (!enabledHighlight || !selectedRange) return;
    const highlightId = generateHighlightId();
    const range = selectedRange.cloneRange();
    const nodes = getAllNodesInRange(range);
    if (nodes.length === 0) {
      applyHighlightToRange(range, highlightId);
    } else {
      nodes.forEach((node) => {
        if (node.nodeType === Node.TEXT_NODE) {
          const nodeRange = document.createRange();
          nodeRange.selectNodeContents(node);
          if (range.comparePoint(node, 0) < 0) {
            nodeRange.setStart(range.startContainer, range.startOffset);
          }
          if (range.comparePoint(node, node.textContent!.length) > 0) {
            nodeRange.setEnd(range.endContainer, range.endOffset);
          }
          if (!nodeRange.collapsed) {
            applyHighlightToRange(nodeRange, highlightId);
          }
        }
      });
    }
    setSelectedRange(null);
    setDropdownPos(null);
    setSelectedHighlightElement(null);
  };
  const processSelection = useCallback(() => {
    if (!enabledHighlight) return;
    if (selectionTimeoutRef.current) {
      clearTimeout(selectionTimeoutRef.current);
    }
    selectionTimeoutRef.current = setTimeout(() => {
      const selection = window.getSelection();
      if (
        selection &&
        selection.rangeCount > 0 &&
        contentRef.current?.contains(selection.anchorNode!)
      ) {
        const range = selection.getRangeAt(0);
        const selectedText = selection.toString().trim();
        if (
          isNonSelectableElement(range.startContainer) ||
          isNonSelectableElement(range.endContainer)
        ) {
          setSelectedRange(null);
          setSelectedHighlightElement(null);
          setDropdownPos(null);
          return;
        }
        if (!range.collapsed && selectedText.length > 0) {
          const rect = range.getBoundingClientRect();
          const commonAncestor =
            range.commonAncestorContainer instanceof HTMLElement
              ? range.commonAncestorContainer
              : range.commonAncestorContainer.parentElement;
          if (
            commonAncestor &&
            commonAncestor.classList?.contains("highlight")
          ) {
            setSelectedHighlightElement(commonAncestor);
            setSelectedRange(null);
          } else {
            setSelectedHighlightElement(null);
            setSelectedRange(range);
          }
          const viewportWidth = window.innerWidth;
          const dropdownWidth = 200;
          const dropdownHeight = 50;
          
          // X o'qi bo'yicha pozitsiyani hisoblash
          let xPos = rect.left + window.scrollX + rect.width / 2;
          if (xPos + dropdownWidth / 2 > viewportWidth + window.scrollX) {
            xPos = viewportWidth + window.scrollX - dropdownWidth / 2 - 10;
          } else if (xPos - dropdownWidth / 2 < window.scrollX) {
            xPos = window.scrollX + dropdownWidth / 2 + 10;
          }
          
          // Y o'qi bo'yicha: HAR DOIM yuqori qismga qo'yish - matnning tepasidan kamida 35px masofada
          let yPos = rect.top + window.scrollY - dropdownHeight - 35; // Tanlangan matnning yuqori qismidan kamida 35px yuqoriga
          // Agar yuqori qism ekrandan chiqib ketsa, faqat o'sha holda pastki qismga qo'yish
          if (yPos < window.scrollY) {
            yPos = rect.bottom + window.scrollY + 35; // Pastki qismga fallback (35px masofada)
          }
          
          setDropdownPos({
            x: xPos,
            y: yPos,
            width: dropdownWidth,
          });
        } else {
          setSelectedRange(null);
          setSelectedHighlightElement(null);
          setDropdownPos(null);
        }
      } else {
        setSelectedRange(null);
        setSelectedHighlightElement(null);
        setDropdownPos(null);
      }
    }, 150);
  }, [enabledHighlight]);
  const handleMouseUp = useCallback(
    (e: MouseEvent) => {
      // Agar radio button, input, button yoki form elementiga bosilsa, highlight qilishni to'xtatamiz
      const target = e.target as HTMLElement;
      if (target) {
        const tagName = target.tagName?.toLowerCase();
        // Check if clicked on form elements (actual inputs)
        if (
          ["input", "button", "textarea", "select"].includes(tagName)
        ) {
          return;
        }
        // Allow highlighting in labels and FormLabel (option text)
        if (tagName === "label" || target.closest("label, .FormLabel")) {
          // Allow selection in labels - they contain option text
          const currentTime = Date.now();
          if (currentTime - lastMouseUpTimeRef.current < 300) {
            return;
          }
          lastMouseUpTimeRef.current = currentTime;
          processSelection();
          return;
        }
        // Check if clicked directly on FormControl (the input wrapper)
        // But allow if it's in a label area
        if (target.closest(".FormControl")) {
          // Allow if it's in a label
          if (target.closest("label, .FormLabel")) {
            const currentTime = Date.now();
            if (currentTime - lastMouseUpTimeRef.current < 300) {
              return;
            }
            lastMouseUpTimeRef.current = currentTime;
            processSelection();
            return;
          }
          return;
        }
        // Allow highlighting in FormItem (contains labels and option text)
        if (target.closest(".FormItem")) {
          const currentTime = Date.now();
          if (currentTime - lastMouseUpTimeRef.current < 300) {
            return;
          }
          lastMouseUpTimeRef.current = currentTime;
          processSelection();
          return;
        }
      }
      const currentTime = Date.now();
      if (currentTime - lastMouseUpTimeRef.current < 300) {
        return;
      }
      lastMouseUpTimeRef.current = currentTime;
      processSelection();
    },
    [processSelection]
  );
  const handleDoubleClick = useCallback(
    (e: MouseEvent) => {
      // Agar radio button, input yoki form elementiga bosilsa, highlight qilishni to'xtatamiz
      const target = e.target as HTMLElement;
      if (target) {
        const tagName = target.tagName?.toLowerCase();
        // Check if clicked on form elements (actual inputs)
        if (
          ["input", "button", "textarea", "select"].includes(tagName)
        ) {
          return;
        }
        // Allow highlighting in labels and FormLabel (option text)
        if (tagName === "label" || target.closest("label, .FormLabel")) {
          processSelection();
          return;
        }
        // Check if clicked directly on FormControl (the input wrapper)
        if (target.closest(".FormControl")) {
          // Allow if it's in a label
          if (target.closest("label, .FormLabel")) {
            processSelection();
            return;
          }
          return;
        }
        // Allow highlighting in FormItem (contains labels and option text)
        if (target.closest(".FormItem")) {
          processSelection();
          return;
        }
      }
      processSelection();
    },
    [processSelection]
  );
  useEffect(() => {
    if (!enabledHighlight) return;
    document.addEventListener("mouseup", handleMouseUp as EventListener);
    document.addEventListener("dblclick", handleDoubleClick as EventListener);
    const handleBodyClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      // Don't clear highlights when clicking on images or image containers
      if (target.closest('img') || target.closest('.image-drawer-container') || target.tagName === 'IMG') {
        return;
      }
      if (!contentRef.current?.contains(target)) {
        setSelectedHighlightElement(null);
        setDropdownPos(null);
      }
    };

    // Preserve browser selection on scroll
    const handleScroll = (e: Event) => {
      // Browser automatically preserves selection on scroll, just prevent our handlers from interfering
      const selection = window.getSelection();
      if (selection && selection.toString().trim().length > 0) {
        // Selection is preserved automatically by browser
        e.stopPropagation();
      }
    };

    document.body.addEventListener("click", handleBodyClick);
    window.addEventListener("scroll", handleScroll, { passive: true });
    document.addEventListener("scroll", handleScroll, { passive: true });

    return () => {
      document.removeEventListener("mouseup", handleMouseUp as EventListener);
      document.removeEventListener(
        "dblclick",
        handleDoubleClick as EventListener
      );
      document.body.removeEventListener("click", handleBodyClick);
      window.removeEventListener("scroll", handleScroll);
      document.removeEventListener("scroll", handleScroll);
      if (selectionTimeoutRef.current) {
        clearTimeout(selectionTimeoutRef.current);
      }
    };
  }, [handleMouseUp, handleDoubleClick, enabledHighlight]);
  const handleHighlightElementClick = (e: React.MouseEvent<HTMLElement>) => {
    e.stopPropagation();
    const target = e.currentTarget;
    setSelectedHighlightElement(target);
    setSelectedRange(null);
    const rect = target.getBoundingClientRect();
    const viewportWidth = window.innerWidth;
    const dropdownWidth = 200;
    const dropdownHeight = 50;
    
    // X o'qi bo'yicha pozitsiyani hisoblash
    let xPos = rect.left + window.scrollX + rect.width / 2;
    if (xPos + dropdownWidth / 2 > viewportWidth + window.scrollX) {
      xPos = viewportWidth + window.scrollX - dropdownWidth / 2 - 10;
    } else if (xPos - dropdownWidth / 2 < window.scrollX) {
      xPos = window.scrollX + dropdownWidth / 2 + 10;
    }
    
    // Y o'qi bo'yicha: HAR DOIM yuqori qismga qo'yish - matnning tepasidan kamida 35px masofada
    let yPos = rect.top + window.scrollY - dropdownHeight - 35; // Tanlangan matnning yuqori qismidan kamida 35px yuqoriga
    // Agar yuqori qism ekrandan chiqib ketsa, faqat o'sha holda pastki qismga qo'yish
    if (yPos < window.scrollY) {
      yPos = rect.bottom + window.scrollY + 35; // Pastki qismga fallback (35px masofada)
    }
    
    setDropdownPos({
      x: xPos,
      y: yPos,
      width: dropdownWidth,
    });
  };
  const handleClearClick = () => {
    if (!enabledHighlight) return;
    try {
      if (selectedHighlightElement) {
        const targetElement = selectedHighlightElement;
        const parent = targetElement.parentNode;
        if (parent) {
          while (targetElement.firstChild) {
            parent.insertBefore(targetElement.firstChild, targetElement);
          }
          parent.removeChild(targetElement);
          parent.normalize();
        }
      } else if (selectedRange && !selectedHighlightElement) {
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
          }
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
            parent.normalize();
          }
        });
      }
      // Save highlights to localStorage after clearing
      if (storageKey && contentRef.current) {
        setTimeout(() => {
          if (contentRef.current) {
            try {
              localStorage.setItem(
                `highlights_${storageKey}`,
                contentRef.current.innerHTML
              );
            } catch (error) {
              console.warn("Failed to save highlights:", error);
            }
          }
        }, 0);
      }
    } catch (error) {
      console.warn("Error clearing highlight:", error);
    }
    setSelectedRange(null);
    setSelectedHighlightElement(null);
    setDropdownPos(null);
  };
  const handlePreventSelection = (e: React.MouseEvent | React.DragEvent) => {
    const selection = window.getSelection();
    if (selection && selection.rangeCount > 0) {
      selection.removeAllRanges();
    }
  };
  // Update currentHtml when htmlString changes
  // ALWAYS use fresh htmlString to ensure form values are correct from localStorage
  useEffect(() => {
    setCurrentHtml(htmlString);
    highlightsAppliedRef.current = false;
  }, [htmlString]);
  // Restore highlights from localStorage after DOM is ready
  useEffect(() => {
    if (storageKey && contentRef.current && !highlightsAppliedRef.current) {
      try {
        const savedHighlights = localStorage.getItem(
          `highlights_${storageKey}`
        );
        if (savedHighlights) {
          // Wait for form inputs to render first
          setTimeout(() => {
            if (contentRef.current) {
              // Create a temporary div to parse saved HTML
              const tempDiv = document.createElement("div");
              tempDiv.innerHTML = savedHighlights;

              // Extract all highlight spans
              const highlightSpans = tempDiv.querySelectorAll(".highlight");

              if (highlightSpans.length > 0) {
                // Apply highlights to current DOM
                highlightSpans.forEach((savedSpan) => {
                  const highlightId =
                    savedSpan.getAttribute("data-highlight-id");
                  const textContent = savedSpan.textContent;

                  if (textContent && contentRef.current) {
                    // Find and highlight matching text in current DOM
                    const walker = document.createTreeWalker(
                      contentRef.current,
                      NodeFilter.SHOW_TEXT,
                      null
                    );

                    let node;
                    while ((node = walker.nextNode())) {
                      const text = node.textContent || "";
                      const index = text.indexOf(textContent);

                      if (index !== -1 && node.parentElement) {
                        // Check if already highlighted
                        if (
                          !node.parentElement.classList.contains("highlight")
                        ) {
                          try {
                            const range = document.createRange();
                            range.setStart(node, index);
                            range.setEnd(node, index + textContent.length);

                            const span = document.createElement("span");
                            span.className = "highlight";
                            span.dataset.highlightId =
                              highlightId || Date.now().toString();

                            const fragment = range.extractContents();
                            span.appendChild(fragment);
                            range.insertNode(span);

                            break;
                          } catch (e) {
                            // Continue to next match
                          }
                        }
                      }
                    }
                  }
                });
              }
            }
            highlightsAppliedRef.current = true;
          }, 150); // Small delay to ensure form inputs are rendered
        } else {
          highlightsAppliedRef.current = true;
        }
      } catch (error) {
        console.warn("Failed to restore highlights:", error);
        highlightsAppliedRef.current = true;
      }
    }
  }, [storageKey, currentHtml]);
  // Ensure currentHtml is always a valid string
  const safeHtml =
    typeof currentHtml === "string" && currentHtml.trim().length > 0
      ? currentHtml
      : htmlString;
  let dragDropBlockIndex = -1;
  const parsedHtml = parse(safeHtml, {
    replace: (domNode) => {
      if (domNode instanceof Element) {
        // Handle images - replace with ImageDrawer component
        if (domNode.name === "img" && domNode.attribs) {
          const { src, alt, style, className } = domNode.attribs;
          
          // Parse inline styles if present
          let parsedStyle: React.CSSProperties = {};
          if (style) {
            style.split(";").forEach((rule: string) => {
              const [property, value] = rule.split(":").map((s) => s.trim());
              if (property && value) {
                const camelProperty = property.replace(/-([a-z])/g, (g) => g[1].toUpperCase());
                parsedStyle[camelProperty as keyof React.CSSProperties] = value;
              }
            });
          }
          
          return (
            <ImageDrawer
              key={src || Math.random().toString()}
              src={src || ""}
              alt={alt || ""}
              style={parsedStyle}
              className={className || ""}
            />
          );
        }
        
        if (
          domNode.name === "span" &&
          domNode.attribs?.class?.includes("highlight")
        ) {
          return (
            <span
              {...domNode.attribs}
              onClick={handleHighlightElementClick}
              style={{ cursor: "pointer" }}
              key={domNode.attribs["data-highlight-id"] || undefined}
            >
              {domToReact(domNode.children)}
            </span>
          );
        }
        if (domNode.name === "question-input") {
          const { attribs } = domNode;
          const number = attribs["data-question-number"] ?? "";
          const type = attribs["data-question-type"] ?? "";
          let options: any[] = [];
          let questions: any[] = [];
          try {
            options = JSON.parse(attribs["data-question-options"] || "[]");
            questions = JSON.parse(attribs["data-question"] || "[]");
          } catch (error) {
            console.warn("Error parsing question-input attributes:", error);
            return (
              <span className="text-destructive">Invalid question input</span>
            );
          }
          if (!number || !type) {
            console.warn("Missing question-number or question-type:", attribs);
            return (
              <span className="text-destructive">Invalid question input</span>
            );
          }
          const inputElement = (
            <ReadingQuestionInput
              number={number}
              type={type}
              form={form}
              options={options}
              questions={questions}
            />
          );
          if (
            type === ReadingQuestionType.TRUE_FALSE_NOT_GIVEN ||
            type === ReadingQuestionType.YES_NO_NOT_GIVEN ||
            type === ReadingQuestionType.MULTIPLE_CHOICE ||
            type === "multiple_choice_with_multiple_answer"
          ) {
            return (
              <div 
                id={`question-${number}`}
                style={{ margin: "8px 0", userSelect: "text" }} 
                className="select-text"
                key={number}
              >
                {inputElement}
              </div>
            );
          }
          return (
            <span
              id={`question-${number}`}
              style={{
                display: "inline-block",
                minWidth: 150,
              }}
              key={number}
            >
              {inputElement}
            </span>
          );
        }
        if (domNode.name === "list-selection-tegs") {
          const { attribs } = domNode;
          let questionNumbers: string[] = [];
          let options: any[] = [];
          const questionType = attribs["question_type"] || "";
          try {
            questionNumbers = JSON.parse(attribs["question_numbers"] || "[]");
            options = JSON.parse(attribs["data-options"] || "[]");
          } catch (error) {
            console.warn(
              "Error parsing list-selection-tegs attributes:",
              error
            );
            return (
              <span className="text-destructive">
                Invalid list selection tags
              </span>
            );
          }
          if (
            !questionNumbers.length ||
            !options.length ||
            questionType !== ReadingQuestionType.LIST_SELECTION
          ) {
            console.warn("Invalid list-selection-tegs attributes:", attribs);
            return (
              <span className="text-destructive">
                Invalid list selection tags
              </span>
            );
          }
          const formattedOptions = options.map(
            (option: { label: string; value: string }) => ({
              value: option.value,
              label: option.label || option.value,
              id: `sharedAnswers_${questionNumbers.join("_")}_${option.value}`,
            })
          );
          return (
            <div className="my-6" key={questionNumbers.join("_")}>
              <MyQuestionCheckboxGroup
                control={form.control}
                name={`sharedAnswers_${questionNumbers.join("_")}`}
                options={formattedOptions}
                maxSelections={questionNumbers.length}
                orientation="vertical"
                className="w-full"
                onValueChange={(values: string[]) => {
                  questionNumbers.forEach((num: string, index: number) => {
                    const answerIndex = parseInt(num) - 1;
                    form.setValue(
                      `answers.${answerIndex}.answer`,
                      values[index] || ""
                    );
                  });
                }}
              />
            </div>
          );
        }
        if (domNode.name === "drag-drop-tegs") {
          const { attribs } = domNode;
          const repeatAnswer = Boolean(attribs["repeat_answer"] || false);
          let options: any[] = [];
          let questions: any[] = [];
          try {
            options = JSON.parse(attribs["data-options"] || "[]");
            questions = JSON.parse(attribs["data-questions"] || "[]");
          } catch (error) {
            console.warn("Error parsing drag-drop-tegs attributes:", error);
            return (
              <span className="text-destructive">Invalid drag-drop tags</span>
            );
          }
          return (
            <DragDropTags
              options={options}
              questions={questions}
              form={form}
              isRepeatAnswer={repeatAnswer}
            />
          );
        }
        // TABLE-TEGS - Form bilan sinxronlashtirilgan versiya
        if (domNode.name === "table-tegs") {
          const { attribs } = domNode;
          let options: TableOption[] = [];
          let questions: TableQuestion[] = [];
          const table_name = attribs["table_name"] || "";
          try {
            options = JSON.parse(attribs["data-options"] || "[]");
            questions = JSON.parse(attribs["data-questions"] || "[]");
          } catch (error) {
            console.warn("Error parsing table-tegs attributes:", error);
            return <span className="text-destructive">Invalid table tags</span>;
          }
          return (
            <div className="space-y-8 my-8">
              <Table className="selectable-table">
                <TableHeader>
                  <TableRow>
                    <TableHead></TableHead>
                    {options?.map((option) => (
                      <TableHead key={option.value}>{option.value}</TableHead>
                    ))}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {questions.map((question) => {
                    const parsedQuestionNumber = parseInt(
                      String(question.question_number),
                      10
                    );
                    if (
                      Number.isNaN(parsedQuestionNumber) ||
                      parsedQuestionNumber <= 0
                    ) {
                      console.warn(
                        "Invalid question number in table-tegs:",
                        question.question_number
                      );
                      return null;
                    }
                    const questionIndex = parsedQuestionNumber - 1;
                    const currentValue = answers?.[questionIndex]?.answer ?? "";
                    return (
                      <TableRow
                        id={`question-${question.question_number}`}
                        key={`table-tegs-${question.question_number}`}
                      >
                        <TableCell className="question-text-cell">
                          {question?.question_number}. {question?.question_text}
                        </TableCell>
                        {options?.map((option) => (
                          <TableCell key={option.value}>
                            <FormField
                              control={form.control}
                              name={`answers.${questionIndex}.answer`}
                              render={({ field }) => {
                                const handleRadioClick = (
                                  e: React.MouseEvent
                                ) => {
                                  e.stopPropagation();
                                  field.onChange(option.value);
                                };
                                return (
                                  <FormItem className="flex items-center space-x-2">
                                    <FormControl>
                                      <input
                                        type="radio"
                                        onClick={handleRadioClick}
                                        onChange={(e) => {
                                          if (e.target.checked) {
                                            field.onChange(option.value);
                                          }
                                        }}
                                        checked={currentValue === option.value}
                                        name={`table_tegs_question_${question.question_number}`}
                                        value={option.value}
                                        id={`${question.question_number}_${option.value}_table`}
                                        className="h-4 w-4 rounded-full border border-primary appearance-none
                                            checked:bg-white
                                            relative
                                            checked:after:content-['']
                                            checked:after:block
                                            checked:after:w-2.5 checked:after:h-2.5
                                            checked:after:rounded-full
                                            checked:after:bg-primary
                                            checked:after:mx-auto checked:after:my-auto
                                            checked:after:absolute checked:after:inset-0"
                                      />
                                    </FormControl>
                                  </FormItem>
                                );
                              }}
                            />
                          </TableCell>
                        ))}
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead colSpan={2}>{table_name}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {options?.map((option) => (
                    <TableRow key={option.value}>
                      <TableCell className="w-[50px]">{option.value}</TableCell>
                      <TableCell>{option.label}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          );
        }
        // TABLE-TEGS-INPUT - Form bilan sinxronlashtirilgan versiya
        if (domNode.name === "table-tegs-input") {
          const { attribs } = domNode;
          let options: TableOption[] = [];
          let questions: TableQuestion[] = [];
          const table_name = attribs["table_name"] || "";
          try {
            options = JSON.parse(attribs["data-options"] || "[]");
            questions = JSON.parse(attribs["data-questions"] || "[]");
          } catch (error) {
            console.warn("Error parsing table-tegs-input attributes:", error);
            return (
              <span className="text-destructive">Invalid table input tags</span>
            );
          }
          const repeatAnswer = attribs["repeat_answer"] !== "False"; // Default true if not specified

          const answerByQuestionNumber = new Map<string, string | undefined>(
            questions.map((question) => {
              const parsedQuestionNumber = parseInt(
                String(question.question_number),
                10
              );
              if (
                Number.isNaN(parsedQuestionNumber) ||
                parsedQuestionNumber <= 0
              ) {
                return [String(question.question_number), undefined];
              }
              const questionIndex = parsedQuestionNumber - 1;
              return [
                String(question.question_number),
                answers?.[questionIndex]?.answer ?? "",
              ];
            })
          );

          return (
            <div className="space-y-8 my-8">
              <Table className="selectable-table">
                <TableHeader>
                  <TableRow>
                    <TableHead></TableHead>
                    {options?.map((option) => (
                      <TableHead key={option.value}>{option.value}</TableHead>
                    ))}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {questions.map((question) => {
                    const parsedQuestionNumber = parseInt(
                      String(question.question_number),
                      10
                    );
                    if (
                      Number.isNaN(parsedQuestionNumber) ||
                      parsedQuestionNumber <= 0
                    ) {
                      console.warn(
                        "Invalid question number in table-tegs-input:",
                        question.question_number
                      );
                      return null;
                    }
                    const questionIndex = parsedQuestionNumber - 1;
                    const questionKey = String(question.question_number);
                    const currentValue =
                      answerByQuestionNumber.get(questionKey) ?? "";
                    return (
                      <TableRow
                        id={`question-${question.question_number}`}
                        key={`table-tegs-input-${question.question_number}`}
                      >
                        <TableCell className="question-text-cell">
                          {question?.question_number}. {question?.question_text}
                        </TableCell>
                        {options?.map((option) => {
                          const optionValue = option.value;
                          const isCurrentOption = currentValue === optionValue;
                          const isUsedElsewhere =
                            !repeatAnswer &&
                            Array.from(answerByQuestionNumber.entries()).some(
                              ([key, value]) =>
                                key !== questionKey &&
                                value &&
                                String(value).trim() !== "" &&
                                value === optionValue
                            );
                          const isDisabled =
                            isUsedElsewhere && !isCurrentOption;
                          return (
                            <TableCell key={option.value}>
                              <FormField
                                control={form.control}
                                name={`answers.${questionIndex}.answer`}
                                render={({ field }) => {
                                  const handleRadioClick = (
                                    e: React.MouseEvent
                                  ) => {
                                    e.stopPropagation();
                                    if (!isDisabled) {
                                      field.onChange(optionValue);
                                    }
                                  };
                                  return (
                                    <FormItem className="flex items-center space-x-2">
                                      <FormControl>
                                        <input
                                          type="radio"
                                          onClick={handleRadioClick}
                                          onChange={(e) => {
                                            if (
                                              e.target.checked &&
                                              !isDisabled
                                            ) {
                                              field.onChange(optionValue);
                                            }
                                          }}
                                          checked={isCurrentOption}
                                          name={`table_tegs_input_question_${question.question_number}`}
                                          value={optionValue}
                                          id={`${question.question_number}_${optionValue}_input`}
                                          disabled={isDisabled}
                                          className="h-4 w-4 rounded-full border border-primary appearance-none
                          checked:bg-white
                          relative
                          checked:after:content-['']
                          checked:after:block
                          checked:after:w-2.5 checked:after:h-2.5
                          checked:after:rounded-full
                          checked:after:bg-primary
                          checked:after:mx-auto checked:after:my-auto
                          checked:after:absolute checked:after:inset-0
                          disabled:cursor-not-allowed disabled:opacity-50"
                                        />
                                      </FormControl>
                                      <FormLabel></FormLabel>
                                    </FormItem>
                                  );
                                }}
                              />
                            </TableCell>
                          );
                        })}
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>

              {/* Options legend table (e.g. A = Peter Fleming)
                  table_name = "List" bo'lsa, faqat oddiy list deb qabul qilamiz
                  va alohida jadval ko'rsatmaymiz */}
              {options?.length > 0 && table_name && table_name !== "List" && (
                <Table className="selectable-table">
                  <TableHeader>
                    <TableRow>
                      <TableHead colSpan={2}>
                        {table_name || "Options"}
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {options.map((option) => (
                      <TableRow key={option.value}>
                        <TableCell className="w-[50px]">
                          {option.value}
                        </TableCell>
                        <TableCell>{option.label}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </div>
          );
        }
        // DRAG-DROP-MATCHING-SENTENCE-ENDINGS - Form bilan sinxronlashtirilgan versiya
        if (domNode.name === "drag-drop-matching-sentence-endings") {
          dragDropBlockIndex += 1;
            return (
            <DragDropMatchingBlock
              key={`drag-drop-${dragDropBlockIndex}`}
              blockKey={`drag-drop-${dragDropBlockIndex}`}
              element={domNode}
              form={form}
              onPreventSelection={handlePreventSelection}
            />
          );
        }
      }
      return undefined;
    },
  });
  return (
    <>
      <style>{`
        .highlight {
          background-color: #fde68a;
          transition: background-color 0.2s;
        }
        .highlight:hover {
          background-color: #fad980;
        }
        .drag-drop-container {
          min-height: 40px;
        }
        .drag-drop-option-used,
        .drag-drop-option-used *,
        .drag-drop-option-used span,
        .drag-drop-option-used p,
        .drag-drop-option-used div,
        .drag-drop-option-used button {
          color: black !important;
        }
        input, button, [draggable] {
          pointer-events: auto;
          user-select: none;
        }
        question-input, list-selection-tegs, drag-drop-tegs, table-tegs, table-tegs-input, drag-drop-matching-sentence-endings, drag-drop-sentence-input {
          user-select: text;
        }
        .selectable-table {
          user-select: text;
        }
        .selectable-table .question-text-cell {
          user-select: text;
          cursor: text;
        }
        .selectable-table td, .selectable-table th {
          user-select: text;
        }
        /* Ensure all text elements are selectable for highlighting */
        p, div, span, h1, h2, h3, h4, h5, h6, li, td, th {
          user-select: text;
          -webkit-user-select: text;
          -moz-user-select: text;
          -ms-user-select: text;
        }
        /* Ensure labels and option text are selectable */
        label, .FormLabel, [role="label"] {
          user-select: text !important;
          -webkit-user-select: text !important;
          -moz-user-select: text !important;
          -ms-user-select: text !important;
          cursor: text;
        }
        /* Ensure FormItem allows text selection (contains option labels) */
        .FormItem {
          user-select: text;
          -webkit-user-select: text;
        }
        /* But keep inputs non-selectable */
        .FormItem input[type="radio"],
        .FormItem input[type="checkbox"],
        .FormControl input {
          user-select: none !important;
          -webkit-user-select: none !important;
        }
        /* Ensure question containers are highlightable */
        [id^="question-"] {
          user-select: text !important;
          -webkit-user-select: text !important;
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
export default ReadingQuestionRenderer;

interface DragDropMatchingBlockProps {
  element: Element;
  form: UseFormReturn<ReadingFormValues>;
  blockKey: string;
  onPreventSelection?: (event: React.MouseEvent | React.DragEvent) => void;
}

const collectQuestionNumbers = (
  children: Element["children"] | undefined
): string[] => {
  const numbers: string[] = [];
  const traverse = (nodes: any[]) => {
    nodes?.forEach((node) => {
      if (node instanceof Element) {
        if (node.name === "drag-drop-sentence-input") {
          const num = node.attribs["data-question-number"];
          if (num) {
            numbers.push(num);
          }
        }
        if (node.children && node.children.length) {
          traverse(node.children);
        }
      }
    });
  };
  traverse(children || []);
  return numbers;
};

const DragDropMatchingBlock: React.FC<DragDropMatchingBlockProps> = ({
  element,
  form,
  blockKey,
  onPreventSelection,
}) => {
  const options = useMemo<{ value: string; label: string }[]>(() => {
    try {
      return JSON.parse(element.attribs["data-options"] || "[]");
    } catch (error) {
      console.error("Invalid data-options JSON:", error);
      return [];
    }
  }, [element]);

  if (!options.length) {
    return (
      <span className="text-destructive block my-4">
        No drag drop options
      </span>
    );
  }

  const isRepeat = element.attribs["data-repeat"] === "True";
  const questionNumbers = useMemo(
    () => collectQuestionNumbers(element.children),
    [element.children]
  );

  const [droppedValues, setDroppedValues] = useState<Record<string, string>>(
    {}
  );

  useEffect(() => {
    const answers = form.getValues("answers") || [];
    const nextValues: Record<string, string> = {};
    questionNumbers.forEach((number) => {
      const index = parseInt(number, 10) - 1;
      const answerValue = answers?.[index]?.answer;
      if (answerValue) {
        nextValues[number] = answerValue;
      }
    });

    setDroppedValues((prev) => {
      const prevSerialized = JSON.stringify(prev);
      const nextSerialized = JSON.stringify(nextValues);
      return prevSerialized === nextSerialized ? prev : nextValues;
    });
  }, [form, questionNumbers]);

  const usedOptions = useMemo(() => {
    if (isRepeat) return new Set<string>();
    return new Set(
      Object.values(droppedValues).filter((value) =>
        value ? String(value).trim().length > 0 : false
      )
    );
  }, [droppedValues, isRepeat]);

  const handleAssign = useCallback(
    (questionNumber: string, value: string) => {
      setDroppedValues((prev) => {
        const updated = { ...prev };

        if (!isRepeat) {
          Object.entries(updated).forEach(([key, val]) => {
            if (key !== questionNumber && val === value) {
              updated[key] = "";
              const otherIndex = parseInt(key, 10) - 1;
              form.setValue(`answers.${otherIndex}.answer`, "");
            }
          });
        }

        updated[questionNumber] = value;
        return updated;
      });

      const answerIndex = parseInt(questionNumber, 10) - 1;
      form.setValue(`answers.${answerIndex}.answer`, value);
    },
    [form, isRepeat]
  );

  const handleClear = useCallback(
    (questionNumber: string) => {
      setDroppedValues((prev) => {
        if (!prev[questionNumber]) return prev;
        const updated = { ...prev };
        updated[questionNumber] = "";
        return updated;
      });
      const answerIndex = parseInt(questionNumber, 10) - 1;
      form.setValue(`answers.${answerIndex}.answer`, "");
    },
    [form]
  );

  const handleDragStart = useCallback(
    (e: React.DragEvent<HTMLDivElement>, value: string) => {
      e.dataTransfer.setData("text/plain", value);
      e.currentTarget.style.opacity = "0.5";
      onPreventSelection?.(e);
    },
    [onPreventSelection]
  );

  const handleDragEnd = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.currentTarget.style.opacity = "1";
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent<HTMLSpanElement>, questionNumber: string) => {
      e.preventDefault();
      const value = e.dataTransfer.getData("text/plain");
      if (!value) return;
      handleAssign(questionNumber, value);
      e.currentTarget.style.backgroundColor = "";
    },
    [handleAssign]
  );

  const handleDragOver = useCallback((e: React.DragEvent<HTMLSpanElement>) => {
    e.preventDefault();
    e.currentTarget.style.backgroundColor = "#e0f7fa";
  }, []);

  const handleDragLeave = useCallback(
    (e: React.DragEvent<HTMLSpanElement>) => {
      e.currentTarget.style.backgroundColor = "";
    },
    []
  );

  const renderedInputs = useMemo(
    () =>
      domToReact(element.children, {
        replace: (innerNode) => {
          if (
            innerNode instanceof Element &&
            innerNode.name === "drag-drop-sentence-input"
          ) {
            const innerAttribs = innerNode.attribs;
            const number = innerAttribs["data-question-number"] ?? "";
            const type = innerAttribs["data-question-type"] ?? "";
            if (
              !number ||
              (type !== "matching_sentence_endings" &&
                type !== "matching_headings")
            ) {
              return (
                <span className="text-destructive" key={`${blockKey}-invalid`}>
                  Invalid drag-drop input
                </span>
              );
            }

            const value = droppedValues[number];
            const optionLabel =
              options.find((opt) => opt.value === value)?.label || value;
            
            // Parse label if it contains HTML, including buttons
            const parsedLabel = typeof optionLabel === 'string' 
              ? parse(optionLabel, {
                  replace: (domNode) => {
                    if (domNode instanceof Element && domNode.name === 'button') {
                      return (
                        <button
                          key={domNode.attribs?.key || value}
                          {...domNode.attribs}
                          className="text-black bg-white border border-gray-300 rounded px-2 py-1"
                          style={{ 
                            color: 'black', 
                            backgroundColor: '#FFFBF0', // Cream Cream color
                            borderColor: '#d1d5db'
                          }}
                        >
                          {domNode.children && domToReact(domNode.children)}
                        </button>
                      );
                    }
                    return domNode;
                  }
                })
              : optionLabel;

            return (
              <span
                key={`${blockKey}-${number}`}
                onDrop={(e) => handleDrop(e, number)}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                className="inline-block min-w-[150px] border-2 border-gray-400 border-dashed p-1 my-1 mx-2 rounded-md text-center align-middle"
                data-question-number={number}
              >
                {value ? (
                  <span className="inline-flex items-center justify-between gap-2 w-full">
                    <span 
                      className="font-semibold px-2 py-1 rounded"
                      style={{
                        backgroundColor: '#FFFBF0', // Cream Cream color
                        color: 'black'
                      }}
                    >
                      {parsedLabel}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleClear(number)}
                      onMouseDown={onPreventSelection}
                      className="text-destructive hover:text-destructive/70"
                    >
                      <RiCloseLine size={16} />
                    </button>
                  </span>
                ) : (
                  <span className="text-muted-foreground">{number}</span>
                )}
              </span>
            );
          }
          return innerNode;
        },
      }),
    [
      element.children,
      droppedValues,
      handleDrop,
      handleDragLeave,
      handleDragOver,
      handleClear,
      onPreventSelection,
      blockKey,
      options,
    ]
  );

  return (
    <span className="block my-6">
      {renderedInputs}
      <span className="block mt-16 mb-8">
        <div className="flex flex-wrap gap-3">
          {options.map((option) => {
            const isUsed = !isRepeat && usedOptions.has(option.value);
            
            // Parse label if it contains HTML, including buttons
            const parsedLabel = typeof option.label === 'string' 
              ? parse(option.label, {
                  replace: (domNode) => {
                    if (domNode instanceof Element && domNode.name === 'button') {
                      return (
                        <button
                          key={domNode.attribs?.key || option.value}
                          {...domNode.attribs}
                          className={`rounded px-2 py-1 border ${isUsed ? 'drag-drop-option-used' : ''}`}
                          style={{ 
                            color: isUsed ? 'black' : 'white', 
                            backgroundColor: isUsed ? '#FFFBF0' : '#1a1a1a', // Cream when used, black when default
                            borderColor: isUsed ? '#d1d5db' : '#404040'
                          }}
                        >
                          <span style={{ color: isUsed ? 'black' : 'white' }}>
                            {domNode.children && domToReact(domNode.children)}
                          </span>
                        </button>
                      );
                    }
                    return domNode;
                  }
                })
              : option.label;
            
            return (
              <div
                key={`${blockKey}-${option.value}`}
                draggable={!isUsed}
                onDragStart={!isUsed ? (e) => handleDragStart(e, option.value) : undefined}
                onDragEnd={handleDragEnd}
                className={`p-2 rounded-lg min-w-[150px] text-center cursor-move transition-colors ${
                  isUsed
                    ? "border-2 border-gray-300 border-dashed cursor-not-allowed drag-drop-option-used"
                    : "drag-drop-option"
                }`}
                style={isUsed ? { 
                  backgroundColor: '#FFFBF0', 
                  color: 'black',
                } : { 
                  backgroundColor: '#1a1a1a',
                  color: 'white',
                }}
              >
                <span 
                  style={{ 
                    color: isUsed ? 'black' : 'white',
                  }}
                >
                  {parsedLabel}
                </span>
              </div>
            );
          })}
        </div>
      </span>
    </span>
  );
};
