// QuestionInput.tsx
import { RadioGroup } from "@/components/ui/radio-group";
import { ReadingFormValues } from "@/features/exams/schemas/reading-schema";
import MyQuestionCheckbox from "@/shared/components/atoms/question-inputs/MyQuestionCheckbox";
import MyQuestionCheckboxGroup from "@/shared/components/atoms/question-inputs/MyQuestionCheckboxGroup";
import MyQuestionInput from "@/shared/components/atoms/question-inputs/MyQuestionInput";
import MyQuestionRadio from "@/shared/components/atoms/question-inputs/MyQuestionRadio";
import MyQuestionSelect from "@/shared/components/atoms/question-inputs/MyQuestionSelect";
import { ReadingQuestionType } from "@/shared/enums/reading-question-type.enum";
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
  form: UseFormReturn<ReadingFormValues>;
}

const ReadingQuestionInput: React.FC<Props> = ({
  number,
  type,
  form,
  options,
}) => {
  const questionNumber: number = Number(number) - 1;

  if (
    type === ReadingQuestionType.SENTENCE_COMPLETION ||
    type === ReadingQuestionType.SHORT_ANSWER ||
    type === ReadingQuestionType.SUMMARY_COMPLETION ||
    type === ReadingQuestionType.DIAGRAM_LABEL_COMPLETION
  ) {
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
          label={"TRUE"}
        />
        <MyQuestionRadio<ReadingFormValues>
          control={form.control}
          name={`answers.${questionNumber}.answer`}
          value="false"
          id={number}
          label={"FALSE"}
        />
        <MyQuestionRadio<ReadingFormValues>
          control={form.control}
          name={`answers.${questionNumber}.answer`}
          value="not_given"
          id={number}
          label={"NOT GIVEN"}
        />
      </RadioGroup>
    );
  }

  if (type === ReadingQuestionType.YES_NO_NOT_GIVEN) {
    return (
      <>
        <RadioGroup className="gap-4 my-5">
          <MyQuestionRadio<ReadingFormValues>
            control={form.control}
            name={`answers.${questionNumber}.answer`}
            value="yesy"
            id={number}
            label={"YES"}
          />
          <MyQuestionRadio<ReadingFormValues>
            control={form.control}
            name={`answers.${questionNumber}.answer`}
            value="no"
            id={number}
            label={"NO"}
          />
          <MyQuestionRadio<ReadingFormValues>
            control={form.control}
            name={`answers.${questionNumber}.answer`}
            value="not_given"
            id={number}
            label={"NOT GIVEN"}
          />
        </RadioGroup>
        {/* <MyQuestionCheckbox<ReadingFormValues>
          control={form.control}
          name={`answers.${questionNumber}.answer`}
          value="no"
          id={number}
          label={"NO"}
        />
        <MyQuestionCheckboxGroup
          control={form.control}
          name="selectedOptions"
          label="Tanlovlaringizni belgilang"
          options={[
            {
              value: "option1",
              label: "Variant 1",
            },
            {
              value: "option2",
              label: "Variant 2",
            },
            { value: "option3", label: "Variant 3" },
          ]}
          maxSelections={2}
          orientation="vertical" // yoki "horizontal"
          className="w-full"
        /> */}
      </>
    );
  }

  if (type === ReadingQuestionType.MULTIPLE_CHOICE) {
    return (
      <>
        <RadioGroup className="gap-4 my-5">
          {options?.map((option) => {
            return (
              <MyQuestionRadio<ReadingFormValues>
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

  if (
    type === ReadingQuestionType.MATCHING_INFORMATION ||
    type === ReadingQuestionType.MATCHING_FEATURES
  ) {
    return (
      <>
        <MyQuestionSelect<ReadingFormValues>
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

  if (type === ReadingQuestionType.MATCHING_HEADINGS) {
    return <></>;
  }

  return null;
};

export default ReadingQuestionInput;
