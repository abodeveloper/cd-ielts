"use client";

import React, { useState, useEffect } from "react";
import { DndContext, useDraggable, useDroppable } from "@dnd-kit/core";
import { UseFormReturn } from "react-hook-form";
import { ReadingFormValues } from "@/features/exams/schemas/reading-schema";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { RiCloseLine } from "@remixicon/react";

interface Option {
  label: string;
  value: string;
}

interface Question {
  question_number: string;
  question_text?: string;
  answer?: string;
}

interface ReadingDragDropTagsProps {
  options: Option[];
  questions: Question[];
  form: UseFormReturn<ReadingFormValues>;
  isReusable?: boolean; // false = bir marta ishlatiladi, true = cheksiz ishlatiladi
}

const Draggable = ({ label, value }: Option) => {
  const { attributes, listeners, setNodeRef, transform } = useDraggable({
    id: value,
  });
  const style = transform
    ? { transform: `translate(${transform.x}px, ${transform.y}px)` }
    : undefined;

  return (
    <Card
      ref={setNodeRef}
      style={style}
      {...listeners}
      {...attributes}
      className="p-2 cursor-grab select-none shadow inline-block w-fit"
    >
      {label}
    </Card>
  );
};

const Droppable = ({
  id,
  children,
}: {
  id: string;
  children?: React.ReactNode;
}) => {
  const { isOver, setNodeRef } = useDroppable({ id });
  return (
    <div
      ref={setNodeRef}
      className={cn(
        "min-h-[40px] min-w-[100px] w-fit border-b border-dashed px-2 py-1 flex items-center justify-center transition-colors",
        isOver ? "bg-primary/10" : "bg-transparent"
      )}
    >
      {children}
    </div>
  );
};

const ReadingDragDropTags: React.FC<ReadingDragDropTagsProps> = ({
  options,
  questions: initialQuestions,
  form,
  isReusable = false,
}) => {
  const [error, setError] = useState<string | null>(null);
  const [availableOptions, setAvailableOptions] = useState<Option[]>([]);
  const [questions, setQuestions] = useState<Question[]>([]);

  // Init state
  useEffect(() => {
    if (!options?.length) {
      setError("Invalid or empty options provided.");
      return;
    }
    if (!initialQuestions?.length) {
      setError("Invalid or empty questions provided.");
      return;
    }

    setAvailableOptions(options);
    setQuestions(
      initialQuestions.map((q) => ({
        ...q,
        answer:
          q.answer ||
          form.getValues(`answers.${parseInt(q.question_number) - 1}.answer`) ||
          undefined,
      }))
    );
    setError(null);
  }, [initialQuestions, options, form]);

  const handleDragEnd = (event: any) => {
    const { over, active } = event;
    if (!over) return;

    const draggedOption =
      availableOptions.find((opt) => opt.value === active.id) ||
      options.find((opt) => opt.value === active.id);
    if (!draggedOption) return;

    const qIndex = parseInt(over.id) - 1;
    const existingAnswer = questions.find(
      (q) => q.question_number === over.id
    )?.answer;

    // Eski javobni qaytarish (faqat isReusable=false bo‘lsa)
    if (existingAnswer && !isReusable) {
      const oldOption = options.find((o) => o.value === existingAnswer);
      if (
        oldOption &&
        !availableOptions.some((o) => o.value === oldOption.value)
      ) {
        setAvailableOptions((prev) => [...prev, oldOption]);
      }
    }

    // Yangi javob yozish
    form.setValue(`answers.${qIndex}.answer`, draggedOption.value);
    setQuestions((prev) =>
      prev.map((q) =>
        q.question_number === over.id
          ? { ...q, answer: draggedOption.value }
          : q
      )
    );

    // Draggable variantni olib tashlash (faqat isReusable=false bo‘lsa)
    if (!isReusable) {
      setAvailableOptions((prev) =>
        prev.filter((opt) => opt.value !== draggedOption.value)
      );
    }
  };

  const handleRemoveAnswer = (questionNumber: string) => {
    const qIndex = parseInt(questionNumber) - 1;
    const question = questions.find(
      (q) => q.question_number === questionNumber
    );
    if (!question?.answer) return;

    // Javobni formdan o‘chirish
    form.setValue(`answers.${qIndex}.answer`, "");

    // Javobni state’dan o‘chirish
    setQuestions((prev) =>
      prev.map((q) =>
        q.question_number === questionNumber ? { ...q, answer: undefined } : q
      )
    );

    // Agar isReusable=false bo‘lsa, variantni qaytarish
    if (!isReusable) {
      const optionToReturn = options.find(
        (opt) => opt.value === question.answer
      );
      if (
        optionToReturn &&
        !availableOptions.some((o) => o.value === optionToReturn.value)
      ) {
        setAvailableOptions((prev) => [...prev, optionToReturn]);
      }
    }
  };

  if (error) {
    return <div className="p-4 text-red-600">{error}</div>;
  }

  return (
    <DndContext onDragEnd={handleDragEnd}>
      <div className="space-y-6 mt-4 mb-6">
        {/* Draggable variantlar */}
        <div className="flex flex-wrap gap-2">
          {availableOptions.map((opt) => (
            <Draggable key={opt.value} label={opt.label} value={opt.value} />
          ))}
        </div>

        {/* Savollar va javob joylari */}
        <div className="space-y-4">
          {questions.map((q) => (
            <div
              key={q.question_number}
              className="flex flex-row items-center gap-2 flex-wrap"
            >
              <span className="font-bold">{q.question_number}</span>
              <span>{q.question_text || ""}</span>
              <Droppable id={q.question_number}>
                {q.answer ? (
                  <div className="flex items-center gap-2">
                    <span>
                      {options.find((opt) => opt.value === q.answer)?.label ||
                        "?"}
                    </span>
                    <button
                      onClick={() => handleRemoveAnswer(q.question_number)}
                      className="text-destructive hover:text-destructive/70"
                    >
                      <RiCloseLine size={15}/>
                    </button>
                  </div>
                ) : (
                  <span className="text-muted-foreground">Drop here</span>
                )}
              </Droppable>
            </div>
          ))}
        </div>
      </div>
    </DndContext>
  );
};

export default ReadingDragDropTags;
