import ConfirmDetailsStep from "../../components/ConfirmDetailsStep";
import FlowPage from "../../components/FlowPage";
import ListeningTestStep from "./steps/ListeningTestStep";
import ReadyStep from "./steps/ReadyStep";

const ListeningTestPage = () => {
  return (
    <FlowPage
      steps={[<ConfirmDetailsStep />, <ReadyStep />, <ListeningTestStep />]}
    />
    // <FlowPage steps={[<ListeningTestStep />]} />
  );
};

export default ListeningTestPage;
