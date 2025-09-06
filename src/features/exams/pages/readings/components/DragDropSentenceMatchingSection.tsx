import React, { useState, useEffect, useMemo, useCallback } from "react";
import { useDrag, useDrop, DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import { UseFormReturn } from "react-hook-form";
import parse, { Element } from "html-react-parser";
import { ReadingFormValues } from "@/features/exams/schemas/reading-schema";

// Tip definition for an option
interface Option {
  value: string;
  label: string;
}

// Tip definition for a draggable item
interface DragItem {
  id: string; // This will be the option.value
  type: string;
}

// Item type for React-DnD
const ItemTypes = {
  OPTION: "option",
};

interface DraggableOptionProps {
  option: Option;
  isDropped: boolean; // Indicates if this option is currently in a droppable
}

// Draggable Option Component
const DraggableOption: React.FC<DraggableOptionProps> = React.memo(
  ({ option, isDropped }) => {
    const [{ isDragging }, drag] = useDrag(() => ({
      type: ItemTypes.OPTION,
      item: { id: option.value, type: ItemTypes.OPTION },
      collect: (monitor) => ({
        isDragging: monitor.isDragging(),
      }),
    }));

    // If the option is already dropped somewhere, don't render it in the options list
    if (isDropped) {
      return null;
    }

    return (
      <div
        ref={drag}
        className={`p-2 border rounded cursor-grab bg-gray-100 min-w-[120px] text-center transition-opacity duration-200 ${
          isDragging ? "opacity-50" : ""
        }`}
        style={{ opacity: isDragging ? 0.5 : 1 }}
      >
        <strong>{option.value}</strong> {option.label}
      </div>
    );
  }
);

interface DroppableSentenceInputProps {
  questionNumber: string;
  currentAnswer: string;
  onDrop: (item: DragItem, questionNumber: string) => void;
  onRemoveAnswer: (questionNumber: string) => void;
}

// Droppable Sentence Input Component
const DroppableSentenceInput: React.FC<DroppableSentenceInputProps> =
  React.memo(({ questionNumber, currentAnswer, onDrop, onRemoveAnswer }) => {
    const [{ isOver }, drop] = useDrop(() => ({
      accept: ItemTypes.OPTION,
      drop: (item: DragItem) => onDrop(item, questionNumber),
      collect: (monitor) => ({
        isOver: monitor.isOver(),
      }),
    }));

    const borderColor = isOver ? "border-green-500" : "border-gray-300";

    return (
      <span
        ref={drop}
        className={`inline-block min-w-[150px] h-8 border-b-2 text-center align-middle relative transition-colors duration-200 ${borderColor}`}
        style={{ verticalAlign: "bottom", margin: "0 4px" }} // To align with surrounding text
      >
        {currentAnswer}
        {currentAnswer && (
          <button
            type="button"
            onClick={() => onRemoveAnswer(questionNumber)}
            className="absolute -right-2 top-1/2 -translate-y-1/2 text-red-500 text-xs px-1 rounded-full bg-white hover:bg-red-100 transition-colors"
            aria-label={`Remove answer for question ${questionNumber}`}
          >
            x
          </button>
        )}
      </span>
    );
  });

interface DragDropSentenceMatchingSectionProps {
  initialHtmlContent: string; // The full HTML content passed from ReadingQuestionRenderer
  form: UseFormReturn<ReadingFormValues>; // React Hook Form instance
}

const DragDropSentenceMatchingSection: React.FC<
  DragDropSentenceMatchingSectionProps
> = ({ initialHtmlContent, form }) => {
  // State to manage which option is dropped into which question input
  const [droppedAnswers, setDroppedAnswers] = useState<{
    [key: string]: string;
  }>({});
  // State to track if an option is currently dropped somewhere
  const [isOptionDropped, setIsOptionDropped] = useState<{
    [key: string]: boolean;
  }>({});

  // Extracted options and question numbers from the initialHtmlContent
  const { options, questionNumbers, processedHtmlForContent } = useMemo(() => {
    let extractedOptions: Option[] = [];
    const extractedQuestionNumbers: string[] = [];
    let contentWithoutOptionsTag = initialHtmlContent; // HTML without the drag-drop-matching-sentence-endings tag

    parse(initialHtmlContent, {
      replace: (domNode) => {
        if (domNode instanceof Element) {
          if (domNode.name === "drag-drop-matching-sentence-endings") {
            const { attribs } = domNode;
            extractedOptions = JSON.parse(attribs["data-options"] || "[]");
            // Remove this tag from the contentHtml for rendering
            // This is a bit tricky with html-react-parser. A simpler way is to regex it out before parsing.
            contentWithoutOptionsTag = contentWithoutOptionsTag.replace(
              domNode.outerHTML,
              ""
            );
            return null; // Don't render this tag
          }
          if (domNode.name === "drag-drop-sentence-input") {
            const { attribs } = domNode;
            if (attribs["data-question-number"]) {
              extractedQuestionNumbers.push(attribs["data-question-number"]);
            }
          }
        }
        return domNode;
      },
    });

    return {
      options: extractedOptions,
      questionNumbers: extractedQuestionNumbers,
      processedHtmlForContent: contentWithoutOptionsTag,
    };
  }, [initialHtmlContent]);

  // Initialize states from form values on component mount or prop change
  useEffect(() => {
    const initialAnswers: { [key: string]: string } = {};
    const initialDroppedState: { [key: string]: boolean } = {};

    questionNumbers.forEach((num) => {
      const answerIndex = parseInt(num) - 1;
      const currentAnswer =
        form.getValues(`answers.${answerIndex}.answer`) || "";
      initialAnswers[num] = currentAnswer;
      if (currentAnswer) {
        initialDroppedState[currentAnswer] = true;
      }
    });

    options.forEach((opt) => {
      if (!initialDroppedState[opt.value]) {
        initialDroppedState[opt.value] = false;
      }
    });

    setDroppedAnswers(initialAnswers);
    setIsOptionDropped(initialDroppedState);
  }, [form, questionNumbers, options]);

  // Handler for when an item is dropped onto a droppable input
  const handleDrop = useCallback(
    (item: DragItem, targetQuestionNumber: string) => {
      // Find if the item was already dropped into another question input
      const oldQuestionNumberHoldingItem = Object.keys(droppedAnswers).find(
        (key) => droppedAnswers[key] === item.id && key !== targetQuestionNumber
      );

      // Find if the target input already has an answer (that needs to be returned to options)
      const itemCurrentlyInTarget = droppedAnswers[targetQuestionNumber];

      setDroppedAnswers((prev) => {
        const newAnswers = { ...prev };
        const newIsOptionDropped = { ...isOptionDropped };

        // If the item was previously in another input, clear that input
        if (oldQuestionNumberHoldingItem) {
          newAnswers[oldQuestionNumberHoldingItem] = "";
          const oldIndex = parseInt(oldQuestionNumberHoldingItem) - 1;
          form.setValue(`answers.${oldIndex}.answer`, "");
        }

        // If the target input already had an answer, that answer is now "undropped"
        if (itemCurrentlyInTarget) {
          newIsOptionDropped[itemCurrentlyInTarget] = false;
        }

        // Set the new answer for the target input
        newAnswers[targetQuestionNumber] = item.id;
        newIsOptionDropped[item.id] = true; // The item is now dropped in the new spot

        setIsOptionDropped(newIsOptionDropped); // Update option dropped state
        return newAnswers;
      });

      // Update form state for the target input
      const targetIndex = parseInt(targetQuestionNumber) - 1;
      form.setValue(`answers.${targetIndex}.answer`, item.id);
    },
    [droppedAnswers, isOptionDropped, form]
  );

  // Handler for when an answer is explicitly removed from a droppable input
  const handleRemoveAnswer = useCallback(
    (questionNumber: string) => {
      const removedOptionValue = droppedAnswers[questionNumber];
      if (removedOptionValue) {
        setDroppedAnswers((prev) => ({ ...prev, [questionNumber]: "" }));
        setIsOptionDropped((prev) => ({
          ...prev,
          [removedOptionValue]: false,
        }));

        const questionIndex = parseInt(questionNumber) - 1;
        form.setValue(`answers.${questionIndex}.answer`, "");
      }
    },
    [droppedAnswers, form]
  );

  // Memoize the parsed content to avoid re-parsing on every render
  const parsedContent = useMemo(() => {
    return parse(processedHtmlForContent, {
      replace: (domNode) => {
        if (domNode instanceof Element) {
          // Replace 'drag-drop-sentence-input' with our Droppable component
          if (domNode.name === "drag-drop-sentence-input") {
            const { attribs } = domNode;
            const number = attribs["data-question-number"] ?? "";
            const currentAnswer = droppedAnswers[number] || "";

            return (
              <DroppableSentenceInput
                key={number}
                questionNumber={number}
                currentAnswer={currentAnswer}
                onDrop={handleDrop}
                onRemoveAnswer={handleRemoveAnswer}
              />
            );
          }
          // The drag-drop-matching-sentence-endings tag is already handled by `useMemo`
        }
        return domNode;
      },
    });
  }, [processedHtmlForContent, droppedAnswers, handleDrop, handleRemoveAnswer]);

  return (
    <DndProvider backend={HTML5Backend}>
      {" "}
      {/* DndProvider here to scope DnD context */}
      <div className="leading-relaxed text-gray-800">
        {parsedContent}

        {/* Options are rendered *after* the main content, in the position where the drag-drop-matching-sentence-endings tag was */}
        <div className="flex flex-wrap gap-2 p-3 border rounded bg-blue-50/10 my-4 shadow-sm">
          <p className="w-full text-base font-semibold text-gray-700 mb-2">
            Select an option:
          </p>
          {options.map((option) => (
            <DraggableOption
              key={option.value}
              option={option}
              isDropped={isOptionDropped[option.value] || false}
            />
          ))}
        </div>
      </div>
    </DndProvider>
  );
};

export default DragDropSentenceMatchingSection;
