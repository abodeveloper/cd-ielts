import { Tabs } from "@/components/ui/tabs";
import ContentPanel from "@/features/exams/components/ContentPanel";
import PartInfo from "@/features/exams/components/PartInfo";
import TestHeader from "@/features/exams/components/TestHeader";
import TestNavigation from "@/features/exams/components/TestNavigation";
import { usePreventPageLeave } from "@/features/exams/hooks/usePreventPageLeave";
import { useReadingForm } from "@/features/exams/hooks/useReadingForm";
import useTestLogic from "@/features/exams/hooks/useTestLogic";
import { ReadingPart } from "@/features/exams/types";
import ErrorMessage from "@/shared/components/atoms/error-message/ErrorMessage";
import LoadingSpinner from "@/shared/components/atoms/loading-spinner/LoadingSpinner";
import { TestType } from "@/shared/enums/test-type.enum";
import { get } from "lodash";
import { FormProvider } from "react-hook-form";
import { useParams } from "react-router-dom";

interface StepProps {
  onNext?: (data: any) => void;
}

const ReadingTestStep = ({ onNext }: StepProps) => {
  const { id } = useParams();
  const { form, onSubmit, query, readingMutation } = useReadingForm(id, onNext);

  const parts: ReadingPart[] = get(query, "data.reading_parts", []);
  const answer_time = get(query, "data.answer_time", null);

  const {
    timeLeft,
    formatTime,
    activeTab,
    setActiveTab,
    currentTabIndex,
    handlePrevious,
    handleNext,
    isTestFinished,
  } = useTestLogic<ReadingPart>(
    answer_time,
    parts,
    form.handleSubmit(onSubmit)
  );

  // Prevent page leave when test is not finished
  usePreventPageLeave(!isTestFinished);

  const activePart = parts.find((part) => `tab-${part.id}` === activeTab);

  if (query.isLoading) return <LoadingSpinner message="Loading test data..." />;
  if (query.isError)
    return (
      <ErrorMessage
        title="Failed to Load Test"
        message="An error occurred while loading the test. Please try again later."
      />
    );

  if (query.data?.reading_parts.length === 0)
    return (
      <ErrorMessage
        title="Failed to load test"
        message="An error occurred while loading the test questions. Please try again later."
      />
    );

  return (
    <FormProvider {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="min-h-screen">
        <div className="sticky top-0 z-50 bg-primary-foreground space-y-1">
          <TestHeader
            timeLeft={timeLeft}
            formatTime={formatTime}
            testType={TestType.READING}
            type={get(query, "data.material.test_type", "Mock")}
          />
          <PartInfo activePart={activePart} testType={TestType.READING} />
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <ContentPanel
            data={parts}
            activeTab={activeTab}
            testType={TestType.READING}
            form={form}
          />
          <TestNavigation
            data={parts}
            form={form}
            testType={TestType.READING}
            activeTab={activeTab}
            setActiveTab={setActiveTab}
            currentTabIndex={currentTabIndex}
            handlePrevious={handlePrevious}
            handleNext={handleNext}
            onSubmit={form.handleSubmit(onSubmit)}
            isTestFinished={isTestFinished}
            isLoading={readingMutation.isPending}
          />
        </Tabs>
      </form>
    </FormProvider>
  );
};

export default ReadingTestStep;
