"use client";

import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { DndContext, useDraggable, useDroppable } from "@dnd-kit/core";
import { RiCloseLine } from "@remixicon/react";
import React, { useEffect, useMemo, useState } from "react";
import { UseFormReturn } from "react-hook-form";

interface Option {
  label: string;
  value: string;
}

interface Question {
  question_number: string;
  question_text?: string;
  answer?: string;
}

interface DragDropTagsProps {
  options: Option[];
  questions: Question[];
  form: UseFormReturn;
  isRepeatAnswer?: boolean; // false = bir martalik, true = qayta ishlatiladigan javoblar
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

const DragDropTags: React.FC<DragDropTagsProps> = ({
  options,
  questions: initialQuestions,
  form,
  isRepeatAnswer = false,
}) => {
  const [error, setError] = useState<string | null>(null);
  const [availableOptions, setAvailableOptions] = useState<Option[]>([]);
  const [questions, setQuestions] = useState<Question[]>([]);

  // options va initialQuestions ni stabillashtirish
  const stableOptions = useMemo(() => options, [options]);
  const stableQuestions = useMemo(() => initialQuestions, [initialQuestions]);

  // Boshlang‘ich holatni faqat bir marta o‘rnatish
  useEffect(() => {
    if (!stableOptions?.length) {
      setError("Noto‘g‘ri yoki bo‘sh variantlar kiritilgan.");
      return;
    }
    if (!stableQuestions?.length) {
      setError("Noto‘g‘ri yoki bo‘sh savollar kiritilgan.");
      return;
    }

    setAvailableOptions(stableOptions);
    setQuestions(
      stableQuestions.map((q) => ({
        ...q,
        answer:
          q.answer ||
          form.getValues(`answers.${parseInt(q.question_number) - 1}.answer`) ||
          undefined,
      }))
    );
    setError(null);
  }, []); // Bo‘sh bog‘liqliklar, faqat bir marta ishga tushadi

  const handleDragEnd = (event: any) => {
    const { over, active } = event;
    if (!over) return;

    const draggedOption = stableOptions.find(
      (opt) => String(opt.value) === String(active.id)
    );
    if (!draggedOption) {
      return;
    }

    const qIndex = parseInt(over.id) - 1;
    const existingAnswer = questions.find(
      (q) => q.question_number === over.id
    )?.answer;

    // Agar oldingi javob bo‘lsa va isRepeatAnswer false bo‘lsa, uni qaytarish
    if (existingAnswer && !isRepeatAnswer) {
      const oldOption = stableOptions.find(
        (o) => String(o.value) === String(existingAnswer)
      );
      if (
        oldOption &&
        !availableOptions.some(
          (o) => String(o.value) === String(oldOption.value)
        )
      ) {
        setAvailableOptions((prev) => [...prev, oldOption]);
      }
    }

    // Yangi javobni o‘rnatish
    form.setValue(`answers.${qIndex}.answer`, draggedOption.value);
    setQuestions((prev) =>
      prev.map((q) =>
        q.question_number === over.id
          ? { ...q, answer: draggedOption.value }
          : q
      )
    );

    // Agar isRepeatAnswer false bo‘lsa, ishlatilgan variantni olib tashlash
    if (!isRepeatAnswer) {
      setAvailableOptions((prev) => {
        const newOptions = prev.filter(
          (opt) => String(opt.value) !== String(draggedOption.value)
        );
        return newOptions;
      });
    }
  };

  const handleRemoveAnswer = (questionNumber: string) => {
    const qIndex = parseInt(questionNumber) - 1;
    const question = questions.find(
      (q) => q.question_number === questionNumber
    );
    if (!question?.answer) return;

    form.setValue(`answers.${qIndex}.answer`, "");

    setQuestions((prev) =>
      prev.map((q) =>
        q.question_number === questionNumber ? { ...q, answer: undefined } : q
      )
    );

    if (!isRepeatAnswer) {
      const optionToReturn = stableOptions.find(
        (opt) => String(opt.value) === String(question.answer)
      );
      if (
        optionToReturn &&
        !availableOptions.some(
          (o) => String(o.value) === String(optionToReturn.value)
        )
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
        {/* Mavjud variantlar */}
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
                      {stableOptions.find(
                        (opt) => String(opt.value) === String(q.answer)
                      )?.label || "?"}
                    </span>
                    <button
                      onClick={() => handleRemoveAnswer(q.question_number)}
                      className="text-destructive hover:text-destructive/70"
                    >
                      <RiCloseLine size={15} />
                    </button>
                  </div>
                ) : (
                  <span className="text-muted-foreground">
                    {q.question_number}
                  </span>
                )}
              </Droppable>
            </div>
          ))}
        </div>
      </div>
    </DndContext>
  );
};

export default DragDropTags;
