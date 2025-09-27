import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { getOneMockMaterial } from "@/features/test-materials/api/test-material";
import BackButton from "@/shared/components/atoms/back-button/BackButton";
import ErrorMessage from "@/shared/components/atoms/error-message/ErrorMessage";
import LoadingSpinner from "@/shared/components/atoms/loading-spinner/LoadingSpinner";
import {
  RiBookOpenLine,
  RiHeadphoneLine,
  RiLayout2Line,
  RiMic2Line,
  RiPencilLine,
} from "@remixicon/react";
import { useQuery } from "@tanstack/react-query";
import { get } from "lodash";
import { NavLink, useNavigate, useParams } from "react-router-dom";
import { getStudentMockResult, getStudentOne } from "./api/student";

const StudentMockResultPage = () => {
  const { student_id, material_id } = useParams();

  const navigate = useNavigate();

  const {
    data: student,
    isLoading: studentIsLoading,
    isError: studentIsError,
  } = useQuery({
    queryKey: ["students", student_id],
    queryFn: () => getStudentOne(student_id),
  });

  const {
    data: material,
    isLoading: materialIsLoading,
    isError: materialIsError,
  } = useQuery({
    queryKey: ["test-material-mock", material_id],
    queryFn: () => getOneMockMaterial(material_id),
  });

  const {
    data: result,
    isLoading: resultIsLoading,
    isError: resultIsError,
  } = useQuery({
    queryKey: ["test-material-mock-result", student_id, material_id],
    queryFn: () => getStudentMockResult(student_id, material_id),
  });

  if (resultIsLoading || studentIsLoading || materialIsLoading) {
    return <LoadingSpinner />;
  }

  if (resultIsError || studentIsError || materialIsError)
    return (
      <ErrorMessage
        title="Failed to Load page"
        message="An error occurred while loading the page. Please try again later."
      />
    );

  const reading = get(result, "skills.reading");
  const listening = get(result, "skills.listening");
  const speaking = get(result, "skills.speaking");
  const writing = get(result, "skills.writing");

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between gap-2">
        <div className="text-xl font-semibold">
          {get(result, "material_info.material_title")}
        </div>
        <div className="flex gap-2">
          <BackButton
            to={`/teacher/students/${student_id}/mock`}
            label="Back to mocks"
          />
        </div>
      </div>
      <Card className="w-full">
        <CardHeader className="flex flex-row items-center gap-4">
          <CardTitle>{student?.full_name}</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-2">
          <div className="flex gap-2">
            <div className="text-sm text-primary font-extrabold">Username:</div>
            <div className="text-sm text-muted-foreground">
              {student?.username}
            </div>
          </div>
          <div className="flex gap-2">
            <div className="text-sm text-primary font-extrabold">Group:</div>
            <div className="text-sm text-muted-foreground">
              <Badge
                onClick={() =>
                  navigate(`/teacher/groups/${student?.group?.id}`)
                }
                className="cursor-pointer"
                variant={"default"}
              >
                {student?.group?.name}
              </Badge>
            </div>
          </div>
          <div className="flex gap-2">
            <div className="text-sm text-primary font-extrabold">
              Phone number:
            </div>
            <div className="text-sm text-muted-foreground">
              {student?.phone}
            </div>
          </div>
        </CardContent>
      </Card>
      <Card className="w-full">
        <CardHeader className="flex flex-row items-center gap-4">
          <CardTitle>{get(material, "test_info.test_title")}</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-2">
          <div className="flex gap-2">
            <div className="text-sm text-primary font-extrabold">
              Material title:
            </div>
            <div className="text-sm text-muted-foreground">
              {get(material, "title")}
            </div>
          </div>
          <div className="flex gap-2">
            <div className="text-sm text-primary font-extrabold">
              Test type:
            </div>
            <div className="text-sm text-muted-foreground">
              <Badge variant={"default"}>
                {get(material, "test_type", "N/A")}
              </Badge>
            </div>
          </div>
          <div className="space-y-2 mt-4">
            {get(material, "materials", [])?.map((section: any) => (
              <div key={section.id} className="mb-2">
                <Badge variant={"outline"} className="inline-flex gap-2 p-1">
                  {section.type === "reading" ? (
                    <RiBookOpenLine className="h-6 w-6" />
                  ) : section.type === "listening" ? (
                    <RiHeadphoneLine className="h-6 w-6" />
                  ) : section.type === "writing" ? (
                    <RiPencilLine className="h-6 w-6" />
                  ) : (
                    <RiMic2Line className="h-6 w-6" />
                  )}
                  {get(section, "title", "N/A")}
                </Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
      <Tabs defaultValue="reading" className="w-full">
        <TabsList className="w-full grid grid-cols-5">
          <TabsTrigger
            value="reading"
            className="flex items-center justify-center gap-2 text-sm font-medium transition-colors "
          >
            <RiBookOpenLine className="w-5 h-5" />
            Reading
          </TabsTrigger>
          <TabsTrigger
            value="listening"
            className="flex items-center justify-center gap-2 text-sm font-medium transition-colors "
          >
            <RiHeadphoneLine className="w-5 h-5" />
            Listening
          </TabsTrigger>
          <TabsTrigger
            value="writing"
            className="flex items-center justify-center gap-2 text-sm font-medium transition-colors "
          >
            <RiPencilLine className="w-5 h-5" />
            Writing
          </TabsTrigger>
          <TabsTrigger
            value="speaking"
            className="flex items-center justify-center gap-2 text-sm font-medium transition-colors "
          >
            <RiMic2Line className="w-5 h-5" />
            Speaking
          </TabsTrigger>
          <TabsTrigger
            value="full"
            className="flex items-center justify-center gap-2 text-sm font-medium transition-colors "
          >
            <RiLayout2Line className="w-5 h-5" />
            Full
          </TabsTrigger>
        </TabsList>
        <TabsContent value="reading" className="mt-6">
          <Card className="w-full">
            <CardHeader className="flex flex-row items-center gap-4">
              <CardTitle>{get(reading, "title")}</CardTitle>
            </CardHeader>
            {get(reading, "reading_complete") ? (
              <CardContent className="flex flex-col gap-2">
                <div className="flex gap-2">
                  <div className="text-sm text-primary font-extrabold">
                    Total questions:
                  </div>
                  <div className="text-sm text-muted-foreground">
                    <Badge variant={"outline"}>
                      {get(reading, "total_questions")}
                    </Badge>
                  </div>
                </div>
                <div className="flex gap-2">
                  <div className="text-sm text-primary font-extrabold">
                    Incorrect answers:
                  </div>
                  <div className="text-sm text-muted-foreground">
                    <Badge variant={"destructive"}>
                      {get(reading, "incorrect_answers")}
                    </Badge>
                  </div>
                </div>
                <div className="flex gap-2">
                  <div className="text-sm text-primary font-extrabold">
                    Correct answers:
                  </div>
                  <div className="text-sm text-muted-foreground">
                    <Badge variant={"success"}>
                      {get(reading, "correct_answers")}
                    </Badge>
                  </div>
                </div>
                <div className="flex gap-2">
                  <div className="text-sm text-primary font-extrabold">
                    Score percentage:
                  </div>
                  <div className="text-sm text-muted-foreground">
                    <Badge variant={"secondary"}>
                      {get(reading, "score_percentage")}
                    </Badge>
                  </div>
                </div>
                <div className="flex gap-2">
                  <div className="text-sm text-primary font-extrabold">
                    Score:
                  </div>
                  <div className="text-sm text-muted-foreground">
                    <Badge variant={"default"}>{get(reading, "score")}</Badge>
                  </div>
                </div>
                <div className="flex gap-2 mt-4 items-center">
                  <div className="text-sm text-primary font-extrabold">
                    Answer review:
                  </div>
                  <NavLink
                    to={`/teacher/students/${student_id}/mock/reading/${get(
                      reading,
                      "id"
                    )}/view`}
                    className={"text-blue-500"}
                  >
                    View
                  </NavLink>
                </div>
              </CardContent>
            ) : (
              <>
                <CardContent className="flex flex-col gap-2">
                  <div className="text-sm text-muted-foreground">
                    <Badge variant={"destructive"}>Not completed</Badge>
                  </div>
                </CardContent>
              </>
            )}
          </Card>
        </TabsContent>
        <TabsContent value="listening" className="mt-6">
          <Card className="w-full">
            <CardHeader className="flex flex-row items-center gap-4">
              <CardTitle>{get(listening, "title")}</CardTitle>
            </CardHeader>
            {get(listening, "listening_complete") ? (
              <CardContent className="flex flex-col gap-2">
                <div className="flex gap-2">
                  <div className="text-sm text-primary font-extrabold">
                    Total questions:
                  </div>
                  <div className="text-sm text-muted-foreground">
                    <Badge variant={"outline"}>
                      {get(listening, "total_questions")}
                    </Badge>
                  </div>
                </div>
                <div className="flex gap-2">
                  <div className="text-sm text-primary font-extrabold">
                    Incorrect answers:
                  </div>
                  <div className="text-sm text-muted-foreground">
                    <Badge variant={"destructive"}>
                      {get(listening, "incorrect_answers")}
                    </Badge>
                  </div>
                </div>
                <div className="flex gap-2">
                  <div className="text-sm text-primary font-extrabold">
                    Correct answers:
                  </div>
                  <div className="text-sm text-muted-foreground">
                    <Badge variant={"success"}>
                      {get(listening, "correct_answers")}
                    </Badge>
                  </div>
                </div>
                <div className="flex gap-2">
                  <div className="text-sm text-primary font-extrabold">
                    Score percentage:
                  </div>
                  <div className="text-sm text-muted-foreground">
                    <Badge variant={"secondary"}>
                      {get(listening, "score_percentage")}
                    </Badge>
                  </div>
                </div>
                <div className="flex gap-2">
                  <div className="text-sm text-primary font-extrabold">
                    Score:
                  </div>
                  <div className="text-sm text-muted-foreground">
                    <Badge variant={"default"}>{get(listening, "score")}</Badge>
                  </div>
                </div>
                <div className="flex gap-2 mt-4 items-center">
                  <div className="text-sm text-primary font-extrabold">
                    Answer review:
                  </div>
                  <NavLink
                    to={`/teacher/students/${student_id}/mock/listening/${get(
                      listening,
                      "id"
                    )}/view`}
                    className={"text-blue-500"}
                  >
                    View
                  </NavLink>
                </div>
              </CardContent>
            ) : (
              <>
                <CardContent className="flex flex-col gap-2">
                  <div className="text-sm text-muted-foreground">
                    <Badge variant={"destructive"}>Not completed</Badge>
                  </div>
                </CardContent>
              </>
            )}
          </Card>
        </TabsContent>
        <TabsContent value="writing" className="mt-6">
          <Card className="w-full">
            <CardHeader className="flex flex-row items-center gap-4">
              <CardTitle>{get(writing, "title")}</CardTitle>
            </CardHeader>
            {get(writing, "writing_complete") ? (
              <CardContent className="flex flex-col gap-2">
                <div className="flex gap-2">
                  <div className="text-sm text-primary font-extrabold">
                    Writing (T1) score:
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {get(writing, "writing_task1.completed") ? (
                      <Badge variant={"outline"}>
                        {get(writing, "writing_task1.score")}
                      </Badge>
                    ) : (
                      <Badge variant={"destructive"}>Not completed</Badge>
                    )}
                  </div>
                </div>
                <div className="flex gap-2">
                  <div className="text-sm text-primary font-extrabold">
                    Writing (T2) score:
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {get(writing, "writing_task2.completed") ? (
                      <Badge variant={"outline"}>
                        {get(writing, "writing_task2.score")}
                      </Badge>
                    ) : (
                      <Badge variant={"destructive"}>Not completed</Badge>
                    )}
                  </div>
                </div>
                <div className="flex gap-2">
                  <div className="text-sm text-primary font-extrabold">
                    Score:
                  </div>
                  <div className="text-sm text-muted-foreground">
                    <Badge variant={"default"}>{get(writing, "score")}</Badge>
                  </div>
                </div>
                <div className="flex gap-2 mt-4 items-center">
                  <div className="text-sm text-primary font-extrabold">
                    Answer review:
                  </div>
                  <NavLink
                    to={`/teacher/students/${student_id}/mock/writing/${get(
                      writing,
                      "id"
                    )}/view`}
                    className={"text-blue-500"}
                  >
                    View
                  </NavLink>
                </div>
              </CardContent>
            ) : (
              <>
                <CardContent className="flex flex-col gap-2">
                  <div className="text-sm text-muted-foreground">
                    <Badge variant={"destructive"}>Not completed</Badge>
                  </div>
                </CardContent>
              </>
            )}
          </Card>
        </TabsContent>
        <TabsContent value="speaking" className="mt-6">
          <Card className="w-full">
            <CardHeader className="flex flex-row items-center gap-4">
              <CardTitle>{get(speaking, "title")}</CardTitle>
            </CardHeader>
            {get(speaking, "speaking_complete") ? (
              <CardContent className="flex flex-col gap-2">
                <div className="flex gap-2">
                  <div className="text-sm text-primary font-extrabold">
                    Total questions:
                  </div>
                  <div className="text-sm text-muted-foreground">
                    <Badge variant={"outline"}>
                      {get(speaking, "total_questions")}
                    </Badge>
                  </div>
                </div>
                <div className="flex gap-2">
                  <div className="text-sm text-primary font-extrabold">
                    Incorrect answers:
                  </div>
                  <div className="text-sm text-muted-foreground">
                    <Badge variant={"destructive"}>
                      {get(speaking, "incorrect_answers")}
                    </Badge>
                  </div>
                </div>
                <div className="flex gap-2">
                  <div className="text-sm text-primary font-extrabold">
                    Correct answers:
                  </div>
                  <div className="text-sm text-muted-foreground">
                    <Badge variant={"success"}>
                      {get(speaking, "correct_answers")}
                    </Badge>
                  </div>
                </div>
                <div className="flex gap-2">
                  <div className="text-sm text-primary font-extrabold">
                    Score percentage:
                  </div>
                  <div className="text-sm text-muted-foreground">
                    <Badge variant={"secondary"}>
                      {get(speaking, "score_percentage")}
                    </Badge>
                  </div>
                </div>
                <div className="flex gap-2">
                  <div className="text-sm text-primary font-extrabold">
                    Score:
                  </div>
                  <div className="text-sm text-muted-foreground">
                    <Badge variant={"default"}>{get(speaking, "score")}</Badge>
                  </div>
                </div>
                <div className="flex gap-2 mt-4 items-center">
                  <div className="text-sm text-primary font-extrabold">
                    Answer review:
                  </div>
                  <NavLink
                    to={`/teacher/students/${student_id}/mock/speaking/${get(
                      speaking,
                      "id"
                    )}/view`}
                    className={"text-blue-500"}
                  >
                    View
                  </NavLink>
                </div>
              </CardContent>
            ) : (
              <>
                <CardContent className="flex flex-col gap-2">
                  <div className="text-sm text-muted-foreground">
                    <Badge variant={"destructive"}>Not completed</Badge>
                  </div>
                </CardContent>
              </>
            )}
          </Card>
        </TabsContent>
        <TabsContent value="full" className="mt-6">
          <Card className="w-full">
            <CardHeader className="flex flex-row items-center gap-4">
              <CardTitle>Full result</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-2">
              <div className="flex gap-2">
                <div className="text-sm text-primary font-extrabold">
                  Listening score:
                </div>
                <div className="text-sm text-muted-foreground">
                  {get(listening, "listening_complete") ? (
                    <Badge variant={"outline"}>{get(listening, "score")}</Badge>
                  ) : (
                    <Badge variant={"destructive"}>Not completed</Badge>
                  )}
                </div>
              </div>
              <div className="flex gap-2">
                <div className="text-sm text-primary font-extrabold">
                  Reading score:
                </div>
                <div className="text-sm text-muted-foreground">
                  {get(reading, "reading_complete") ? (
                    <Badge variant={"outline"}>{get(reading, "score")}</Badge>
                  ) : (
                    <Badge variant={"destructive"}>Not completed</Badge>
                  )}
                </div>
              </div>
              <div className="flex gap-2">
                <div className="text-sm text-primary font-extrabold">
                  Writing (T1) score:
                </div>
                <div className="text-sm text-muted-foreground">
                  {get(writing, "writing_task1.completed") ? (
                    <Badge variant={"outline"}>
                      {get(writing, "writing_task1.score")}
                    </Badge>
                  ) : (
                    <Badge variant={"destructive"}>Not completed</Badge>
                  )}
                </div>
              </div>
              <div className="flex gap-2">
                <div className="text-sm text-primary font-extrabold">
                  Writing (T2) score:
                </div>
                <div className="text-sm text-muted-foreground">
                  {get(writing, "writing_task2.completed") ? (
                    <Badge variant={"outline"}>
                      {get(writing, "writing_task2.score")}
                    </Badge>
                  ) : (
                    <Badge variant={"destructive"}>Not completed</Badge>
                  )}
                </div>
              </div>
              <div className="flex gap-2">
                <div className="text-sm text-primary font-extrabold">
                  Writing score:
                </div>
                <div className="text-sm text-muted-foreground">
                  {get(writing, "writing_complete") ? (
                    <Badge variant={"outline"}>{get(writing, "score")}</Badge>
                  ) : (
                    <Badge variant={"destructive"}>Not completed</Badge>
                  )}
                </div>
              </div>
              <div className="flex gap-2">
                <div className="text-sm text-primary font-extrabold">
                  Speaking score:
                </div>
                <div className="text-sm text-muted-foreground">
                  {get(speaking, "speaking_complete") ? (
                    <Badge variant={"outline"}>{get(speaking, "score")}</Badge>
                  ) : (
                    <Badge variant={"destructive"}>Not completed</Badge>
                  )}
                </div>
              </div>
              <div className="flex gap-2 mt-4">
                <div className="text-sm text-primary font-extrabold">
                  Total score:
                </div>
                <div className="text-sm text-muted-foreground">
                  <Badge variant={"default"}>
                    {get(result, "material_info.total_overall_score")}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default StudentMockResultPage;
