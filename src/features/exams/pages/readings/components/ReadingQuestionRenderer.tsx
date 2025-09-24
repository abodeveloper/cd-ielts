import parse, { Element, domToReact } from "html-react-parser";
import { useRef, useEffect, useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { RiCloseLine, RiEraserLine, RiMarkPenLine } from "@remixicon/react";
import { ReadingFormValues } from "@/features/exams/schemas/reading-schema";
import MyQuestionCheckboxGroup from "@/shared/components/atoms/question-inputs/MyQuestionCheckboxGroup";
import { ReadingQuestionType } from "@/shared/enums/reading-question-type.enum";
import { UseFormReturn } from "react-hook-form";
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

// List of custom tags to exclude from highlighting
const EXCLUDED_TAGS = [
  "question-input",
  "list-selection-tegs",
  "drag-drop-tegs",
  "table-tegs",
  "table-tegs-input",
  "drag-drop-matching-sentence-endings",
  "drag-drop-sentence-input",
];

interface ReadingQuestionRendererProps {
  htmlString: string;
  form: UseFormReturn<ReadingFormValues>;
  className?: string;
  enabledHighlight?: boolean;
}

const ReadingQuestionRenderer: React.FC<ReadingQuestionRendererProps> = ({
  htmlString,
  form,
  className = "",
  enabledHighlight = true,
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

  const generateHighlightId = () =>
    Date.now().toString() + Math.random().toString(36).slice(2);

  const isNodeInExcludedTag = (node: Node): boolean => {
    let currentNode: Node | null = node;
    while (currentNode && currentNode !== contentRef.current) {
      if (
        currentNode instanceof HTMLElement &&
        EXCLUDED_TAGS.includes(currentNode.tagName.toLowerCase())
      ) {
        return true;
      }
      currentNode = currentNode.parentNode;
    }
    return false;
  };

  const getAllBlocksInRange = (range: Range): HTMLElement[] => {
    if (!contentRef.current) return [];

    const blocks: HTMLElement[] = [];
    const treeWalker = document.createTreeWalker(
      contentRef.current,
      NodeFilter.SHOW_ELEMENT,
      {
        acceptNode(node) {
          if (!(node instanceof HTMLElement)) return NodeFilter.FILTER_REJECT;

          // Skip custom elements
          if (EXCLUDED_TAGS.includes(node.tagName.toLowerCase())) {
            return NodeFilter.FILTER_REJECT;
          }

          const style = window.getComputedStyle(node);
          if (
            (style.display === "block" ||
              style.display === "list-item" ||
              style.display === "table" ||
              ["P", "DIV", "LI"].includes(node.tagName)) &&
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
      blocks.push(currentNode as HTMLElement);
      currentNode = treeWalker.nextNode();
    }
    return blocks;
  };

  const applyHighlightToRange = (range: Range, highlightId: string) => {
    // Check if the range intersects with any excluded elements
    const commonAncestor = range.commonAncestorContainer;
    let parentElement: HTMLElement | null = null;

    if (commonAncestor.nodeType === Node.TEXT_NODE) {
      parentElement = commonAncestor.parentElement;
    } else if (commonAncestor instanceof HTMLElement) {
      parentElement = commonAncestor;
    }

    // If the range is inside an excluded tag, prevent highlighting
    if (
      parentElement &&
      EXCLUDED_TAGS.includes(parentElement.tagName.toLowerCase())
    ) {
      return;
    }

    // Check if the range contains any excluded elements
    const containsExcluded = Array.from(
      parentElement?.querySelectorAll(EXCLUDED_TAGS.join(","))
    ).some((el) => range.intersectsNode(el));

    if (containsExcluded) {
      return;
    }

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

        // Check if the selected range includes custom tags
        if (
          isNodeInExcludedTag(range.startContainer) ||
          isNodeInExcludedTag(range.endContainer)
        ) {
          setSelectedRange(null);
          setSelectedHighlightElement(null);
          setDropdownPos(null);
          return;
        }

        if (!range.collapsed && selectedText.length > 0) {
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
            y: rect.bottom + window.scrollY + 10,
            width: 0,
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

  const handleMouseUp = useCallback(() => {
    const currentTime = Date.now();
    if (currentTime - lastMouseUpTimeRef.current < 300) {
      return;
    }
    lastMouseUpTimeRef.current = currentTime;
    processSelection();
  }, [processSelection]);

  const handleDoubleClick = useCallback(() => {
    processSelection();
  }, [processSelection]);

  useEffect(() => {
    if (!enabledHighlight) return;
    document.addEventListener("mouseup", handleMouseUp);
    document.addEventListener("dblclick", handleDoubleClick);

    const handleBodyClick = (e: MouseEvent) => {
      if (!contentRef.current?.contains(e.target as Node)) {
        setSelectedHighlightElement(null);
        setDropdownPos(null);
      }
    };
    document.body.addEventListener("click", handleBodyClick);

    return () => {
      document.removeEventListener("mouseup", handleMouseUp);
      document.removeEventListener("dblclick", handleDoubleClick);
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
    setDropdownPos({
      x: rect.left + window.scrollX + rect.width / 2,
      y: rect.bottom + window.scrollY + 10,
      width: 0,
    });
  };

  const handleClearClick = () => {
    if (!enabledHighlight) return;

    if (selectedHighlightElement) {
      const targetElement = selectedHighlightElement;
      const parent = targetElement.parentNode;
      if (parent) {
        while (targetElement.firstChild) {
          parent.insertBefore(targetElement.firstChild, targetElement);
        }
        parent.removeChild(targetElement);
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

    setSelectedRange(null);
    setSelectedHighlightElement(null);
    setDropdownPos(null);
  };

  const parsedHtml = parse(htmlString, {
    replace: (domNode) => {
      if (domNode instanceof Element) {
        if (
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
              {domToReact(domNode.children)}
            </span>
          );
        }

        if (domNode.name === "question-input") {
          const { attribs } = domNode;
          const number = attribs["data-question-number"] ?? "";
          const type = attribs["data-question-type"] ?? "";
          const options = JSON.parse(attribs["data-question-options"] || "[]");
          const questions = JSON.parse(
            attribs["data-question"] ||
              `[
                
              ]`
          );

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
              <div style={{ margin: "8px 0", userSelect: "none" }} key={number}>
                {inputElement}
              </div>
            );
          }
          return (
            <span
              style={{
                display: "inline-block",
                minWidth: 150,
                userSelect: "none",
              }}
              key={number}
            >
              {inputElement}
            </span>
          );
        }

        if (domNode.name === "list-selection-tegs") {
          const { attribs } = domNode;
          const questionNumbers = JSON.parse(
            attribs["question_numbers"] || "[]"
          );
          const options = JSON.parse(attribs["data-options"] || "[]");
          const questionType = attribs["question_type"] || "";

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
            <div
              className="my-6"
              key={questionNumbers.join("_")}
              style={{ userSelect: "none" }}
            >
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
          const options = JSON.parse(attribs["data-options"] || "[]");
          const questions = JSON.parse(attribs["data-questions"] || "[]");

          return (
            <DragDropTags
              options={options}
              questions={questions}
              form={form}
              isRepeatAnswer={repeatAnswer}
              style={{ userSelect: "none" }}
            />
          );
        }

        if (domNode.name === "table-tegs") {
          const { attribs } = domNode;
          const options: { value: string; label: string }[] = JSON.parse(
            attribs["data-options"] || "[]"
          );
          const questions: {
            question_number: number;
            question_text: string;
          }[] = JSON.parse(attribs["data-questions"] || "[]");
          const table_name = attribs["table_name"] || "Legend";

          return (
            <div className="space-y-8 my-8" style={{ userSelect: "none" }}>
              <Table>
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
                    <TableRow key={index}>
                      <TableCell>
                        {question?.question_number}. {question?.question_text}
                      </TableCell>
                      {options?.map((option) => (
                        <TableCell key={option.value}>
                          <FormField
                            control={form.control}
                            name={`answers.${
                              question.question_number - 1
                            }.answer`}
                            render={({ field }) => (
                              <FormItem className="flex items-center space-x-2">
                                <FormControl>
                                  <input
                                    type="radio"
                                    onChange={() =>
                                      field.onChange(option.value)
                                    }
                                    value={option.value}
                                    id={`${question.question_number}`}
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
                              </FormItem>
                            )}
                          />
                        </TableCell>
                      ))}
                    </TableRow>
                  ))}
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

        if (domNode.name === "table-tegs-input") {
          const { attribs } = domNode;
          const options: { value: string; label: string }[] = JSON.parse(
            attribs["data-options"] || "[]"
          );
          const questions: {
            question_number: number;
            question_text: string;
          }[] = JSON.parse(attribs["data-questions"] || "[]");

          return (
            <div className="space-y-8 my-8" style={{ userSelect: "none" }}>
              <Table>
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
                    <TableRow key={index}>
                      <TableCell>
                        {question?.question_number}. {question?.question_text}
                      </TableCell>
                      {options?.map((option) => (
                        <TableCell key={option.value}>
                          <FormField
                            control={form.control}
                            name={`answers.${
                              question.question_number - 1
                            }.answer`}
                            render={({ field }) => (
                              <FormItem className="flex items-center space-x-2">
                                <FormControl>
                                  <input
                                    type="radio"
                                    onChange={() =>
                                      field.onChange(option.value)
                                    }
                                    name={`${question.question_number - 1}`}
                                    value={option.value}
                                    id={`${question.question_number}`}
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
                            )}
                          />
                        </TableCell>
                      ))}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          );
        }

        if (domNode.name === "drag-drop-matching-sentence-endings") {
          const { attribs } = domNode;
          let options: { value: string; label: string }[] = [];
          try {
            options = JSON.parse(attribs["data-options"] || "[]");
          } catch (e) {
            console.error("Invalid data-options JSON:", e);
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

          const isRepeat = attribs["data-repeat"] === "true";

          const [droppedValues, setDroppedValues] = useState<{
            [key: string]: string;
          }>({});
          const [usedOptions, setUsedOptions] = useState<Set<string>>(
            new Set()
          );

          const handleDragStart = (
            e: React.DragEvent<HTMLDivElement>,
            value: string
          ) => {
            e.dataTransfer.setData("text/plain", value);
            e.currentTarget.style.opacity = "0.5";
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
            <div className="my-6" style={{ userSelect: "none" }}>
              {domToReact(domNode.children, {
                replace: (innerNode) => {
                  if (
                    innerNode instanceof Element &&
                    innerNode.name === "drag-drop-sentence-input"
                  ) {
                    const innerAttribs = innerNode.attribs;
                    const number = innerAttribs["data-question-number"] ?? "";
                    const type = innerAttribs["data-question-type"] ?? "";

                    if (!number || type !== "matching_sentence_endings") {
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
                        style={{ userSelect: "none" }}
                      >
                        {droppedValues[number] ? (
                          <div
                            className="flex items-center justify-between"
                            style={{ userSelect: "none" }}
                          >
                            <span className="font-semibold">
                              {options.find(
                                (opt) => opt.value === droppedValues[number]
                              )?.label || droppedValues[number]}
                            </span>
                            <button
                              onClick={() => handleClear(number)}
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
              <div
                className="flex flex-wrap gap-3 mt-6"
                style={{ userSelect: "none" }}
              >
                {options.map(
                  (option) =>
                    (!usedOptions.has(option.value) || isRepeat) && (
                      <div
                        key={option.value}
                        draggable
                        onDragStart={(e) => handleDragStart(e, option.value)}
                        onDragEnd={handleDragEnd}
                        className="p-2 bg-primary text-primary-foreground rounded-lg cursor-move hover:bg-muted-foreground transition-colors min-w-[150px] text-center"
                        style={{ userSelect: "none" }}
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
        }
        .drag-drop-container {
          min-height: 40px;
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
