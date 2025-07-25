import { usePreventPageLeave } from "@/features/exams/hooks/usePreventPageLeave";
import { useState } from "react";

const TestPage = () => {
  const [isTestFinished, setIsTestFinished] = useState(false);

  usePreventPageLeave(!isTestFinished);

  return (
    <div>
      <h1>Test</h1>
      <button onClick={() => setIsTestFinished(true)}>Testni tugatish</button>
    </div>
  );
};

export default TestPage;
