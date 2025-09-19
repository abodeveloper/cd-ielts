import ResizableContent from "@/features/exams/components/ResizibleContent";
import { ReadingFormValues } from "@/features/exams/schemas/reading-schema";
import { ReadingPart } from "@/features/exams/types";
import HTMLRenderer from "@/shared/components/atoms/html-renderer/HtmlRenderer";
import { UseFormReturn } from "react-hook-form";
import ReadingQuestionRenderer from "./ReadingQuestionRenderer";

// Fake HTML string (sizning qisqa HTML)
const fakeHtmlString = `
<h3><em><strong>Using AI in the UK health system</strong></em></h3>
<drag-drop-matching-sentence-endings data-repeat="false" data-options='[{"value": "A", "label": "medical practitioners"}, {"value": "B", "label": "specialised tasks"}, {"value": "C", "label": "available resources"}, {"value": "D", "label": "reduced illness"}, {"value": "E", "label": "professional authority"}, {"value": "F", "label": "technology experts"}]'>
  <h3><em><strong>Questions 24-26</strong></em></h3>
  <p><em>Complete the summary using the list of phrases, <strong>A-F</strong>, below.</em></p>
  <p><em>Write the correct letter, <strong>A-F</strong>, in boxes 24-26 on your answer sheet.</em></p>
  <p>AI currently has a limited role in the way <strong>24</strong><drag-drop-sentence-input data-question-number="24" data-question-type="matching_sentence_endings">&hellip;</drag-drop-sentence-input> are allocated in the health service.</p>
  <p>The positive aspect of AI having a bigger role is that it would be more efficient and lead to patient benefits. However, such a change would result, for example, in certain <strong>25</strong><drag-drop-sentence-input data-question-number="25" data-question-type="matching_sentence_endings">&hellip;</drag-drop-sentence-input> not having their current level of <strong>26</strong><drag-drop-sentence-input data-question-number="26" data-question-type="matching_sentence_endings">&hellip;</drag-drop-sentence-input>.</p>
  <p>It is therefore important that AI goals are appropriate so that discriminatory practices could be avoided.</p>
</drag-drop-matching-sentence-endings>
`;

interface ReadingQuestionContentProps {
  part: ReadingPart;
  form: UseFormReturn<ReadingFormValues>;
}

const ReadingQuestionContent = ({
  part,
  form,
}: ReadingQuestionContentProps) => {
  // Sinov uchun fake HTML ishlatamiz
  const questionsHtml = fakeHtmlString;

  return (
    <div className="h-[calc(100vh-232px)]">
      <ResizableContent
        leftContent={
          <HTMLRenderer
            className="h-full overflow-y-auto p-6 text-sm"
            htmlString={part.content || "<p>Sample content for testing</p>"}
          />
        }
        rightContent={
          <div className="h-full overflow-y-auto overflow-x-hidden p-6 space-y-8 text-sm">
            {questionsHtml ? (
              <ReadingQuestionRenderer htmlString={part.questions} form={form} />
            ) : (
              <div>No questions available</div>
            )}
            {part.questions}
          </div>
        }
      />
    </div>
  );
};

export default ReadingQuestionContent;
