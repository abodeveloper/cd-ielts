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
import AudioPlayer from "@/shared/components/atoms/audio-player/AudioPlayer";
import { Separator } from "@/components/ui/separator";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  RiBookOpenLine,
  RiCheckboxFill,
  RiCloseFill,
  RiHeadphoneLine,
  RiMic2Line,
  RiPencilLine,
  RiArrowDownSLine,
  RiArrowUpSLine,
} from "@remixicon/react";
import { useQuery } from "@tanstack/react-query";
import { get } from "lodash";
import { useNavigate, useParams } from "react-router-dom";
import { useState } from "react";
import { getStudentResultOne } from "./api/student";
import { getListeningOne } from "@/features/exams/api/listening";

const FeedbackCollapsible = ({ feedback }: { feedback: string }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <Separator />
      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        <CollapsibleTrigger className="flex items-center justify-between w-full p-2 hover:bg-muted/50 rounded-lg transition-colors">
          <div className="text-sm font-semibold text-muted-foreground">
            Feedback
          </div>
          {isOpen ? (
            <RiArrowUpSLine className="h-4 w-4 text-muted-foreground" />
          ) : (
            <RiArrowDownSLine className="h-4 w-4 text-muted-foreground" />
          )}
        </CollapsibleTrigger>
        <CollapsibleContent className="mt-2">
          <div className="p-4 bg-muted/50 rounded-lg border">
            <p className="text-sm whitespace-pre-wrap">{feedback}</p>
          </div>
        </CollapsibleContent>
      </Collapsible>
    </>
  );
};

const StudentResultPage = () => {
  const { id, test_type, skill, obj_id } = useParams();
  const navigate = useNavigate();

  const { data, isLoading, isError } = useQuery({
    queryKey: ["student-result", id, skill, test_type, obj_id],
    queryFn: () => getStudentResultOne(id, test_type, skill, obj_id),
  });

  // Get listening material data for audio players
  const { data: listeningData } = useQuery({
    queryKey: ["listening-material", obj_id],
    queryFn: () => getListeningOne(obj_id || ""),
    enabled: skill === "listening" && !!obj_id,
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
            {/* Audio Players Section */}
            {skill === "listening" && listeningData && (
              <div className="space-y-3">
                <h2 className="text-md font-semibold">Audio</h2>
                <div className="space-y-4">
                  {get(listeningData, "listening_parts", [])
                    .sort((a: any, b: any) => 
                      (a.listening_section || 0) - (b.listening_section || 0)
                    )
                    .map((part: any, index: number) => {
                      const audioUrl = Array.isArray(part.audio)
                        ? part.audio[0]
                        : part.audio;
                      
                      if (!audioUrl) return null;
                      
                      return (
                        <div key={part.id || index} className="w-full">
                          <AudioPlayer
                            src={audioUrl}
                            title={part.title || `Section ${part.listening_section || index + 1}`}
                          />
                        </div>
                      );
                    })}
                </div>
              </div>
            )}
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
          <CardHeader className="flex flex-col gap-4 pb-6">
            <div className="flex items-center justify-center gap-3">
              <RiMic2Line className="w-10 h-10 text-primary" />
              <h1 className="text-2xl font-bold">IELTS Academic Speaking - Results</h1>
            </div>
            <Separator />
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 pt-2">
              <div className="space-y-1">
                <div className="text-sm text-muted-foreground font-medium">Test title</div>
                <div className="text-sm font-semibold">{get(data, "test_title") || "—"}</div>
              </div>
              <div className="space-y-1">
                <div className="text-sm text-muted-foreground font-medium">Material title</div>
                <div className="text-sm font-semibold">{get(data, "material_title") || "—"}</div>
              </div>
              <div className="space-y-1">
                <div className="text-sm text-muted-foreground font-medium">Score</div>
                <Badge variant="default" className="w-fit text-base px-3 py-1">
                  {get(data, "statistics.average_score") || "—"}
                </Badge>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <style>{`
              .speaking-questions * {
                font-size: 16px !important;
              }
              .speaking-questions p,
              .speaking-questions span,
              .speaking-questions div,
              .speaking-questions strong,
              .speaking-questions ul,
              .speaking-questions li {
                font-size: 16px !important;
              }
            `}</style>
            
            {/* Feedback Field */}
            {get(data, "feedback") && (
              <div className="space-y-3">
                <div className="text-sm font-semibold text-muted-foreground">
                  Feedback
                </div>
                <div className="p-4 bg-muted/50 rounded-lg border">
                  <p className="text-sm whitespace-pre-wrap">{get(data, "feedback")}</p>
                </div>
              </div>
            )}

            <div>
              <h2 className="text-lg font-semibold mb-4">Answer Review</h2>
              <div className="space-y-6">
                {get(data, "answers", [])?.map((answer: any, answerIndex: number) => (
                  <Card key={answer.id || answerIndex} className="border-2">
                    <CardContent className="p-6 space-y-6">
                      {/* Questions Section */}
                      <div className="space-y-4">
                        {answer?.questions?.map((part: any, partIndex: number) => (
                          <div key={partIndex} className="space-y-3">
                            <div className="flex items-center gap-2">
                              <Badge variant="secondary" className="text-sm font-bold px-3 py-1">
                                Part {part?.speaking_part}
                              </Badge>
                            </div>
                            <div className="space-y-1.5 pl-4 border-l-2 border-primary/20">
                              {part?.question?.map((item: any, questionIndex: number) => (
                                <div key={questionIndex} className="space-y-0.5">
                                  <div className="flex gap-1.5 items-start">
                                    <span className="font-semibold text-primary min-w-[18px] text-[16px] leading-tight">
                                      {item?.question_number}.
                                    </span>
                                    <div
                                      className="speaking-questions prose max-w-none text-[16px] leading-relaxed [&_p]:mb-0.5 [&_p]:leading-relaxed"
                                      dangerouslySetInnerHTML={{
                                        __html: item?.question,
                                      }}
                                    />
                                  </div>
                                </div>
                              ))}
                            </div>
                            {partIndex < (answer?.questions?.length || 0) - 1 && (
                              <Separator className="my-4" />
                            )}
                          </div>
                        ))}
                      </div>

                      <Separator />

                      {/* Answer Section */}
                      <div className="space-y-3">
                        <div className="text-sm font-semibold text-muted-foreground">
                          Your Answer
                        </div>
                        <div>
                          {answer.record ? (
                            <AudioPlayer
                              src={answer.record}
                              title="Your recorded answer"
                            />
                          ) : (
                            <div className="flex items-center justify-center p-8 border-2 border-dashed rounded-lg bg-muted/50">
                              <Badge variant="outline" className="bg-orange-50 border-orange-300 text-orange-700">
                                Not answered
                              </Badge>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Feedback Section */}
                      {answer.feedback && (
                        <FeedbackCollapsible feedback={answer.feedback} />
                      )}
                    </CardContent>
                  </Card>
                ))}
                {(!get(data, "answers", []) || get(data, "answers", []).length === 0) && (
                  <div className="text-center py-12 text-muted-foreground">
                    No answers available
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default StudentResultPage;
