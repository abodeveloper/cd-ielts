import ConfirmDetailsStep from "../../components/ConfirmDetailsStep";
import FlowPage from "../../components/FlowPage";
import ReadyStepSpeaking from "./steps/ReadyStep";
import SpeakingTestStep from "./steps/SpeakingTestStep";
import TestMicrophoneStep from "./steps/TestMicrophoneStep";

const SpeakingTestPage = () => {
  return (
    <FlowPage steps={[<ConfirmDetailsStep />, <ReadyStepSpeaking/>, <TestMicrophoneStep/>, <SpeakingTestStep />]} />
    // <FlowPage steps={[<SpeakingTestStep />]} />
  );
};

export default SpeakingTestPage;
