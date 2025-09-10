// QuestionInput.tsx
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { RadioGroup } from "@/components/ui/radio-group";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "@/components/ui/table";
import { ReadingFormValues } from "@/features/exams/schemas/reading-schema";
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
  questions: {
    question_text;
    string;
    question_number: number;
  }[]; // Add questions array to props
}

const ReadingQuestionInput: React.FC<Props> = ({
  number,
  type,
  form,
  options,
  questions,
}) => {
  const questionNumber: number = Number(number) - 1;

  if (
    type === ReadingQuestionType.SENTENCE_COMPLETION ||
    type === ReadingQuestionType.SHORT_ANSWER ||
    type === ReadingQuestionType.SUMMARY_COMPLETION ||
    type === ReadingQuestionType.DIAGRAM_LABEL
  ) {
    return (
      <MyQuestionInput<ReadingFormValues>
        // floatingError
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
          value="TRUE"
          id={number}
          label={"TRUE"}
        />
        <MyQuestionRadio<ReadingFormValues>
          control={form.control}
          name={`answers.${questionNumber}.answer`}
          value="FALSE"
          id={number}
          label={"FALSE"}
        />
        <MyQuestionRadio<ReadingFormValues>
          control={form.control}
          name={`answers.${questionNumber}.answer`}
          value="NOT GIVEN"
          id={number}
          label={"NOT GIVEN"}
        />
      </RadioGroup>
    );
  }

  if (type === ReadingQuestionType.YES_NO_NOT_GIVEN) {
    return (
      <RadioGroup className="gap-4 my-5">
        <MyQuestionRadio<ReadingFormValues>
          control={form.control}
          name={`answers.${questionNumber}.answer`}
          value="YES"
          id={number}
          label={"YES"}
        />
        <MyQuestionRadio<ReadingFormValues>
          control={form.control}
          name={`answers.${questionNumber}.answer`}
          value="NO"
          id={number}
          label={"NO"}
        />
        <MyQuestionRadio<ReadingFormValues>
          control={form.control}
          name={`answers.${questionNumber}.answer`}
          value="NOT GIVEN"
          id={number}
          label={"NOT GIVEN"}
        />
      </RadioGroup>
    );
  }

  if (type === ReadingQuestionType.MULTIPLE_CHOICE) {
    return (
      <RadioGroup className="gap-4 my-5">
        {options?.map((option) => (
          <MyQuestionRadio<ReadingFormValues>
            control={form.control}
            name={`answers.${questionNumber}.answer`}
            value={option.value}
            id={number}
            label={`${option.value}) ${option.label}`}
          />
        ))}
      </RadioGroup>
    );
  }

  if (type === ReadingQuestionType.MATCHING_INFORMATION) {
    return (
      <div className="space-y-8">
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
                      name={`answers.${index}.answer`}
                      render={({ field }) => (
                        <FormItem className="flex items-center space-x-2">
                          <FormControl>
                            <input
                              type="radio"
                              // checked={field.value === option.value}
                              onChange={() => field.onChange(option.value)}
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
                          <FormLabel
                            htmlFor={`${number}-${index}-${option.value}`}
                          ></FormLabel>
                          <FormMessage />
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
              <TableHead colSpan={2}>First invented or used by</TableHead>
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

  if (type === ReadingQuestionType.MATCHING_HEADINGS) {
    return (
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
    );
  }

  return null;
};

export default ReadingQuestionInput;
