import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useAuthStore } from "@/store/auth-store";
import {
  RiCheckboxFill,
  RiCloseFill,
  RiErrorWarningLine,
  RiHeadphoneLine,
} from "@remixicon/react";
import { get } from "lodash";

interface Props {
  onNext?: (data?: Record<string, any>) => void;
  formData?: Record<string, any>;
  disableOverflow?: boolean; // Step uchun ixtiyoriy boolean
}

export default function ListeningAnswerStep({ formData }: Props) {
  const { user } = useAuthStore();

  const finish = get(formData, "finish");
  const test_type = get(formData, "test_type");
  const overall_score = get(formData, "overall_score");
  const percentage_correct_for_material = get(
    formData,
    "percentage_correct_for_material",
    0
  );
  const answers = get(formData, "answers", []);
  const totalAnswers = get(formData, "total_answers", 0);
  const totalCorrectAnswers = get(formData, "total_correct_answers", 0);
  const totalIncorrectAnswers = get(formData, "total_incorrect_answers", 0);

  const handleFinish = () => {
    finish();
  };

  return (
    <div className="p-4 w-full">
      <Card className="w-full shadow-lg">
        <CardHeader className="flex items-center space-x-2">
          <RiHeadphoneLine className="w-12 h-12" />
          <h1 className="text-center text-lg font-extrabold tracking-tight text-balance">
            IELTS Academic Listening - Results
          </h1>
        </CardHeader>
        <CardContent className="space-y-8">
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <strong>Candidate:</strong>
              <div>{get(user, "full_name")}</div>
            </div>
            <div className="flex items-center gap-2">
              <strong>Total Questions:</strong>
              <div>{totalAnswers}</div>
            </div>
            <div className="flex items-center gap-2">
              <strong>Correct answers:</strong>
              <div className="text-green-500">{totalCorrectAnswers}</div>
            </div>
            <div className="flex items-center gap-2">
              <strong>Incorrect answers:</strong>
              <div className="text-destructive">{totalIncorrectAnswers}</div>
            </div>
            <div className="flex items-center gap-2">
              <strong>Percentage correct for material:</strong>
              <div>{percentage_correct_for_material}%</div>
            </div>
            {test_type === "mock" && (
              <div className="flex items-center gap-2 mt-4">
                <strong>Overal:</strong>
                <Badge variant={"default"}>{overall_score}</Badge>
              </div>
            )}
          </div>
          <div className="space-y-3">
            <h2 className="text-md font-semibold">Answer Review</h2>
            <div className="overflow-x-auto">
              <Table className="h-[400px]">
                <TableHeader>
                  <TableRow>
                    <TableHead>Question</TableHead>
                    <TableHead>Your Answer</TableHead>
                    <TableHead>True Answer</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {answers.map((answer: any) => (
                    <TableRow key={answer.id}>
                      <TableCell>{answer.question_number}</TableCell>
                      <TableCell>
                        {answer.answer || (
                          <Badge className="bg-orange-500">Not answered</Badge>
                        )}
                      </TableCell>
                      <TableCell>{answer.true_answer}</TableCell>
                      <TableCell>
                        {answer.is_true ? (
                          <RiCheckboxFill className="text-green-500" />
                        ) : (
                          <RiCloseFill className="text-destructive" />
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>
        </CardContent>
        <CardFooter>
          <div className="flex items-center justify-between w-full">
            <p className="flex gap-2">
              <RiErrorWarningLine /> Review and finalize your results.
            </p>
            <Button className="w-64" onClick={() => handleFinish()}>
              Finish
            </Button>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}
