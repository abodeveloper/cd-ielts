import { TabsContent } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import ErrorMessage from "@/shared/components/atoms/error-message/ErrorMessage";
import { TestType } from "@/shared/enums/test-type.enum";
import { UseFormReturn } from "react-hook-form";
import ListeningQuestionContent from "../pages/listening/components/ListeningQuestionContent";
import ReadingQuestionContent from "../pages/readings/components/ReadingQuestionContent";
import WritingQuestionContent from "../pages/writing/components/WritingQuestionContent";
import { ListeningFormValues } from "../schemas/listening-schema";
import { ReadingFormValues } from "../schemas/reading-schema";
import { WritingFormValues } from "../schemas/writing-schema";
import {
  AllTestParts,
  ListeningPart,
  ReadingPart,
  WritingPart
} from "../types";

// Type guard to check if part is Reading
const isReading = (part: AllTestParts): part is ReadingPart => {
  return (
    // "questions" in part && "answers" in part && Array.isArray(part.answers)
    "questions" in part
  );
};
const isListening = (part: AllTestParts): part is ListeningPart => {
  return (
    "questions" in part &&
    "question_numbers" in part &&
    Array.isArray(part.question_numbers)
  );
};
const isWriting = (part: AllTestParts): part is WritingPart => {
  return true;
};

interface ContentPanelProps<T extends AllTestParts> {
  data: T[];
  activeTab: string;
  testType: TestType;
  form: UseFormReturn;
}

const ContentPanel = <T extends AllTestParts>({
  data,
  activeTab,
  testType,
  form,
}: ContentPanelProps<T>) => {
  const renderContent = (part: T, index: number) => {
    switch (testType) {
      case TestType.READING:
        if (!isReading(part))
          return <ErrorMessage title="Error" message="Invalid reading data" />;
        return (
          <>
            <ReadingQuestionContent
              part={part}
              form={form as UseFormReturn<ReadingFormValues>}
            />
          </>
        );
      case TestType.LISTENING:
        if (!isListening(part))
          return (
            <ErrorMessage title="Error" message="Invalid listening data" />
          );
        return (
          <ListeningQuestionContent
            part={part}
            form={form as UseFormReturn<ListeningFormValues>}
          />
        );
      case TestType.WRITING:
        if (!isWriting(part))
          return (
            <ErrorMessage title="Error" message="Invalid writing data" />
          );
        return (
          <WritingQuestionContent
            part={part}
            index={index}
            form={form as UseFormReturn<WritingFormValues>}
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
