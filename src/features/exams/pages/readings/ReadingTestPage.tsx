import ConfirmDetailsStep from "../../components/ConfirmDetailsStep";
import FlowPage from "../../components/FlowPage";
import ReadyStep from "./steps/ReadyStep";
import TestStep from "./steps/TestStep";

const ReadingTestPage = () => {
  return (
    <FlowPage steps={[<ConfirmDetailsStep />, <ReadyStep />, <TestStep />]} />
  );
};

export default ReadingTestPage;
