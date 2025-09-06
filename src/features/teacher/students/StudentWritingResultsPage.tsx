import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import ErrorMessage from "@/shared/components/atoms/error-message/ErrorMessage";
import LoadingSpinner from "@/shared/components/atoms/loading-spinner/LoadingSpinner";
import { RiArticleLine, RiBookmark3Line } from "@remixicon/react";
import { useQuery } from "@tanstack/react-query";
import { useNavigate, useParams } from "react-router-dom";
import { getStudentOne } from "./api/student";
import StudentWritingMockResults from "./components/StudentWritingMockResults";
import StudentWritingThematicResults from "./components/StudentWritingThematicResults";

const StudentWritingResultsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const {
    data: student,
    isLoading: studentIsLoading,
    isError: studentIsError,
  } = useQuery({
    queryKey: ["students", id],
    queryFn: () => getStudentOne(id),
  });

  if (studentIsLoading) {
    return <LoadingSpinner />;
  }

  if (studentIsError)
    return (
      <ErrorMessage
        title="Failed to Load page"
        message="An error occurred while loading the page. Please try again later."
      />
    );

  return (
    <div className="space-y-8">
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
      <div className="space-y-6">
        <div className="text-xl font-semibold text-center">Wriring results</div>
        <Tabs defaultValue="mock" className="w-full">
          <TabsList className="w-full grid grid-cols-2">
            <TabsTrigger
              value="mock"
              className="flex items-center justify-center gap-2 text-sm font-medium transition-colors "
            >
              <RiArticleLine className="w-5 h-5" />
              Mock
            </TabsTrigger>
            <TabsTrigger
              value="thematic"
              className="flex items-center justify-center gap-2 text-sm font-medium transition-colors "
            >
              <RiBookmark3Line className="w-5 h-5" />
              Thematic
            </TabsTrigger>
          </TabsList>
          <TabsContent value="mock" className="mt-6">
            <StudentWritingMockResults />
          </TabsContent>
          <TabsContent value="thematic" className="mt-6">
            <StudentWritingThematicResults />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default StudentWritingResultsPage;
