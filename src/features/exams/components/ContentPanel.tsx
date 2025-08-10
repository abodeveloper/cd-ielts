import { TabsContent } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import { TestType } from "@/shared/enums/test-type.enum";
import { UseFormReturn } from "react-hook-form";
import { Reading, TestData } from "../types";
import ReadingQuestionRenderer from "../pages/readings/components/ReadingQuestionRenderer";
import ReadingQuestionContent from "../pages/readings/components/ReadingQuestionContent";
import { ReadingFormValues } from "../schemas/reading-schema";
import WritingQuestionContent from "../pages/writing/components/WritingQuestionContent";

// Type guard to check if part is Reading
const isReading = (part: TestData): part is Reading => {
  return (
    "questions" in part && "answers" in part && Array.isArray(part.answers)
  );
};

interface ContentPanelProps<T extends TestData> {
  data: T[];
  activeTab: string;
  testType: TestType;
  form: UseFormReturn;
}

const ContentPanel = <T extends TestData>({
  data,
  activeTab,
  testType,
  form,
}: ContentPanelProps<T>) => {
  const renderContent = (part: T, index: number) => {
    switch (testType) {
      case TestType.READING:
        if (!isReading(part)) {
          return <div>Invalid reading data</div>;
        }
        return (
          <ReadingQuestionContent
            part={part}
            form={form as UseFormReturn<ReadingFormValues>}
          />
        );
      case TestType.LISTENING:
        return <div className="p-6 text-sm"></div>;
      case TestType.WRITING:
        return (
          <WritingQuestionContent
            part={part}
            index={index}
            form={form as UseFormReturn<ReadingFormValues>}
          />
        );
      default:
        return <div>Unsupported test type</div>;
    }
  };

  return (
    <div>
      {data.map((part, index) => (
        <TabsContent
          key={part.id}
          value={`tab-${part.id}`}
          className={cn(
            "h-full bg-muted",
            activeTab !== `tab-${part.id}` && "hidden"
          )}
        >
          {renderContent(part, index)}
        </TabsContent>
      ))}
    </div>
  );
};

export default ContentPanel;
