import ConfirmDetailsStep from "../../components/ConfirmDetailsStep";
import FlowPage from "../../components/FlowPage";
import ReadyStep from "./steps/ReadyStep";
import WritingTestStep from "./steps/WritingTestStep";

const WritingTestPage = () => {
  return (
    <FlowPage
      steps={[<ConfirmDetailsStep />, <ReadyStep />, <WritingTestStep />]}
    />
  );
};

export default WritingTestPage;
