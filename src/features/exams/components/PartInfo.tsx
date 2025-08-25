import { Card, CardContent } from "@/components/ui/card";
import { TestType } from "@/shared/enums/test-type.enum";
import { get } from "lodash";
import { AllTestParts } from "../types";

interface PartInfoProps<T extends AllTestParts> {
  activePart: T | undefined;
  testType: TestType;
}

const PartInfo = <T extends AllTestParts>({
  activePart,
  testType,
}: PartInfoProps<T>) => {
  if (!activePart) return null;

  const renderNumber = () => {
    switch (testType) {
      case TestType.READING:
        return get(activePart, "passage_number", "");
      case TestType.LISTENING:
        return get(activePart, "listening_section", "");
      case TestType.WRITING:
        return get(activePart, "writing_task", "");
      default:
        return "Follow the instructions for this part.";
    }
  };

  return (
    <Card className="w-full shadow-sm rounded-none">
      <CardContent className="p-3 text-sm h-[70px]">
        <div className="font-semibold">Part {renderNumber()}</div>
        <div>{activePart.description}</div>
      </CardContent>
    </Card>
  );
};

export default PartInfo;
