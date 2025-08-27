import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import ErrorMessage from "@/shared/components/atoms/error-message/ErrorMessage";
import LoadingSpinner from "@/shared/components/atoms/loading-spinner/LoadingSpinner";
import { useQuery } from "@tanstack/react-query";
import { useNavigate, useParams } from "react-router-dom";
import { getStudentOne } from "./api/student";

const StudentDetailPage = () => {
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
      {/* {JSON.stringify(student)} */}
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
                variant={'default'}
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
        {/* <div className="flex items-center justify-between gap-2">
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
        </div> */}
      </div>
    </div>
  );
};

export default StudentDetailPage;
