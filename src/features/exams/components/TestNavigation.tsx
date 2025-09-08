import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import ConfirmationDialog from "@/shared/components/atoms/confirmation-dialog/ConfirmationDialog";
import { TestType } from "@/shared/enums/test-type.enum";
import { RiArrowLeftSLine, RiArrowRightSLine } from "@remixicon/react";
import { get, isEmpty } from "lodash";
import { UseFormReturn } from "react-hook-form";
import { AllTestParts } from "../types";

interface TestNavigationProps<T extends AllTestParts> {
  data: T[];
  form: UseFormReturn;
  activeTab: string;
  testType: TestType;
  setActiveTab: (value: string) => void;
  currentTabIndex: number;
  handlePrevious: () => void;
  handleNext: () => void;
  onSubmit: () => void;
  isTestFinished: boolean;
  isLoading: boolean;
}

const TestNavigation = <T extends AllTestParts>({
  data,
  form,
  activeTab,
  testType,
  setActiveTab,
  currentTabIndex,
  handlePrevious,
  handleNext,
  onSubmit,
  isTestFinished,
  isLoading,
}: TestNavigationProps<T>) => {
  const renderNumber = (part: AllTestParts) => {
    switch (testType) {
      case TestType.READING:
        return get(part, "passage_number", "");
      case TestType.LISTENING:
        return get(part, "listening_section", "");
      case TestType.WRITING:
        return get(part, "writing_task", "");
      default:
        return "";
    }
  };

  return (
    <Card className="w-full shadow-md p-2 sticky bottom-0 z-50 rounded-none">
      <CardContent className="p-0 flex items-center justify-between gap-2 h-[80px]">
        <TabsList className="grid grid-cols-2 gap-2 min-h-min">
          {data.map((part) => {
            const question_numbers = get(part, "question_numbers", []);

            return (
              <div key={part.id} className="flex gap-2">
                <TabsTrigger value={`tab-${part.id}`}>
                  Part {renderNumber(part)}
                </TabsTrigger>
                {!isEmpty(question_numbers) && (
                  <div className="flex flex-wrap gap-2">
                    {question_numbers?.map((item) => {
                      const value = form.watch(
                        `answers.${item?.question_number - 1}.answer`
                      );
                      const isAnswered = !!value && value.trim() !== "";
                      return (
                        <Label
                          key={item.id}
                          htmlFor={item?.question_number?.toString()}
                          onClick={() => setActiveTab(`tab-${part.id}`)}
                          className={cn(
                            "cursor-pointer rounded h-7 w-7 text-sm flex items-center justify-center",
                            isAnswered
                              ? "bg-primary text-background hover:bg-primary/90"
                              : "border border-primary text-primary hover:bg-primary/10"
                          )}
                        >
                          {item?.question_number}
                        </Label>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </TabsList>
        <div className="flex items-center gap-2">
          <Button
            type="button"
            onClick={handlePrevious}
            disabled={currentTabIndex === 0 || isTestFinished}
            variant="outline"
            size="sm"
            className="p-0 w-8 h-8"
          >
            <RiArrowLeftSLine className="w-4 h-4" />
          </Button>
          <Button
            type="button"
            onClick={handleNext}
            disabled={currentTabIndex === data.length - 1 || isTestFinished}
            variant="outline"
            size="sm"
            className="p-0 w-8 h-8"
          >
            <RiArrowRightSLine className="w-4 h-4" />
          </Button>

          <ConfirmationDialog
            trigger={
              <Button
                type="button"
                disabled={isTestFinished}
                className="w-full md:w-auto"
              >
                Submit
              </Button>
            }
            title="Submit Test ?"
            description="Are you sure you want to submit the test? This action cannot be undone."
            onConfirm={onSubmit}
            confirmText="Yes, Submit"
            cancelText="No, Cancel"
            isLoading={isLoading}
          />
        </div>
      </CardContent>
    </Card>
  );
};

export default TestNavigation;
