"use client";

import React, { useState, useEffect, useMemo, useCallback } from "react";
import { UseFormReturn } from "react-hook-form";
import { ListeningFormValues } from "@/features/exams/schemas/listening-schema";
import parse, { Element } from "html-react-parser";
import { RiCloseLine } from "@remixicon/react";

interface Option {
  value: string;
  label: string;
}

interface ListeningDragDropSentenceMatchingProps {
  htmlContent: string;
  form: UseFormReturn<ListeningFormValues>;
  options: Option[];
  isRepeat: boolean;
}

const ListeningDragDropSentenceMatching: React.FC<
  ListeningDragDropSentenceMatchingProps
> = ({ htmlContent, form, options, isRepeat }) => {
  const [droppedValues, setDroppedValues] = useState<{
    [key: string]: string;
  }>({});
  const [usedOptions, setUsedOptions] = useState<Set<string>>(new Set());

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
  }, [htmlContent, form, isRepeat]);

  const handleDragStart = useCallback(
    (e: React.DragEvent<HTMLDivElement>, value: string) => {
      e.dataTransfer.setData("text/plain", value);
      e.currentTarget.style.opacity = "0.5";
    },
    []
  );

  const handleDragEnd = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.currentTarget.style.opacity = "1";
  }, []);

  const handleDrop = useCallback(
    (
      e: React.DragEvent<HTMLDivElement>,
      questionNumber: string
    ) => {
      e.preventDefault();
      const value = e.dataTransfer.getData("text/plain");
      if (value) {
        setDroppedValues((prev) => {
          const oldValue = prev[questionNumber];
          
          // Update used options outside of setDroppedValues
          if (oldValue && !isRepeat) {
            setUsedOptions((prevOpts) => {
              const newSet = new Set(prevOpts);
              newSet.delete(oldValue);
              return newSet;
            });
          }

          const newValues = { ...prev, [questionNumber]: value };
          
          if (!isRepeat) {
            setUsedOptions((prevOpts) => new Set([...prevOpts, value]));
          }

          const answerIndex = parseInt(questionNumber) - 1;
          form.setValue(`answers.${answerIndex}.answer`, value);

          return newValues;
        });

        e.currentTarget.style.backgroundColor = "";
      }
    },
    [isRepeat, form]
  );

  const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.currentTarget.style.backgroundColor = "#e0f7fa";
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.currentTarget.style.backgroundColor = "";
  }, []);

  const handleClear = useCallback(
    (questionNumber: string) => {
      setDroppedValues((prev) => {
        const value = prev[questionNumber];
        const newValues = { ...prev };
        delete newValues[questionNumber];

        if (!isRepeat && value) {
          setUsedOptions((prevOpts) => {
            const newSet = new Set(prevOpts);
            newSet.delete(value);
            return newSet;
          });
        }

        const answerIndex = parseInt(questionNumber) - 1;
        form.setValue(`answers.${answerIndex}.answer`, "");

        return newValues;
      });
    },
    [isRepeat, form]
  );

  const processedHtml = useMemo(() => {
    return parse(htmlContent, {
      replace: (domNode) => {
        if (domNode instanceof Element) {
          if (domNode.name === "drag-drop-sentence-input") {
            const innerAttribs = domNode.attribs;
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
                      className="text-destructive hover:text-destructive/70 ml-2"
                    >
                      <RiCloseLine size={20} />
                    </button>
                  </div>
                ) : (
                  <span className="text-muted-foreground">{number}</span>
                )}
              </span>
            );
          }
        }
        return undefined;
      },
    });
  }, [htmlContent, droppedValues, options, handleDrop, handleDragOver, handleDragLeave, handleClear]);

  return (
    <div className="my-6">
      {processedHtml}
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
};

export default ListeningDragDropSentenceMatching;

