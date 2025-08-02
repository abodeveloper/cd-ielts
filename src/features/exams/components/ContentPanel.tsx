import { TabsContent } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import { TestType } from "@/shared/enums/test-type.enum";
import { UseFormReturn } from "react-hook-form";
import { Reading, TestData } from "../types";
import ReadingQuestionRenderer from "../pages/readings/components/ReadingQuestionRenderer";
import ReadingQuestionContent from "../pages/readings/components/ReadingQuestionContent";
import { ReadingFormValues } from "../schemas/reading-schema";

// Type guard to check if part is Reading
const isReading = (part: TestData): part is Reading => {
  return "questions" in part && "answers" in part && Array.isArray(part.answers);
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
  const renderContent = (part: T) => {
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
        return (
          <div className="h-[calc(100vh-260px)] p-6 text-sm">
            <audio controls className="mb-4">
              <source src={part.content} type="audio/mpeg" />
              Your browser does not support the audio element.
            </audio>
            {part.questions ? (
              <ReadingQuestionRenderer
                htmlString={part.questions}
                form={form}
              />
            ) : (
              <div>No questions available</div>
            )}
          </div>
        );
      case TestType.WRITING:
        return (
          <div className="h-[calc(100vh-260px)] p-6 text-sm">
            <div
              className="mb-4"
              dangerouslySetInnerHTML={{ __html: part.content }}
            />
            <textarea
              className="w-full h-64 p-2 border rounded"
              placeholder="Write your response here..."
              {...form.register(`answers.${part.id}.response`)}
            />
          </div>
        );
      default:
        return <div>Unsupported test type</div>;
    }
  };

  return (
    <div className="flex-grow">
      {data.map((part) => (
        <TabsContent
          key={part.id}
          value={`tab-${part.id}`}
          className={cn("h-full", activeTab !== `tab-${part.id}` && "hidden")}
        >
          {renderContent(part)}
        </TabsContent>
      ))}
    </div>
  );
};

export default ContentPanel;
