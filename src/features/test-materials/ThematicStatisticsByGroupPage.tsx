import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
import { useParams } from "react-router-dom";
import { getGroupOne } from "../teacher/groups/api/groups";
import { getOneThematicMaterial } from "./api/test-material";
import ThematicResultsByGroup from "./components/ThematicResultsByGroup";

const ThematicStatisticsByGroupPage = () => {
  const { group_id, material_id, skill } = useParams();

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
    queryKey: ["test-material-thematic", material_id],
    queryFn: () => getOneThematicMaterial(skill, material_id),
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
            to={`/teacher/tests/thematic/statistics/${material_id}`}
            label="Back to thematic groups"
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
          <CardTitle className="flex items-center gap-2 text-lg">
            <div>
              {get(material, "test_info.type") === "reading" ? (
                <RiBookOpenLine className="h-6 w-6" />
              ) : get(material, "test_info.type") === "listening" ? (
                <RiHeadphoneLine className="h-6 w-6" />
              ) : get(material, "test_info.type") === "writing" ? (
                <RiPencilLine className="h-6 w-6" />
              ) : (
                <RiMic2Line className="h-6 w-6" />
              )}
            </div>
            <div>{get(material, "test_info.test_title")}</div>
          </CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-2">
          <div className="flex gap-2">
            <div className="text-sm text-primary font-extrabold">
              Section title:
            </div>
            <div className="text-sm text-muted-foreground">
              {get(material, "material_info.title")}
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
                {get(material, "test_type", "N/A")}
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>
      <ThematicResultsByGroup type={get(material, "test_info.type")} material={material} />
    </div>
  );
};

export default ThematicStatisticsByGroupPage;
