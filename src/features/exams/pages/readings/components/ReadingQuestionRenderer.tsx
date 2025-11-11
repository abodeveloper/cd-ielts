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
      // Check if it's directly inside FormControl or FormItem (radio button area)
      const closestFormControl = node.closest(".FormControl, .FormItem");
      if (closestFormControl) {
        return true;
      }
    }
    // For text nodes, check if parent is a form control
    if (node.nodeType === Node.TEXT_NODE && node.parentElement) {
      const parent = node.parentElement;
      // Don't highlight text inside form controls
      if (parent.closest(".FormControl, .FormItem")) {
        return true;
      }
      // Allow highlighting question text in table cells
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
          let xPos = rect.left + window.scrollX + rect.width / 2;
          if (xPos + dropdownWidth / 2 > viewportWidth) {
            xPos = viewportWidth - dropdownWidth / 2 - 10;
          } else if (xPos - dropdownWidth / 2 < 0) {
            xPos = dropdownWidth / 2 + 10;
          }
          setDropdownPos({
            x: xPos,
            y: rect.bottom + window.scrollY + 10,
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
        // Check if clicked on form elements
        if (
          ["input", "button", "textarea", "select", "label"].includes(tagName)
        ) {
          return;
        }
        // Check if clicked inside form control (radio button area)
        if (target.closest(".FormControl, .FormItem")) {
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
        // Check if clicked on form elements
        if (
          ["input", "button", "textarea", "select", "label"].includes(tagName)
        ) {
          return;
        }
        // Check if clicked inside form control (radio button area)
        if (target.closest(".FormControl, .FormItem")) {
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
      if (!contentRef.current?.contains(e.target as Node)) {
        setSelectedHighlightElement(null);
        setDropdownPos(null);
      }
    };
    document.body.addEventListener("click", handleBodyClick);
    return () => {
      document.removeEventListener("mouseup", handleMouseUp as EventListener);
      document.removeEventListener(
        "dblclick",
        handleDoubleClick as EventListener
      );
      document.body.removeEventListener("click", handleBodyClick);
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
    let xPos = rect.left + window.scrollX + rect.width / 2;
    if (xPos + dropdownWidth / 2 > viewportWidth) {
      xPos = viewportWidth - dropdownWidth / 2 - 10;
    } else if (xPos - dropdownWidth / 2 < 0) {
      xPos = dropdownWidth / 2 + 10;
    }
    setDropdownPos({
      x: xPos,
      y: rect.bottom + window.scrollY + 10,
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
  const parsedHtml = parse(safeHtml, {
    replace: (domNode) => {
      if (domNode instanceof Element) {
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
            type === ReadingQuestionType.MULTIPLE_CHOICE
          ) {
            return (
              <div style={{ margin: "8px 0" }} key={number}>
                {inputElement}
              </div>
            );
          }
          return (
            <span
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
          let options: { value: string; label: string }[] = [];
          let questions: { question_number: number; question_text: string }[] =
            [];
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
                  {questions.map((question, index) => {
                    const questionIndex = question.question_number - 1;

                    // useWatch yordamida joriy savol javobini kuzatamiz - har bir cell uchun alohida
                    const TableTegsRow = () => {
                      const currentValue = useWatch({
                        control: form.control,
                        name: `answers.${questionIndex}.answer`,
                      });
                      return (
                        <TableRow key={index}>
                          <TableCell className="question-text-cell">
                            {question?.question_number}.{" "}
                            {question?.question_text}
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
                                          checked={
                                            currentValue === option.value
                                          }
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
                    };
                    return <TableTegsRow key={index} />;
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
                  {options?.map((option, index) => (
                    <TableRow key={index}>
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
          let options: { value: string; label: string }[] = [];
          let questions: { question_number: number; question_text: string }[] =
            [];
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
          // TableTegsRow komponenti - har bir qatorni alohida komponent qilib ajratamiz
          const TableTegsRow = ({
            question,
            index,
          }: {
            question: any;
            index: number;
          }) => {
            const questionIndex = question.question_number - 1;

            // useWatch yordamida joriy savol javobini kuzatamiz
            const currentValue = useWatch({
              control: form.control,
              name: `answers.${questionIndex}.answer`,
            });
            // Barcha savollarning javoblarini kuzatamiz (repeat_answer false bo'lsa kerak)
            const allAnswers = useWatch({
              control: form.control,
              name: "answers",
            });
            // Agar repeat_answer false bo'lsa, boshqa savollarda ishlatilgan optionlarni topish
            const usedOptions = !repeatAnswer
              ? questions
                  .filter(
                    (q: any) => q.question_number !== question.question_number
                  )
                  .map((q: any) => {
                    const qIndex = q.question_number - 1;
                    return allAnswers?.[qIndex]?.answer;
                  })
                  .filter((val: any) => val && String(val).trim() !== "")
              : [];
            return (
              <TableRow key={index}>
                <TableCell className="question-text-cell">
                  {question?.question_number}. {question?.question_text}
                </TableCell>
                {options?.map((option: any) => {
                  const isUsed =
                    !repeatAnswer && usedOptions.includes(option.value);
                  const isCurrentOption = currentValue === option.value;

                  // Agar option ishlatilgan bo'lsa va bu joriy savolning javobi bo'lmasa, disabled qilish
                  const isDisabled = isUsed && !isCurrentOption;
                  return (
                    <TableCell key={option.value}>
                      <FormField
                        control={form.control}
                        name={`answers.${questionIndex}.answer`}
                        render={({ field }) => {
                          const handleRadioClick = (e: React.MouseEvent) => {
                            e.stopPropagation();
                            if (!isDisabled) {
                              field.onChange(option.value);
                            }
                          };
                          return (
                            <FormItem className="flex items-center space-x-2">
                              <FormControl>
                                <input
                                  type="radio"
                                  onClick={handleRadioClick}
                                  onChange={(e) => {
                                    if (e.target.checked && !isDisabled) {
                                      field.onChange(option.value);
                                    }
                                  }}
                                  checked={currentValue === option.value}
                                  name={`table_tegs_input_question_${question.question_number}`}
                                  value={option.value}
                                  id={`${question.question_number}_${option.value}_input`}
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
          };
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
                  {questions.map((question, index) => (
                    <TableTegsRow
                      key={question.question_number}
                      question={question}
                      index={index}
                    />
                  ))}
                </TableBody>
              </Table>
            </div>
          );
        }
        // DRAG-DROP-MATCHING-SENTENCE-ENDINGS - Form bilan sinxronlashtirilgan versiya
        if (domNode.name === "drag-drop-matching-sentence-endings") {
          const { attribs } = domNode;
          let options: { value: string; label: string }[] = [];
          try {
            options = JSON.parse(attribs["data-options"] || "[]");
          } catch (error) {
            console.error("Invalid data-options JSON:", error);
            return (
              <span className="text-destructive">
                Invalid drag drop options
              </span>
            );
          }
          if (!options.length) {
            console.warn(
              "No options provided for drag-drop-matching-sentence-endings:",
              attribs
            );
            return (
              <span className="text-destructive">No drag drop options</span>
            );
          }
          const isRepeat = attribs["data-repeat"] === "True";
          const [droppedValues, setDroppedValues] = useState<{
            [key: string]: string;
          }>({});
          const [usedOptions, setUsedOptions] = useState<Set<string>>(
            new Set()
          );
          // Form qiymatlaridan droppedValues va usedOptions ni sinxronlash
          useEffect(() => {
            const answers = form.getValues("answers") || [];
            const newDroppedValues: { [key: string]: string } = {};
            const newUsedOptions = new Set<string>();
            answers.forEach((answer: any, index: number) => {
              if (answer?.answer) {
                newDroppedValues[(index + 1).toString()] = answer.answer;
                if (!isRepeat) {
                  newUsedOptions.add(answer.answer);
                }
              }
            });
            setDroppedValues(newDroppedValues);
            setUsedOptions(newUsedOptions);
          }, [htmlString, form, isRepeat]);
          const handleDragStart = (
            e: React.DragEvent<HTMLDivElement>,
            value: string
          ) => {
            e.dataTransfer.setData("text/plain", value);
            e.currentTarget.style.opacity = "0.5";
            handlePreventSelection(e);
          };
          const handleDragEnd = (e: React.DragEvent<HTMLDivElement>) => {
            e.currentTarget.style.opacity = "1";
          };
          const handleDrop = (
            e: React.DragEvent<HTMLDivElement>,
            questionNumber: string
          ) => {
            e.preventDefault();
            const value = e.dataTransfer.getData("text/plain");
            if (value) {
              const oldValue = droppedValues[questionNumber];
              if (oldValue && !isRepeat) {
                setUsedOptions((prev) => {
                  const newSet = new Set(prev);
                  newSet.delete(oldValue);
                  return newSet;
                });
              }
              setDroppedValues((prev) => ({
                ...prev,
                [questionNumber]: value,
              }));
              if (!isRepeat) {
                setUsedOptions((prev) => new Set([...prev, value]));
              }
              const answerIndex = parseInt(questionNumber) - 1;
              form.setValue(`answers.${answerIndex}.answer`, value);
              e.currentTarget.style.backgroundColor = "";
            }
          };
          const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
            e.preventDefault();
            e.currentTarget.style.backgroundColor = "#e0f7fa";
          };
          const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
            e.currentTarget.style.backgroundColor = "";
          };
          const handleClear = (questionNumber: string) => {
            const value = droppedValues[questionNumber];
            setDroppedValues((prev) => {
              const newValues = { ...prev };
              delete newValues[questionNumber];
              return newValues;
            });
            if (!isRepeat && value) {
              setUsedOptions((prev) => {
                const newSet = new Set(prev);
                newSet.delete(value);
                return newSet;
              });
            }
            const answerIndex = parseInt(questionNumber) - 1;
            form.setValue(`answers.${answerIndex}.answer`, "");
          };
          return (
            <div className="my-6">
              {domToReact(domNode.children, {
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
                        <span className="text-destructive">
                          Invalid drag-drop input
                        </span>
                      );
                    }
                    return (
                      <span
                        key={number}
                        onDrop={(e) => handleDrop(e, number)}
                        onDragOver={handleDragOver}
                        onDragLeave={handleDragLeave}
                        className="inline-block min-w-[150px] border-2 border-gray-400 border-dashed p-1 my-1 mx-2 rounded-md text-center"
                      >
                        {droppedValues[number] ? (
                          <div className="flex items-center justify-between">
                            <span className="font-semibold">
                              {options.find(
                                (opt) => opt.value === droppedValues[number]
                              )?.label || droppedValues[number]}
                            </span>
                            <button
                              onClick={() => handleClear(number)}
                              onMouseDown={handlePreventSelection}
                              className="text-destructive hover:text-destructive/70 ml-2"
                            >
                              <RiCloseLine size={20} />
                            </button>
                          </div>
                        ) : (
                          <span className="text-muted-foreground">
                            {number}
                          </span>
                        )}
                      </span>
                    );
                  }
                  return undefined;
                },
              })}
              <div className="flex flex-wrap gap-3 mt-6">
                {options.map(
                  (option) =>
                    (!usedOptions.has(option.value) || isRepeat) && (
                      <div
                        key={option.value}
                        draggable
                        onDragStart={(e) => handleDragStart(e, option.value)}
                        onDragEnd={handleDragEnd}
                        className="p-2 bg-primary text-primary-foreground rounded-lg cursor-move hover:bg-muted-foreground transition-colors min-w-[150px] text-center"
                      >
                        {option.label}
                      </div>
                    )
                )}
              </div>
            </div>
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
