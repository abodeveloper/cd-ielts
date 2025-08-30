import ConfirmDetailsStep from "../../components/ConfirmDetailsStep";
import FlowPage from "../../components/FlowPage";
import ListeningAnswerStep from "./steps/ListeningAnswerStep";
import ListeningTestStep from "./steps/ListeningTestStep";
import ReadyStep from "./steps/ReadyStep";

const ListeningTestPage = () => {
  return (
    <FlowPage
      steps={[
        <ConfirmDetailsStep />,
        <ReadyStep />,
        <ListeningTestStep />,
        <ListeningAnswerStep />,
      ]}
    />
    // <FlowPage steps={[<ListeningTestStep />]} />
  );
};

export default ListeningTestPage;
