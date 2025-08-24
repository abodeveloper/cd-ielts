import { TabsContent } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import { TestType } from "@/shared/enums/test-type.enum";
import { UseFormReturn } from "react-hook-form";
import ReadingQuestionContent from "../pages/readings/components/ReadingQuestionContent";
import WritingQuestionContent from "../pages/writing/components/WritingQuestionContent";
import { ListeningFormValues } from "../schemas/listening-schema";
import { ReadingFormValues } from "../schemas/reading-schema";
import { Reading, Speaking, TestData } from "../types";
import ListeningQuestionContent from "../pages/listening/components/ListeningQuestionContent";
import SpeakingQuestionContent from "../pages/speaking/components/SpeakingQuestionContent";
import { SpeakingFormValues } from "../schemas/speaking-schema";

// Type guard to check if part is Reading
const isReading = (part: TestData): part is Reading => {
  return (
    // "questions" in part && "answers" in part && Array.isArray(part.answers)
    "questions" in part
  );
};
const isListening = (part: TestData): part is Reading => {
  return (
    "questions" in part && "answers" in part && Array.isArray(part.answers)
  );
};
const isSpeaking = (part: TestData): part is Speaking => {
  return (
    "questions" in part
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
  const renderContent = (part: T, index: number, activeTab: number) => {
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
        if (!isListening(part)) {
          return <div>Invalid listening data</div>;
        }
        return (
          <ListeningQuestionContent
            part={part}
            form={form as UseFormReturn<ListeningFormValues>}
          />
        );
      case TestType.SPEAKING:
        if (!isSpeaking(part)) {
          return <div>Invalid listening data</div>;
        }
        return (
          <SpeakingQuestionContent
            part={part}
            activeTab={activeTab}
            form={form as UseFormReturn<SpeakingFormValues>}
          />
        );

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
          {renderContent(part, index, activeTab)}
        </TabsContent>
      ))}
    </div>
  );
};

export default ContentPanel;
