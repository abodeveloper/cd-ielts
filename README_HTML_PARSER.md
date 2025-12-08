# HTML Question Parser Documentation

HTML savol parserи qo'shildi - turli formatdagi HTML kontentni parse qilish uchun.

## Qo'shilgan funksiyalar / Added Features

### 1. HTML Parser Utilities

**Files:**
- `src/shared/utils/html-parser.ts` - Asosiy parser funksiyalari
- `src/shared/utils/html-question-parser.ts` - To'liq parser va test funksiyalari  
- `src/shared/utils/test-html-parser.ts` - Test scripti

### 2. ReadingQuestionRenderer Enhancements

**File:** `src/features/exams/pages/readings/components/ReadingQuestionRenderer.tsx`

- `list-selection-input` elementlarini parse qilish qo'shildi
- `list-selection-tegs` ichida individual input elementlarni qo'llab-quvvatlash
- Dinamik question number extraction

## Foydalanish / Usage

### Asosiy funksiya - Complete HTML Parsing

```typescript
import { parseCompleteHTML } from '@/shared/utils/html-question-parser';

const htmlContent = `your HTML content here`;
const result = parseCompleteHTML(htmlContent);

console.log('Total questions:', result.totalQuestions);
console.log('List selections:', result.listSelections);
console.log('Multiple choices:', result.multipleChoices);
```

### Format Support

#### 1. List Selection Format (Yangi)

```html
<list-selection-tegs data-options='[{"value":"A","label":"providing entertainment"},...]' 
                     data-question-type="list_selection" 
                     data-repeat="false">
  <h3>Questions 11-16</h3>
  <p>What is the role of volunteers...</p>
  
  <strong>11</strong> walking around the town centre 
  <list-selection-input data-question-number="11" data-question-type="list_selection">…</list-selection-input>
  
  <strong>12</strong> helping at concerts 
  <list-selection-input data-question-number="12" data-question-type="list_selection">…</list-selection-input>
  
  <!-- ... more questions ... -->
</list-selection-tegs>
```

#### 2. Multiple Choice Format (Mavjud)

```html
<question-input data-question-number="17" 
                data-question-type="multiple_choice_with_multiple_answer" 
                data-question-options='[{"value":"A","label":"the music festival"},...]'
                repeat_answer="True">
</question-input>
```

## API Reference

### parseCompleteHTML(htmlString: string)

**Returns:** 
```typescript
{
  listSelections: ParsedListSelection[];
  multipleChoices: ParsedMultipleChoice[];
  totalQuestions: number;
}
```

### parseListSelectionElements(htmlString: string)

List selection elementlarini alohida parse qilish.

**Returns:** `ParsedListSelection[]`

### parseMultipleChoiceElements(htmlString: string)  

Multiple choice elementlarini alohida parse qilish.

**Returns:** `ParsedMultipleChoice[]`

### testUserHTML(htmlString: string)

HTML kontentni test qilish va natijalarni console'ga chiqarish.

## Example Usage in Component

```typescript
import { parseCompleteHTML } from '@/shared/utils/html-question-parser';

const QuestionComponent = ({ htmlContent }: { htmlContent: string }) => {
  const parseResult = parseCompleteHTML(htmlContent);
  
  return (
    <div>
      <h2>Total Questions: {parseResult.totalQuestions}</h2>
      
      {parseResult.listSelections.map((ls, index) => (
        <div key={index}>
          <h3>List Selection Group {index + 1}</h3>
          <p>Questions: {ls.questions.length}</p>
          <p>Options: {ls.options.length}</p>
        </div>
      ))}
      
      {parseResult.multipleChoices.map((mc, index) => (
        <div key={index}>
          <h3>Multiple Choice Question {mc.questionNumber}</h3>
          <p>Options: {mc.options.length}</p>
        </div>
      ))}
    </div>
  );
};
```

## ReadingQuestionRenderer Integration

ReadingQuestionRenderer avtomatik ravishda yangi formatni qo'llab-quvvatlaydi:

```typescript
<ReadingQuestionRenderer 
  htmlString={htmlContent}
  form={form}
  enabledHighlight={true}
/>
```

## Test qilish / Testing

Test scriptini ishga tushirish:

```typescript
import { runParsingTest } from '@/shared/utils/test-html-parser';

runParsingTest(); // Console'da natijalar ko'rsatiladi
```

## Xususiyatlari / Features

- ✅ List selection with individual inputs
- ✅ Multiple choice questions  
- ✅ Dynamic question number extraction
- ✅ JSON option parsing with error handling
- ✅ Repeat/non-repeat answer support
- ✅ Type-safe interfaces
- ✅ Comprehensive testing utilities
- ✅ Full integration with existing ReadingQuestionRenderer

## Migration Notes

Eski kod buzilmaydi - yangi funksional qo'shilgan, mavjudlari saqlanib qolgan.

## Misol - User's HTML Format

Sizning berilgan HTML formatigiz:

```html
<list-selection-tegs data-options='[{"value":"A","label":"providing entertainment"}...]'>
  <h3><strong>Questions 11-16</strong></h3>
  <strong>11</strong> walking around the town centre <list-selection-input data-question-number="11">…</list-selection-input>
  <strong>12</strong> helping at concerts <list-selection-input data-question-number="12">…</list-selection-input>
  <!-- ... -->
</list-selection-tegs>

<question-input data-question-number="17" data-question-options='[...]'>
</question-input>
```

Bu format endi to'liq qo'llab-quvvatlanadi! ✅
