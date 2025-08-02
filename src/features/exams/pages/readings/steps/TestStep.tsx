import { Tabs } from "@/components/ui/tabs";
import ContentPanel from "@/features/exams/components/ContentPanel";
import PartInfo from "@/features/exams/components/PartInfo";
import TestHeader from "@/features/exams/components/TestHeader";
import TestNavigation from "@/features/exams/components/TestNavigation";
import { usePreventPageLeave } from "@/features/exams/hooks/usePreventPageLeave";
import { useReadingForm } from "@/features/exams/hooks/useReadingForm";
import useTestLogic from "@/features/exams/hooks/useTestLogic";
import { Reading } from "@/features/exams/types";
import ErrorMessage from "@/shared/components/atoms/error-message/ErrorMessage";
import LoadingSpinner from "@/shared/components/atoms/loading-spinner/LoadingSpinner";
import { TestType } from "@/shared/enums/test-type.enum";
import { FormProvider } from "react-hook-form";
import { useParams } from "react-router-dom";

const TestPage = () => {
  const { id } = useParams();
  const { form, onSubmit, query } = useReadingForm(id);

  const data: Reading[] = Array.isArray(query.data) ? query.data : [];
  const {
    timeLeft,
    formatTime,
    activeTab,
    setActiveTab,
    currentTabIndex,
    handlePrevious,
    handleNext,
    isTestFinished,
  } = useTestLogic<Reading>(5, data, form.handleSubmit(onSubmit));

  // Prevent page leave when test is not finished
  usePreventPageLeave(!isTestFinished);

  if (query.isLoading) return <LoadingSpinner message="Loading test data..." />;
  if (query.isError)
    return (
      <ErrorMessage
        title="Failed to Load Test"
        message="An error occurred while loading the test. Please try again later."
      />
    );

  const activePart = data.find((part) => `tab-${part.id}` === activeTab);

  return (
    <FormProvider {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="flex flex-col min-h-screen"
      >
        <div className="sticky top-0 z-50 bg-primary-foreground space-y-1">
          <TestHeader timeLeft={timeLeft} formatTime={formatTime} />
          <PartInfo activePart={activePart} testType={TestType.READING} />
        </div>

        <Tabs
          value={activeTab}
          onValueChange={setActiveTab}
          className="flex flex-col flex-grow"
        >
          <ContentPanel
            data={data}
            activeTab={activeTab}
            testType={TestType.READING}
            form={form}
          />
          <TestNavigation
            data={data}
            form={form}
            activeTab={activeTab}
            setActiveTab={setActiveTab}
            currentTabIndex={currentTabIndex}
            handlePrevious={handlePrevious}
            handleNext={handleNext}
            onSubmit={form.handleSubmit(onSubmit)}
            isTestFinished={isTestFinished}
          />
        </Tabs>
      </form>
    </FormProvider>
  );
};

export default TestPage;
