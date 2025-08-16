import ConfirmDetailsStep from "../../components/ConfirmDetailsStep";
import FlowPage from "../../components/FlowPage";
import ReadingTestStep from "./steps/ReadingTestStep";
import ReadyStep from "./steps/ReadyStep";

const ReadingTestPage = () => {
  return (
    <FlowPage
      steps={[<ConfirmDetailsStep />, <ReadyStep />, <ReadingTestStep />]}
    />
    // <FlowPage steps={[<ReadingTestStep />]} />
  );
};

export default ReadingTestPage;
