import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import { useNavigate, useParams } from "react-router-dom";
import { getGroupOne } from "./api/groups";
import LoadingSpinner from "@/shared/components/atoms/loading-spinner/LoadingSpinner";
import ErrorMessage from "@/shared/components/atoms/error-message/ErrorMessage";
import { useEffect, useMemo, useState } from "react";
import { useDebounce } from "@/shared/hooks/useDebounce";
import { buildFilterQuery } from "@/shared/utils/helper";
import { getStudentsData } from "../students/api/student";
import { useStudentColumns } from "../students/hooks/useStudentColumns";
import { get } from "lodash";
import { Input } from "@/components/ui/input";
import { DataTable } from "@/components/ui/data-table";

const GroupDetailPage = () => {
  const { id } = useParams();

  const {
    data: group,
    isLoading: groupIsLoading,
    isError: groupIsError,
  } = useQuery({
    queryKey: ["groups", id],
    queryFn: () => getGroupOne(id),
  });

  const navigate = useNavigate();
  const [page, setPage] = useState(1);
  const [searchInput, setSearchInput] = useState("");
  const debouncedSearch = useDebounce<string>(searchInput);

  const extraFilters = useMemo(
    () => ({
      group_id: id, // Hardcoded; replace with dynamic value if needed
    }),
    [id] // Empty deps since these are static; add dependencies if dynamic
  );

  // Set extra filter query synchronously
  const extraFilterQuery = buildFilterQuery(extraFilters);

  const { data, isLoading } = useQuery({
    queryKey: ["students", page, debouncedSearch, extraFilterQuery],
    queryFn: () => getStudentsData(page, debouncedSearch, "", extraFilterQuery),
  });

  const columns = useStudentColumns();

  // Data and pagination info
  const students = get(data, "results", []);
  const paginationInfo = {
    totalCount: get(data, "count", 0),
    totalPages: get(data, "total_pages", 1),
    currentPage: page,
  };

  // Reset page to 1 when search term or form filters change
  useEffect(() => {
    setPage(1);
  }, [debouncedSearch]);

  if (groupIsLoading) {
    return <LoadingSpinner />;
  }

  if (groupIsError)
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
      <div className="space-y-6">
        <div className="flex items-center justify-between gap-2">
          <div className="text-xl font-semibold">Group students</div>
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
            data={students}
            columns={columns}
            pagination={true}
            totalCount={paginationInfo.totalCount}
            totalPages={paginationInfo.totalPages}
            currentPage={paginationInfo.currentPage}
            onPageChange={setPage}
            isLoading={isLoading}
            onRowClick={(row) => {
              navigate(`${row.id}`);
            }}
          />
        </div>
      </div>
    </div>
  );
};

export default GroupDetailPage;
