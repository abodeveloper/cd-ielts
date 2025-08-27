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
import { Role } from "@/shared/enums/role.enum";
import { useAuthStore } from "@/store/auth-store";
import { RiBookOpenLine, RiErrorWarningLine } from "@remixicon/react";
import { get } from "lodash";
import { useNavigate } from "react-router-dom";

interface Props {
  onNext?: (data?: Record<string, any>) => void;
  formData?: Record<string, any>;
  disableOverflow?: boolean; // Step uchun ixtiyoriy boolean
}

export default function ReadingAnswerStep({ formData }: Props) {
  const navigate = useNavigate();

  const { user } = useAuthStore();
  const answers = get(formData, "answers", []);
  const totalAnswers = get(formData, "total_answers", 0);
  const totalCorrectAnswers = get(formData, "total_correct_answers", 0);
  const totalIncorrectAnswers = get(formData, "total_incorrect_answers", 0);

  const handleFinish = () => {
    if (user?.role === Role.TEACHER) {
      navigate("/teacher");
    } else {
      navigate("/student");
    }
  };

  return (
    <div className="p-4 w-full">
      <Card className="w-full shadow-lg">
        <CardHeader className="flex items-center space-x-2">
          <RiBookOpenLine className="w-12 h-12" />
          <h1 className="text-center text-lg font-extrabold tracking-tight text-balance">
            IELTS Academic Reading - Results
          </h1>
        </CardHeader>
        <CardContent className="space-y-8">
          <div className="space-y-3">
            <p>
              <strong>Candidate:</strong> {get(user, "full_name")}
            </p>
            <p>
              <strong>Total Questions:</strong> {totalAnswers}
            </p>
            <p>
              <strong>Correct Answers:</strong> {totalCorrectAnswers}
            </p>
            <p>
              <strong>Incorrect Answers:</strong> {totalIncorrectAnswers}
            </p>
          </div>
          <div className="space-y-3">
            <h2 className="text-md font-semibold">Answer Review</h2>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Question #</TableHead>
                    <TableHead>Your Answer</TableHead>
                    <TableHead>True Answer</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {answers.map((answer: any) => (
                    <TableRow key={answer.id}>
                      <TableCell>{answer.question_number}</TableCell>
                      <TableCell>{answer.answer || "Not answered"}</TableCell>
                      <TableCell>{answer.true_answer}</TableCell>
                      <TableCell>
                        <span
                          className={
                            answer.is_true ? "text-green-600" : "text-red-600"
                          }
                        >
                          {answer.is_true ? "Correct" : "Incorrect"}
                        </span>
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
              <RiErrorWarningLine /> Review your results and proceed when ready.
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
