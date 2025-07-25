import { Button } from "@/components/ui/button";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { usePreventPageLeave } from "@/features/exams/hooks/usePreventPageLeave";
import { useReadingForm } from "@/features/exams/hooks/useReadingForm";
import { ReadingFormValues } from "@/features/exams/schemas/reading-schema";
import { Question } from "@/features/exams/types/reading";
import { MyInput, MySelect } from "@/shared/components/atoms/form-elements";
import { ReadingQuestionType } from "@/shared/enums/reading-question-type.enum";
import { useState } from "react";
import { FormProvider } from "react-hook-form";
import { useParams } from "react-router-dom";

const TestPage = () => {
  const { id } = useParams();

  const { form, onSubmit, query, answersFields } = useReadingForm(id);
  const [isTestFinished, setIsTestFinished] = useState(false);

  usePreventPageLeave(!isTestFinished);

  if (query.isLoading) return <div>Loading...</div>;
  if (query.isError) return <div>Error loading test.</div>;
  if (!query.data || !Array.isArray(query.data))
    return <div>No data available.</div>;

  return (
    <FormProvider {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <div className="space-y-6 p-4">
          <Tabs defaultValue={`tab-${query.data[0].id}`} className="w-full">
            <TabsList className="grid w-full grid-cols-3 gap-2 mb-4">
              {query.data.map((part) => (
                <TabsTrigger key={part.id} value={`tab-${part.id}`}>
                  Section {part.reading_section}
                </TabsTrigger>
              ))}
            </TabsList>
            {query.data.map((part) => (
              <TabsContent key={part.id} value={`tab-${part.id}`}>
                <ResizablePanelGroup
                  direction="horizontal"
                  className="min-h-[200px] rounded-lg border w-full"
                >
                  <ResizablePanel defaultSize={50}>
                    <div className="flex h-full justify-center p-6 text-sm">
                      <div dangerouslySetInnerHTML={{ __html: part.content }} />
                    </div>
                  </ResizablePanel>
                  <ResizableHandle withHandle />
                  <ResizablePanel defaultSize={50}>
                    <div className="h-full p-6 space-y-8 text-sm">
                      {part.questions.map((question: Question) => {
                        // Mos keladigan answer indexini topish
                        const answerField = answersFields.find(
                          (f) => f.reading_question === question.id
                        );
                        const answerIndex = answersFields.indexOf(
                          answerField || answersFields[0]
                        );

                        // Har bir question_type ga mos javob usuli
                        const renderAnswerField = () => {
                          switch (question.question_type) {
                            case ReadingQuestionType.TRUE_FALSE_NOT_GIVEN:
                              return (
                                <MySelect<ReadingFormValues>
                                  floatingError
                                  label={`Answer for Question ${question.id}`}
                                  placeholder={`Select for Q${question.id}`}
                                  control={form.control}
                                  name={`answers[${answerIndex}].answer`}
                                  options={[
                                    { label: "True", value: "true" },
                                    { label: "False", value: "false" },
                                    { label: "Not Given", value: "not_given" },
                                  ]}
                                />
                              );
                            case ReadingQuestionType.YES_NO_NOT_GIVEN:
                              return (
                                <MySelect<ReadingFormValues>
                                  floatingError
                                  label={`Answer for Question ${question.id}`}
                                  placeholder={`Select for Q${question.id}`}
                                  control={form.control}
                                  name={`answers[${answerIndex}].answer`}
                                  options={[
                                    { label: "Yes", value: "yes" },
                                    { label: "No", value: "no" },
                                    { label: "Not Given", value: "not_given" },
                                  ]}
                                />
                              );
                            case ReadingQuestionType.SENTENCE_COMPLETION:
                            case ReadingQuestionType.SHORT_ANSWER:
                              return (
                                <MyInput<ReadingFormValues>
                                  floatingError
                                  label={`Answer for Question ${question.id}`}
                                  placeholder={`Enter answer for Q${question.id}`}
                                  control={form.control}
                                  name={`answers[${answerIndex}].answer`}
                                  type="text"
                                  className="w-"
                                />
                              );
                            case ReadingQuestionType.MULTIPLE_CHOICE:
                              return (
                                <MySelect<ReadingFormValues>
                                  floatingError
                                  label={`Answer for Question ${question.id}`}
                                  placeholder={`Select for Q${question.id}`}
                                  control={form.control}
                                  name={`answers[${answerIndex}].answer`}
                                  options={[
                                    { label: "Option A", value: "a" },
                                    { label: "Option B", value: "b" },
                                    { label: "Option C", value: "c" },
                                  ]}
                                />
                              );
                            // Boshqa turlarni qo'shish mumkin
                            default:
                              return (
                                <MyInput<ReadingFormValues>
                                  floatingError
                                  className="w-32"
                                  // label={`Answer for Question ${question.id}`}
                                  placeholder={`Enter answer for Q${question.id}`}
                                  control={form.control}
                                  name={`answers[${answerIndex}].answer`}
                                  type="text"
                                />
                              );
                          }
                        };

                        return (
                          <div key={question.id} className="space-y-2">
                            <h3 className="text-lg font-semibold">
                              Question {question.id}: {question.question_type}
                            </h3>
                            <div
                              className="prose"
                              dangerouslySetInnerHTML={{
                                __html: question.question,
                              }}
                            />
                            {renderAnswerField()}
                          </div>
                        );
                      })}
                    </div>
                  </ResizablePanel>
                </ResizablePanelGroup>
              </TabsContent>
            ))}
          </Tabs>

          <Button type="submit" className="w-full md:w-auto">
            Testni tugatish
          </Button>
        </div>
      </form>
    </FormProvider>
  );
};

export default TestPage;
