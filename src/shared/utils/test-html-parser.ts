/**
 * Test script for the HTML parser with user's provided HTML
 */

import { testUserHTML, parseCompleteHTML } from './html-question-parser';

// User's provided HTML
const userHTML = `<p><div>
<list-selection-tegs data-options='[{"value":"A","label":"providing entertainment"},{"value":"B","label":"providing publicity about a council service"},{"value":"C","label":"contacting local businesses"},{"value":"D","label":"giving advice to visitors"},{"value":"E","label":"collecting feedback on events"},{"value":"F","label":"selling tickets"},{"value":"G","label":"introducing guest speakers at an event"},{"value":"H","label":"encouraging cooperation between local organisations"},{"value":"I","label":"helping people find their seats"}]' data-question-type="list_selection" data-repeat="false">
<h3><strong>Questions 11-16</strong></h3>
<p>What is the role of the volunteers in each of the following activities?</p>
<p>Choose <strong>SIX</strong> answers from the box and write the correct letter, <strong>A-I</strong>, next to 11-16.</p>
<br>
<strong>11</strong> walking around the town centre <list-selection-input data-question-number="11" data-question-type="list_selection">…</list-selection-input><br/>
<strong>12</strong> helping at concerts <list-selection-input data-question-number="12" data-question-type="list_selection">…</list-selection-input><br/>
<strong>13</strong> getting involved with community groups <list-selection-input data-question-number="13" data-question-type="list_selection">…</list-selection-input><br/>
<strong>14</strong> helping with a magazine <list-selection-input data-question-number="14" data-question-type="list_selection">…</list-selection-input><br/>
<strong>15</strong> participating at lunches for retired people <list-selection-input data-question-number="15" data-question-type="list_selection">…</list-selection-input><br/>
<strong>16</strong> helping with the website <list-selection-input data-question-number="16" data-question-type="list_selection">…</list-selection-input><br/>
</list-selection-tegs>
</div><p><strong>Questions 17&ndash;20</strong></p>

<p><em>Choose the correct letter,&nbsp;<strong>A</strong>,&nbsp;<strong>B</strong>&nbsp;or&nbsp;<strong>C</strong>.</em></p>

<p>&nbsp;</p>

<p><strong>17</strong>&nbsp;&nbsp; Which event requires the largest number of volunteers?<question-input data-question-number="17" data-question-type="multiple_choice_with_multiple_answer" data-question-options="[{&quot;value&quot;:&quot;A&quot;,&quot;label&quot;:&quot;the music festival&quot;},{&quot;value&quot;:&quot;B&quot;,&quot;label&quot;:&quot;the science festival&quot;},{&quot;value&quot;:&quot;C&quot;,&quot;label&quot;:&quot;the book festival&quot;}]" repeat_answer="True"></question-input></p>

<p><strong>A&nbsp;&nbsp;</strong>&nbsp;the music festival</p>

<p><strong>B&nbsp;&nbsp;</strong>&nbsp;the science festival</p>

<p><strong>C&nbsp;&nbsp;</strong>&nbsp;the book festival</p>

<p>&nbsp;</p>

<p><strong>18</strong>&nbsp;&nbsp; What is the most important requirement for volunteers at the festivals?<question-input data-question-number="18" data-question-type="multiple_choice_with_multiple_answer" data-question-options="[{&quot;value&quot;:&quot;A&quot;,&quot;label&quot;:&quot;interpersonal skills&quot;},{&quot;value&quot;:&quot;B&quot;,&quot;label&quot;:&quot;personal interest in the event&quot;},{&quot;value&quot;:&quot;C&quot;,&quot;label&quot;:&quot;flexibility&quot;}]" repeat_answer="True"></question-input></p>

<p><strong>A&nbsp;&nbsp;</strong>&nbsp;interpersonal skills</p>

<p><strong>B&nbsp;&nbsp;</strong>&nbsp;personal interest in the event</p>

<p><strong>C&nbsp;&nbsp;</strong>&nbsp;flexibility</p>

<p>&nbsp;</p>

<p><strong>19</strong>&nbsp;&nbsp; New volunteers will start working in the week beginning<question-input data-question-number="19" data-question-type="multiple_choice_with_multiple_answer" data-question-options="[{&quot;value&quot;:&quot;A&quot;,&quot;label&quot;:&quot;2 September&quot;},{&quot;value&quot;:&quot;B&quot;,&quot;label&quot;:&quot;9 September&quot;},{&quot;value&quot;:&quot;C&quot;,&quot;label&quot;:&quot;23 September&quot;}]" repeat_answer="True"></question-input></p>

<p><strong>A&nbsp;&nbsp;</strong>&nbsp;2 September.</p>

<p><strong>B&nbsp;&nbsp;</strong>&nbsp;9 September.</p>

<p><strong>C&nbsp;&nbsp;</strong>&nbsp;23 September.</p>

<p><strong>2</strong><strong>0</strong>&nbsp;&nbsp; What is the next annual event for volunteers?</p>

<p><strong>A&nbsp;&nbsp;</strong>&nbsp;a boat trip</p>

<p><strong>B&nbsp;&nbsp;</strong>&nbsp;a barbecue</p>

<p><strong>C&nbsp;&nbsp;</strong>&nbsp;a party</p>`;

