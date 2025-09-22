import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
import { useParams } from "react-router-dom";
import { getGroupOne } from "../teacher/groups/api/groups";
import { getOneMockMaterial } from "./api/test-material";
import MockFullResultsByGroup from "./components/MockFullResultsByGroup";
import MockListeningResultsByGroup from "./components/MockListeningResultsByGroup";
import MockReadingResultsByGroup from "./components/MockReadingResultsByGroup";
import MockWritingResultsByGroup from "./components/MockWritingResultsByGroup";
import MockSpeakingResultsByGroup from "./components/MockSpeakingResultsByGroup";

const MockStatisticsByGroupPage = () => {
  const { group_id, material_id } = useParams();

  const {
    data: group,
    isLoading: groupIsLoading,
    isError: groupIsError,
  } = useQuery({
    queryKey: ["groups", group_id],
    queryFn: () => getGroupOne(group_id),
  });

  const {
    data: material,
    isLoading: materialIsLoading,
    isError: materialIsError,
  } = useQuery({
    queryKey: ["test-material-mock", material_id],
    queryFn: () => getOneMockMaterial(material_id),
  });

  if (groupIsLoading || materialIsLoading) {
    return <LoadingSpinner />;
  }

  if (groupIsError || materialIsError)
    return (
      <ErrorMessage
        title="Failed to Load page"
        message="An error occurred while loading the page. Please try again later."
      />
    );

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between gap-2">
        <div className="text-xl font-semibold">{get(group, "name")}</div>
        <div className="flex gap-2">
          <BackButton
            to={`/teacher/tests/mock/statistics/${material_id}`}
            label="Back to mock groups"
          />
        </div>
      </div>
      <Card className="w-full">
        <CardHeader className="flex flex-row items-center gap-4">
          <CardTitle>{group?.name}</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-2">
          <div className="flex gap-2">
            <div className="text-sm text-primary font-extrabold">
              Number of students
            </div>
            <div className="text-sm text-muted-foreground">
              {group?.students_count}
            </div>
          </div>
          <div className="flex gap-2">
            <div className="text-sm text-primary font-extrabold">Status:</div>
            {group?.is_active === true ? (
              <Badge variant="success">Active</Badge>
            ) : (
              <Badge variant="destructive">Inactive</Badge>
            )}
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
          <MockReadingResultsByGroup />
        </TabsContent>
        <TabsContent value="listening" className="mt-6">
          <MockListeningResultsByGroup />
        </TabsContent>
        <TabsContent value="writing" className="mt-6">
          <MockWritingResultsByGroup />
        </TabsContent>
        <TabsContent value="speaking" className="mt-6">
          <MockSpeakingResultsByGroup />
        </TabsContent>
        <TabsContent value="full" className="mt-6">
          <MockFullResultsByGroup testData={material} />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default MockStatisticsByGroupPage;
