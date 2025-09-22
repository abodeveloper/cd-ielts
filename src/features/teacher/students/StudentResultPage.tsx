import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import BackButton from "@/shared/components/atoms/back-button/BackButton";
import ErrorMessage from "@/shared/components/atoms/error-message/ErrorMessage";
import LoadingSpinner from "@/shared/components/atoms/loading-spinner/LoadingSpinner";
import {
  RiBookOpenLine,
  RiCheckboxFill,
  RiCloseFill,
  RiHeadphoneLine,
  RiMic2Line,
  RiPencilLine,
} from "@remixicon/react";
import { useQuery } from "@tanstack/react-query";
import { get } from "lodash";
import { useNavigate, useParams } from "react-router-dom";
import { getStudentResultOne } from "./api/student";

const StudentResultPage = () => {
  const { id, test_type, skill, obj_id } = useParams();
  const navigate = useNavigate();

  const { data, isLoading, isError } = useQuery({
    queryKey: ["student-result", id, skill, test_type, obj_id],
    queryFn: () => getStudentResultOne(id, test_type, skill, obj_id),
  });

  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (isError)
    return (
      <ErrorMessage
        title="Failed to Load page"
        message="An error occurred while loading the page. Please try again later."
      />
    );

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between gap-2">
        <div className="text-xl font-semibold">
          {get(data, "student.full_name")}
        </div>
        <div className="flex gap-2">
          <BackButton label="Back" />
        </div>
      </div>
      <Card className="w-full">
        <CardHeader className="flex flex-row items-center gap-4">
          <CardTitle>{get(data, "student.full_name")}</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-2">
          {/* <div className="flex gap-2">
            <div className="text-sm text-primary font-extrabold">Username:</div>
            <div className="text-sm text-muted-foreground">
              {get(data, 'student.username')}
            </div>
          </div> */}
          <div className="flex gap-2">
            <div className="text-sm text-primary font-extrabold">Group:</div>
            <div className="text-sm text-muted-foreground">
              <Badge
                onClick={() => navigate(`/teacher/groups/${1}`)}
                className="cursor-pointer"
                variant={"default"}
              >
                {get(data, "student.group.name")}
              </Badge>
            </div>
          </div>
          <div className="flex gap-2">
            <div className="text-sm text-primary font-extrabold">
              Phone number:
            </div>
            <div className="text-sm text-muted-foreground">
              {get(data, "student.phone")}
            </div>
          </div>
        </CardContent>
      </Card>
      {skill == "reading" && (
        <Card className="w-full shadow-lg">
          <CardHeader className="flex items-center space-x-2">
            <RiBookOpenLine className="w-12 h-12" />
            <h1 className="text-center text-lg font-extrabold tracking-tight text-balance">
              IELTS Academic Reading - Results
            </h1>
          </CardHeader>
          <CardContent className="space-y-8">
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <strong>Test title:</strong>
                <div>{get(data, "test_title")}</div>
              </div>
              <div className="flex items-center gap-2">
                <strong>Material title:</strong>
                <div>{get(data, "material_title")}</div>
              </div>
              <div className="flex items-center gap-2">
                <strong>Test type:</strong>
                <div>{get(data, "test_type")}</div>
              </div>
              <div className="flex items-center gap-2">
                <strong>Total Questions:</strong>
                <div>{get(data, "statistics.total_questions")}</div>
              </div>
              <div className="flex items-center gap-2">
                <strong>Correct answers:</strong>
                <div className="text-green-500">
                  {get(data, "statistics.correct_answers")}
                </div>
              </div>
              <div className="flex items-center gap-2">
                <strong>Incorrect answers:</strong>
                <div className="text-destructive">
                  {get(data, "statistics.incorrect_answers")}
                </div>
              </div>
              <div className="flex items-center gap-2">
                <strong>Percentage correct:</strong>
                <div>{get(data, "statistics.score_percentage")} %</div>
              </div>
              {test_type === "mock" && (
                <div className="flex items-center gap-2">
                  <strong>Overal:</strong>
                  <Badge variant={"default"}>
                    {get(data, "statistics.overall")}
                  </Badge>
                </div>
              )}
            </div>
            <div className="space-y-3">
              <h2 className="text-md font-semibold">Answer Review</h2>
              <div className="">
                <Table className="w-full">
                  <TableHeader>
                    <TableRow>
                      <TableHead>Question</TableHead>
                      <TableHead>Your Answer</TableHead>
                      <TableHead>True Answer</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {get(data, "answers", []).map((answer: any) => (
                      <TableRow key={answer.id}>
                        <TableCell>{answer.question_number}</TableCell>
                        <TableCell>
                          {answer.answer || (
                            <Badge className="bg-orange-500">
                              Not answered
                            </Badge>
                          )}
                        </TableCell>
                        <TableCell>{answer.correct_answer}</TableCell>
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
            <div className="flex items-center justify-between w-full"></div>
          </CardFooter>
        </Card>
      )}
      {skill == "listening" && (
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
                <strong>Test title:</strong>
                <div>{get(data, "test_title")}</div>
              </div>
              <div className="flex items-center gap-2">
                <strong>Material title:</strong>
                <div>{get(data, "material_title")}</div>
              </div>
              <div className="flex items-center gap-2">
                <strong>Test type:</strong>
                <div>{get(data, "test_type")}</div>
              </div>
              <div className="flex items-center gap-2">
                <strong>Total Questions:</strong>
                <div>{get(data, "statistics.total_questions")}</div>
              </div>
              <div className="flex items-center gap-2">
                <strong>Correct answers:</strong>
                <div className="text-green-500">
                  {get(data, "statistics.correct_answers")}
                </div>
              </div>
              <div className="flex items-center gap-2">
                <strong>Incorrect answers:</strong>
                <div className="text-destructive">
                  {get(data, "statistics.incorrect_answers")}
                </div>
              </div>
              <div className="flex items-center gap-2">
                <strong>Percentage correct:</strong>
                <div>{get(data, "statistics.score_percentage")} %</div>
              </div>
              {test_type === "mock" && (
                <div className="flex items-center gap-2">
                  <strong>Overal:</strong>
                  <Badge variant={"default"}>
                    {get(data, "statistics.overall")}
                  </Badge>
                </div>
              )}
            </div>
            <div className="space-y-3">
              <h2 className="text-md font-semibold">Answer Review</h2>
              <div className="">
                <Table className="w-full">
                  <TableHeader>
                    <TableRow>
                      <TableHead>Question</TableHead>
                      <TableHead>Your Answer</TableHead>
                      <TableHead>True Answer</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {get(data, "answers", []).map((answer: any) => (
                      <TableRow key={answer.id}>
                        <TableCell>{answer.question_number}</TableCell>
                        <TableCell>
                          {answer.answer || (
                            <Badge className="bg-orange-500">
                              Not answered
                            </Badge>
                          )}
                        </TableCell>
                        <TableCell>{answer.correct_answer}</TableCell>
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
            <div className="flex items-center justify-between w-full"></div>
          </CardFooter>
        </Card>
      )}
      {skill == "writing" && (
        <Card className="w-full shadow-lg">
          <CardHeader className="flex items-center space-x-2">
            <RiPencilLine className="w-12 h-12" />
            <h1 className="text-center text-lg font-extrabold tracking-tight text-balance">
              IELTS Academic Writing - Results
            </h1>
          </CardHeader>
          <CardContent className="space-y-8">
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <strong>Test title:</strong>
                <div>{get(data, "test_title")}</div>
              </div>
              <div className="flex items-center gap-2">
                <strong>Material title:</strong>
                <div>{get(data, "material_title")}</div>
              </div>
              <div className="flex items-center gap-2">
                <strong>Test type:</strong>
                <div>{get(data, "test_type")}</div>
              </div>
              <div className="flex items-center gap-2">
                <strong>Overal:</strong>
                <Badge variant={"default"}>
                  {get(data, "statistics.average_score")}
                </Badge>
              </div>
            </div>
            <div className="space-y-3">
              <h2 className="text-md font-semibold">Answer Review</h2>
              <div className="">
                <Table className="w-full">
                  <TableHeader>
                    <TableRow>
                      <TableHead>Task</TableHead>
                      <TableHead>Your Answer</TableHead>
                      <TableHead>Word count</TableHead>
                      <TableHead>Score</TableHead>
                      <TableHead>Feedback</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {get(data, "answers", []).map((answer: any) => (
                      <TableRow key={answer.id}>
                        <TableCell>{answer.task_number}</TableCell>
                        <TableCell>
                          {answer.answer || (
                            <Badge className="bg-orange-500">
                              Not answered
                            </Badge>
                          )}
                        </TableCell>
                        <TableCell>{answer.word_count}</TableCell>
                        <TableCell>
                          <Badge variant={"default"}>{answer.score}</Badge>
                        </TableCell>

                        <TableCell>{answer.feedback}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
      {skill == "speaking" && (
        <Card className="w-full shadow-lg">
          <CardHeader className="flex items-center space-x-2">
            <RiMic2Line className="w-12 h-12" />
            <h1 className="text-center text-lg font-extrabold tracking-tight text-balance">
              IELTS Academic Speaking - Results
            </h1>
          </CardHeader>
          <CardContent className="space-y-8">
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <strong>Test title:</strong>
                <div>{get(data, "test_title")}</div>
              </div>
              <div className="flex items-center gap-2">
                <strong>Material title:</strong>
                <div>{get(data, "material_title")}</div>
              </div>
              <div className="flex items-center gap-2">
                <strong>Test type:</strong>
                <div>{get(data, "test_type")}</div>
              </div>
              <div className="flex items-center gap-2">
                <strong>Score:</strong>
                <Badge variant={"default"}>
                  {get(data, "statistics.average_score")}
                </Badge>
              </div>
            </div>
            <div className="space-y-3">
              <h2 className="text-md font-semibold">Answer Review</h2>
              <div>
                <Table className="w-full">
                  <TableHeader>
                    <TableRow>
                      <TableHead>Questions</TableHead>
                      <TableHead>Your Answer</TableHead>
                      <TableHead>Feedback</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {get(data, "answers", [])?.map((answer: any) => (
                      <TableRow key={answer.id}>
                        <TableCell>
                          <div className="space-y-4">
                            {answer?.questions?.map(
                              (part: any, index: number) => (
                                <div className="space-y-2" key={index}>
                                  <div className="font-bold">
                                    Part {part?.speaking_part}
                                  </div>
                                  <div className="flex gap-2">
                                    {part?.question?.map(
                                      (item: any, index: number) => (
                                        <div className="flex gap-2" key={index}>
                                          <div className="font-semibold">
                                            {item?.question_number}.
                                          </div>
                                          <div
                                            dangerouslySetInnerHTML={{
                                              __html: item?.question,
                                            }}
                                          />
                                        </div>
                                      )
                                    )}
                                  </div>
                                </div>
                              )
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          {answer.record ? (
                            <audio controls className="w-full">
                              <source src={answer.record} type="audio/mpeg" />
                              Your browser does not support the audio element.
                            </audio>
                          ) : (
                            <Badge className="bg-orange-500">
                              Not answered
                            </Badge>
                          )}
                        </TableCell>
                        <TableCell>{answer.feedback}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default StudentResultPage;
