import ConfirmDetailsStep from "../../components/ConfirmDetailsStep";
import FlowPage from "../../components/FlowPage";
import ReadingAnswersStep from "./steps/ReadingAnswersStep";
import ReadingTestStep from "./steps/ReadingTestStep";
import ReadyStep from "./steps/ReadyStep";

const ReadingTestPage = () => {
  return (
    <FlowPage
      steps={[
        <ConfirmDetailsStep />,
        <ReadyStep />,
        <ReadingTestStep />,
        <ReadingAnswersStep disableOverflow={true} />,
      ]}
    />
    // <FlowPage steps={[<ReadingTestStep/>, <ReadyStep/> ]} />
  );
};

export default ReadingTestPage;
