"use client";

import React, { useState } from "react";
import { DndContext, useDraggable, useDroppable } from "@dnd-kit/core";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface Option {
  id: string;
  text: string;
}

interface Question {
  id: string;
  text: string;
  slot: Option | null;
}

const Draggable = ({ id, text }: Option) => {
  const { attributes, listeners, setNodeRef, transform } = useDraggable({ id });

  const style = transform
    ? { transform: `translate(${transform.x}px, ${transform.y}px)` }
    : undefined;

  return (
    <Card
      ref={setNodeRef}
      style={style}
      {...listeners}
      {...attributes}
      className="p-2 cursor-grab select-none shadow"
    >
      {text}
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
        "min-h-[40px] min-w-[200px] border-b border-dashed px-2 py-1 flex items-center justify-center transition-colors",
        isOver ? "bg-primary/10" : "bg-transparent"
      )}
    >
      {children}
    </div>
  );
};

export default function MatchingQuestions() {
    
  const [options, setOptions] = useState<Option[]>([
    {
      id: "o1",
      text: "she started by seeking to understand how basic terms were used in the past.",
    },
    { id: "o2", text: "they worked as individuals rather than as a group." },
    { id: "o3", text: "she examined how their methods evolved and changed." },
    { id: "o4", text: "Clement Draper was the best scientist of his time." },
    {
      id: "o5",
      text: "they used old ways of analysing written information for new purposes.",
    },
  ]);

  const [questions, setQuestions] = useState<Question[]>([
    {
      id: "q1",
      text: "Harkness’s research method was different to that of other writers because",
      slot: null,
    },
    {
      id: "q2",
      text: "Harkness’s reconstruction of the 16th-century London scientific groups was new because",
      slot: null,
    },
    {
      id: "q3",
      text: "Harkness shows that the 16th-century London scientists were innovative because",
      slot: null,
    },
  ]);

  const handleDragEnd = (event: any) => {
    const { over, active } = event;
    if (over) {
      setQuestions((prevQuestions) =>
        prevQuestions.map((q) => {
          if (q.id === over.id) {
            const draggedItem =
              options.find((o) => o.id === active.id) ||
              prevQuestions.find((pq) => pq.slot?.id === active.id)?.slot ||
              null;

            if (!draggedItem) return q;

            let updatedOptions = [...options];

            // Agar drop zonada eski item bo'lsa, uni qaytaramiz
            if (q.slot) {
              updatedOptions = [...updatedOptions, q.slot];
            }

            // Agar variant pastdagi ro'yxatda bo'lsa, uni olib tashlaymiz
            updatedOptions = updatedOptions.filter(
              (o) => o.id !== draggedItem.id
            );
            setOptions(updatedOptions);

            return { ...q, slot: draggedItem };
          }
          return q;
        })
      );
    }
  };

  return (
    <DndContext onDragEnd={handleDragEnd}>
      <div className="space-y-6">
        {/* Savollar */}
        {questions.map((q) => (
          <div key={q.id} className="flex items-center gap-2 flex-wrap">
            <span>{q.text}</span>
            <Droppable id={q.id}>
              {q.slot ? (
                q.slot.text
              ) : (
                <span className="text-muted-foreground">Drop here</span>
              )}
            </Droppable>
          </div>
        ))}

        {/* Variantlar */}
        <div className="flex flex-col gap-2 border-t pt-4">
          {options.map((o) => (
            <Draggable key={o.id} {...o} />
          ))}
        </div>
      </div>
    </DndContext>
  );
}
