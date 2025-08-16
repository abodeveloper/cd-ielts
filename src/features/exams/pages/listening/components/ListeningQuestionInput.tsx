// QuestionInput.tsx
import { RadioGroup } from "@/components/ui/radio-group";
import { ListeningFormValues } from "@/features/exams/schemas/listening-schema";
import MyQuestionInput from "@/shared/components/atoms/question-inputs/MyQuestionInput";
import MyQuestionRadio from "@/shared/components/atoms/question-inputs/MyQuestionRadio";
import MyQuestionSelect from "@/shared/components/atoms/question-inputs/MyQuestionSelect";
import { ListeningQuestionType } from "@/shared/enums/listening-question-type.enum";
import { isEmpty } from "lodash";
import React from "react";
import { UseFormReturn } from "react-hook-form";

interface Props {
  number: string;
  type: string;
  options:
    | {
        label: string;
        value: string;
      }[]
    | undefined;
  form: UseFormReturn<ListeningFormValues>;
}

const ListeningQuestionInput: React.FC<Props> = ({
  number,
  type,
  form,
  options,
}) => {
  const questionNumber: number = Number(number) - 1;

  if (
    type === ListeningQuestionType.SENTENCE_COMPLETION ||
    type === ListeningQuestionType.SHORT_ANSWER ||
    type === ListeningQuestionType.SUMMARY_COMPLETION ||
    type === ListeningQuestionType.DIAGRAM_LABEL
  ) {
    return (
      <MyQuestionInput<ListeningFormValues>
        floatingError
        id={number}
        control={form.control}
        name={`answers.${questionNumber}.answer`}
        type="text"
      />
    );
  }

  if (type === ListeningQuestionType.MULTIPLE_CHOICE) {
    return (
      <>
        <RadioGroup className="gap-4 my-5">
          {options?.map((option) => {
            return (
              <MyQuestionRadio<ListeningFormValues>
                control={form.control}
                name={`answers.${questionNumber}.answer`}
                value={option.value}
                id={number}
                label={`${option.value}) ${option.label}`}
              />
            );
          })}
        </RadioGroup>
      </>
    );
  }

  if (type === ListeningQuestionType.MATCHING_HEADINGS) {
    return (
      <>
        <MyQuestionSelect<ListeningFormValues>
          control={form.control}
          name={`answers.${questionNumber}.answer`}
          id={number}
          className="mx-2 my-2"
          options={
            !isEmpty(options)
              ? options?.map((item) => ({
                  label: item.value,
                  value: item.value,
                }))
              : []
          }
        />
      </>
    );
  }

  return null;
};

export default ListeningQuestionInput;
