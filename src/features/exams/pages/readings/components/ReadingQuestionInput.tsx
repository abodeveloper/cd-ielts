// QuestionInput.tsx
import { RadioGroup } from "@/components/ui/radio-group";
import { ReadingFormValues } from "@/features/exams/schemas/reading-schema";
import MyQuestionInput from "@/shared/components/atoms/question-inputs/MyQuestionInput";
import MyQuestionRadio from "@/shared/components/atoms/question-inputs/MyQuestionRadio";
import { ReadingQuestionType } from "@/shared/enums/reading-question-type.enum";
import React from "react";
import { UseFormReturn } from "react-hook-form";

interface Props {
  number: string;
  type: string;
  form: UseFormReturn<ReadingFormValues>;
}

const ReadingQuestionInput: React.FC<Props> = ({ number, type, form }) => {
  const questionNumber: number = Number(number) - 1;

  if (type === ReadingQuestionType.SENTENCE_COMPLETION) {
    return (
      <MyQuestionInput<ReadingFormValues>
        floatingError
        placeholder={`${number}`}
        id={number}
        control={form.control}
        name={`answers.${questionNumber}.answer`}
        type="text"
      />
    );
  }

  if (type === ReadingQuestionType.TRUE_FALSE_NOT_GIVEN) {
    return (
      <RadioGroup className="gap-4 my-5">
        <MyQuestionRadio<ReadingFormValues>
          control={form.control}
          name={`answers.${questionNumber}.answer`}
          value="true"
          id={number}
          label={"True"}
        />
        <MyQuestionRadio<ReadingFormValues>
          control={form.control}
          name={`answers.${questionNumber}.answer`}
          value="false"
          id={number}
          label={"False"}
        />
        <MyQuestionRadio<ReadingFormValues>
          control={form.control}
          name={`answers.${questionNumber}.answer`}
          value="not_given"
          id={number}
          label={"Not given"}
        />
      </RadioGroup>
    );
  }

  return null;
};

export default ReadingQuestionInput;
