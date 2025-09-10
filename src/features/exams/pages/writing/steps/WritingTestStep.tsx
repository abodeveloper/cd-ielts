import { Tabs } from "@/components/ui/tabs";
import ContentPanel from "@/features/exams/components/ContentPanel";
import PartInfo from "@/features/exams/components/PartInfo";
import TestHeader from "@/features/exams/components/TestHeader";
import TestNavigation from "@/features/exams/components/TestNavigation";
import { usePreventPageLeave } from "@/features/exams/hooks/usePreventPageLeave";
import useTestLogic from "@/features/exams/hooks/useTestLogic";
import { useWritingForm } from "@/features/exams/hooks/useWritingForm";
import { WritingPart } from "@/features/exams/types";
import ErrorMessage from "@/shared/components/atoms/error-message/ErrorMessage";
import LoadingSpinner from "@/shared/components/atoms/loading-spinner/LoadingSpinner";
import { TestType } from "@/shared/enums/test-type.enum";
import { get } from "lodash";
import { FormProvider } from "react-hook-form";
import { useParams } from "react-router-dom";

const WritingTestStep = () => {
  const { id } = useParams();
  const { form, onSubmit, query, writingMutation } = useWritingForm(id);

  const parts: WritingPart[] = get(query, "data.writing_parts", []);
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
  } = useTestLogic<WritingPart>(
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

  if (query.data?.writing_parts.length === 0)
    return (
      <ErrorMessage
        title="Failed to load test"
        message="An error occurred while loading the test questions. Please try again later."
      />
    );

  return (
    <FormProvider {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="flex flex-col min-h-screen"
      >
        <div className="sticky top-0 z-50 bg-primary-foreground space-y-1">
          <TestHeader
            timeLeft={timeLeft}
            formatTime={formatTime}
            testType={TestType.WRITING}
            type={get(query, "data.material.test_type", "Mock")}
          />
          <PartInfo activePart={activePart} testType={TestType.WRITING} />
        </div>

        <Tabs
          value={activeTab}
          onValueChange={setActiveTab}
          className="flex flex-col flex-grow"
        >
          <ContentPanel
            data={parts}
            activeTab={activeTab}
            testType={TestType.WRITING}
            form={form}
          />
          <TestNavigation
            data={parts}
            testType={TestType.WRITING}
            form={form}
            activeTab={activeTab}
            setActiveTab={setActiveTab}
            currentTabIndex={currentTabIndex}
            handlePrevious={handlePrevious}
            handleNext={handleNext}
            onSubmit={form.handleSubmit(onSubmit)}
            isTestFinished={isTestFinished}
            isLoading={writingMutation.isPending}
          />
        </Tabs>
      </form>
    </FormProvider>
  );
};

export default WritingTestStep;