/**
 * Test the parsing functionality
 */
export const runParsingTest = (): void => {
  console.log("=".repeat(60));
  console.log("🧪 TESTING HTML PARSER WITH USER'S PROVIDED HTML");
  console.log("=".repeat(60));
  
  try {
    // Test the user's HTML
    testUserHTML(userHTML);
    
    console.log("✅ Parsing completed successfully!");
    console.log("\n");
    
    // Get structured result
    const result = parseCompleteHTML(userHTML);
    
    console.log("📈 Summary:");
    console.log(`- Found ${result.listSelections.length} list selection group(s)`);
    console.log(`- Found ${result.multipleChoices.length} multiple choice question(s)`);
    console.log(`- Total questions parsed: ${result.totalQuestions}`);
    
    // Verify specific questions
    console.log("\n");
    console.log("🔍 Verification:");
    
    if (result.listSelections.length > 0) {
      const listSelection = result.listSelections[0];
      console.log(`✓ List selection has ${listSelection.options.length} options (A-I)`);
      console.log(`✓ List selection has ${listSelection.questions.length} questions (11-16)`);
      
      const expectedQuestions = ["11", "12", "13", "14", "15", "16"];
      const actualQuestions = listSelection.questions.map(q => q.questionNumber);
      const questionsMatch = expectedQuestions.every(q => actualQuestions.includes(q));
      console.log(`✓ Questions match expected: ${questionsMatch}`);
    }
    
    if (result.multipleChoices.length > 0) {
      const expectedMCQuestions = ["17", "18", "19"];
      const actualMCQuestions = result.multipleChoices.map(q => q.questionNumber);
      const mcQuestionsMatch = expectedMCQuestions.every(q => actualMCQuestions.includes(q));
      console.log(`✓ Multiple choice questions match expected: ${mcQuestionsMatch}`);
    }
    
  } catch (error) {
    console.error("❌ Error during parsing test:", error);
  }
  
  console.log("\n" + "=".repeat(60));
};

/**
 * Show usage example for developers
 */
export const showUsageExample = (): void => {
  console.log("💡 USAGE EXAMPLE:");
  console.log("=".repeat(40));
  
  console.log(`
// Import the parser
import { parseCompleteHTML } from '@/shared/utils/html-question-parser';

// Parse your HTML
const htmlContent = "...your HTML here...";
const result = parseCompleteHTML(htmlContent);

// Use the results
console.log('Total questions:', result.totalQuestions);

// Handle list selections
result.listSelections.forEach(ls => {
  console.log('List selection questions:', ls.questions.length);
  console.log('Available options:', ls.options);
});

// Handle multiple choice questions
result.multipleChoices.forEach(mc => {
  console.log('Question', mc.questionNumber, ':', mc.options);
});
`);
  
  console.log("=".repeat(40));
};

// Run tests if this file is executed directly
if (typeof window === 'undefined') {
  runParsingTest();
  showUsageExample();
}

export default {
  runParsingTest,
  showUsageExample,
  userHTML
};
