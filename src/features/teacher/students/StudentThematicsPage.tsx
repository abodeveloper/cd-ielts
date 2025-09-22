import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DataTable } from "@/components/ui/data-table";
import { Input } from "@/components/ui/input";
import BackButton from "@/shared/components/atoms/back-button/BackButton";
import ErrorMessage from "@/shared/components/atoms/error-message/ErrorMessage";
import LoadingSpinner from "@/shared/components/atoms/loading-spinner/LoadingSpinner";
import { useDebounce } from "@/shared/hooks/useDebounce";
import { useQuery } from "@tanstack/react-query";
import { get } from "lodash";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { getStudentOne, getStudentThematics } from "./api/student";
import { useStudentThematicsColumns } from "./hooks/useStudentThematicColumns";

export default function StudentThematicsPage() {
  const { student_id } = useParams();
  const navigate = useNavigate();

  const {
    data: student,
    isLoading: studentIsLoading,
    isError: studentIsError,
  } = useQuery({
    queryKey: ["students", student_id],
    queryFn: () => getStudentOne(student_id),
  });

  const [page, setPage] = useState(1);
  const [searchInput, setSearchInput] = useState("");
  const debouncedSearch = useDebounce<string>(searchInput);

  const { data, isLoading } = useQuery({
    queryKey: ["student-thematics", page, debouncedSearch],
    queryFn: () => getStudentThematics(student_id, page, debouncedSearch),
  });

  const columns = useStudentThematicsColumns();

  // Data and pagination info
  const results = get(data, "results", []);
  const paginationInfo = {
    totalCount: get(data, "count", 0),
    totalPages: get(data, "total_pages", 1),
    currentPage: page,
  };

  // Reset page to 1 when search term or form filters change
  useEffect(() => {
    setPage(1);
  }, [debouncedSearch]);

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
      <div className="flex items-center justify-between gap-2">
        <div className="text-xl font-semibold">{get(student, "full_name")}</div>
        <div className="flex gap-2">
          <BackButton to={`/teacher/students`} label="Back to students" />
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
      <div className="space-y-6">
        <div className="flex items-center justify-between gap-2">
          <div className="text-xl font-semibold">Student thematics</div>
          <div className="flex gap-2">
            <Input
              placeholder="Search ..."
              value={searchInput}
              onChange={(event) => setSearchInput(event.target.value)}
              className="max-w-sm w-64"
            />
          </div>
        </div>
        <div className="space-y-4">
          <DataTable
            data={results}
            columns={columns}
            pagination={true}
            totalCount={paginationInfo.totalCount}
            totalPages={paginationInfo.totalPages}
            currentPage={paginationInfo.currentPage}
            onPageChange={setPage}
            isLoading={isLoading}
          />
        </div>
      </div>
    </div>
  );
}
