import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getOneThematicMaterialSection } from "@/features/test-materials/api/test-material";
import BackButton from "@/shared/components/atoms/back-button/BackButton";
import ErrorMessage from "@/shared/components/atoms/error-message/ErrorMessage";
import LoadingSpinner from "@/shared/components/atoms/loading-spinner/LoadingSpinner";
import {
    RiBookOpenLine,
    RiHeadphoneLine,
    RiMic2Line,
    RiPencilLine,
} from "@remixicon/react";
import { useQuery } from "@tanstack/react-query";
import { get } from "lodash";
import { NavLink, useNavigate, useParams } from "react-router-dom";
import { getStudentOne, getStudentThematicResult } from "./api/student";

const StudentThematicResultPage = () => {
  const { student_id, material_id, skill } = useParams();

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
    data: result,
    isLoading: resultIsLoading,
    isError: resultIsError,
  } = useQuery({
    queryKey: ["test-material-thematic-result", student_id, material_id],
    queryFn: () => getStudentThematicResult(skill, student_id, material_id),
  });

  const type = get(result, "skill_type", "reading");

  const {
    data: material,
    isLoading: materialIsLoading,
    isError: materialIsError,
  } = useQuery({
    queryKey: ["test-material-thematic", material_id],
    queryFn: () => getOneThematicMaterialSection(skill, material_id),
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

  //   const reading = get(result, "skills.reading");
  //   const listening = get(result, "skills.listening");
  //   const speaking = get(result, "skills.speaking");
  //   const writing = get(result, "skills.writing");

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between gap-2">
        <div className="text-xl font-semibold">
          {get(result, "material_info.material_title")}
        </div>
        <div className="flex gap-2">
          <BackButton
            to={`/teacher/students/${student_id}/thematic`}
            label="Back to thematics"
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
          <CardTitle>{get(material, "skill_info.skill_title")}</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-2">
          <div className="flex gap-2">
            <div className="text-sm text-primary font-extrabold">
              Section title:
            </div>
            <div className="text-sm text-muted-foreground">
              {get(material, "test_info.test_title")}
            </div>
          </div>
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
                {get(material, "test_info.test_type", "N/A")}
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
      {type === "reading" && (
        <>
          <Card className="w-full">
            <CardHeader className="flex flex-row items-center gap-4">
              <CardTitle>{get(result, "title")}</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-2">
              <div className="flex gap-2">
                <div className="text-sm text-primary font-extrabold">
                  Total questions:
                </div>
                <div className="text-sm text-muted-foreground">
                  <Badge variant={"outline"}>
                    {get(result, "total_questions")}
                  </Badge>
                </div>
              </div>
              <div className="flex gap-2">
                <div className="text-sm text-primary font-extrabold">
                  Incorrect answers:
                </div>
                <div className="text-sm text-muted-foreground">
                  <Badge variant={"destructive"}>
                    {get(result, "incorrect_answers")}
                  </Badge>
                </div>
              </div>
              <div className="flex gap-2">
                <div className="text-sm text-primary font-extrabold">
                  Correct answers:
                </div>
                <div className="text-sm text-muted-foreground">
                  <Badge variant={"success"}>
                    {get(result, "correct_answers")}
                  </Badge>
                </div>
              </div>
              <div className="flex gap-2">
                <div className="text-sm text-primary font-extrabold">
                  Score percentage:
                </div>
                <div className="text-sm text-muted-foreground">
                  <Badge variant={"secondary"}>
                    {get(result, "score_percentage")}
                  </Badge>
                </div>
              </div>
              <div className="flex gap-2 mt-4 items-center">
                <div className="text-sm text-primary font-extrabold">
                  Answer review:
                </div>
                <NavLink
                  to={`/teacher/students/${student_id}/thematic/reading/${get(
                    result,
                    "material_info.reading_material_id"
                  )}/view`}
                  className={"text-blue-500"}
                >
                  View
                </NavLink>
              </div>
            </CardContent>
          </Card>
        </>
      )}
      {type === "listening" && (
        <>
          <Card className="w-full">
            <CardHeader className="flex flex-row items-center gap-4">
              <CardTitle>{get(result, "title")}</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-2">
              <div className="flex gap-2">
                <div className="text-sm text-primary font-extrabold">
                  Total questions:
                </div>
                <div className="text-sm text-muted-foreground">
                  <Badge variant={"outline"}>
                    {get(result, "total_questions")}
                  </Badge>
                </div>
              </div>
              <div className="flex gap-2">
                <div className="text-sm text-primary font-extrabold">
                  Incorrect answers:
                </div>
                <div className="text-sm text-muted-foreground">
                  <Badge variant={"destructive"}>
                    {get(result, "incorrect_answers")}
                  </Badge>
                </div>
              </div>
              <div className="flex gap-2">
                <div className="text-sm text-primary font-extrabold">
                  Correct answers:
                </div>
                <div className="text-sm text-muted-foreground">
                  <Badge variant={"success"}>
                    {get(result, "correct_answers")}
                  </Badge>
                </div>
              </div>
              <div className="flex gap-2">
                <div className="text-sm text-primary font-extrabold">
                  Score percentage:
                </div>
                <div className="text-sm text-muted-foreground">
                  <Badge variant={"secondary"}>
                    {get(result, "score_percentage")}
                  </Badge>
                </div>
              </div>
              <div className="flex gap-2 mt-4 items-center">
                <div className="text-sm text-primary font-extrabold">
                  Answer review:
                </div>
                <NavLink
                  to={`/teacher/students/${student_id}/thematic/listening/${get(
                    result,
                    "material_info.listening_material_id"
                  )}`}
                  className={"text-blue-500"}
                >
                  View
                </NavLink>
              </div>
            </CardContent>
          </Card>
        </>
      )}
      {type === "writing" && (
        <>
          <Card className="w-full">
            <CardHeader className="flex flex-row items-center gap-4">
              <CardTitle>{get(result, "title")}</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-2">
              <div className="flex gap-2">
                <div className="text-sm text-primary font-extrabold">
                  Writing (T1) score:
                </div>
                <div className="text-sm text-muted-foreground">
                  {get(result, "writing_task1.completed") ? (
                    <Badge variant={"outline"}>
                      {get(result, "writing_task1.score")}
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
                  {get(result, "writing_task2.completed") ? (
                    <Badge variant={"outline"}>
                      {get(result, "writing_task2.score")}
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
                  <Badge variant={"default"}>{get(result, "score")}</Badge>
                </div>
              </div>
              <div className="flex gap-2 mt-4 items-center">
                <div className="text-sm text-primary font-extrabold">
                  Answer review:
                </div>
                <NavLink
                  to={`/teacher/students/${student_id}/thematic/writing/${get(
                    result,
                    "material_info.writing_material_id"
                  )}/view`}
                  className={"text-blue-500"}
                >
                  View
                </NavLink>
              </div>
            </CardContent>
          </Card>
        </>
      )}
      {type === "speaking" && (
        <>
          <Card className="w-full">
            <CardHeader className="flex flex-row items-center gap-4">
              <CardTitle>{get(result, "title")}</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-2">
              <div className="flex gap-2">
                <div className="text-sm text-primary font-extrabold">
                  Total questions:
                </div>
                <div className="text-sm text-muted-foreground">
                  <Badge variant={"outline"}>
                    {get(result, "total_questions")}
                  </Badge>
                </div>
              </div>
              <div className="flex gap-2">
                <div className="text-sm text-primary font-extrabold">
                  Incorrect answers:
                </div>
                <div className="text-sm text-muted-foreground">
                  <Badge variant={"destructive"}>
                    {get(result, "incorrect_answers")}
                  </Badge>
                </div>
              </div>
              <div className="flex gap-2">
                <div className="text-sm text-primary font-extrabold">
                  Correct answers:
                </div>
                <div className="text-sm text-muted-foreground">
                  <Badge variant={"success"}>
                    {get(result, "correct_answers")}
                  </Badge>
                </div>
              </div>
              <div className="flex gap-2">
                <div className="text-sm text-primary font-extrabold">
                  Score percentage:
                </div>
                <div className="text-sm text-muted-foreground">
                  <Badge variant={"secondary"}>
                    {get(result, "score_percentage")}
                  </Badge>
                </div>
              </div>
              <div className="flex gap-2">
                <div className="text-sm text-primary font-extrabold">
                  Score:
                </div>
                <div className="text-sm text-muted-foreground">
                  <Badge variant={"default"}>{get(result, "score")}</Badge>
                </div>
              </div>
              <div className="flex gap-2 mt-4 items-center">
                <div className="text-sm text-primary font-extrabold">
                  Answer review:
                </div>
                <NavLink
                  to={`/teacher/students/${student_id}/thematic/speaking/${get(
                    result,
                    "material_info.speaking_material_id"
                  )}/view`}
                  className={"text-blue-500"}
                >
                  View
                </NavLink>
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
};

export default StudentThematicResultPage;
