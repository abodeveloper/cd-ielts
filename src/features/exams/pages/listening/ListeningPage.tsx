import ConfirmDetailsStep from "../../components/ConfirmDetailsStep";
import FlowPage from "../../components/FlowPage";
import ReadyStep from "./steps/ReadyStep";
import TestSoundStep from "./steps/TestSoundsStep";
import TestStep from "./steps/TestStep";

const ListeningPage = () => {
  return (
    <FlowPage
      steps={[
        <ConfirmDetailsStep />,
        <TestSoundStep />,
        <ReadyStep />,
        <TestStep />,
      ]}
    />
  );
};

export default ListeningPage;
