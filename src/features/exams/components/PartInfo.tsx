import { Card, CardContent } from "@/components/ui/card";
import { TestData } from "../../types";
import { TestType } from "@/shared/enums/test-type.enum";

interface PartInfoProps<T extends TestData> {
  activePart: T | undefined;
  testType: TestType;
}

const PartInfo = <T extends TestData>({
  activePart,
  testType,
}: PartInfoProps<T>) => {
  if (!activePart) return null;

  const renderInstructions = () => {
    switch (testType) {
      case TestType.READING:
        return "Spend ~20 minutes. Write at least 150 words.";
      case TestType.LISTENING:
        return "Listen carefully and answer the questions. Spend ~15 minutes.";
      case TestType.WRITING:
        return "Write a response in at least 250 words. Spend ~40 minutes.";
      case TestType.SPEAKING:
        return "Write a response in at least 250 words. Spend ~40 minutes.";
      default:
        return "Follow the instructions for this part.";
    }
  };

  return (
    <Card className="w-full shadow-sm rounded-none">
      <CardContent className="p-3 text-sm h-[70px]">
        <div className="font-semibold">Part {activePart.passage_number}</div>
        <div>{renderInstructions()}</div>
      </CardContent>
    </Card>
  );
};

export default PartInfo;
