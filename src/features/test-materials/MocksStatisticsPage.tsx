import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DataTable } from "@/components/ui/data-table";
import { Input } from "@/components/ui/input";
import BackButton from "@/shared/components/atoms/back-button/BackButton";
import ErrorMessage from "@/shared/components/atoms/error-message/ErrorMessage";
import LoadingSpinner from "@/shared/components/atoms/loading-spinner/LoadingSpinner";
import { useDebounce } from "@/shared/hooks/useDebounce";
import { buildFilterQuery } from "@/shared/utils/helper";
import {
  RiBookOpenLine,
  RiHeadphoneLine,
  RiMic2Line,
  RiPencilLine,
} from "@remixicon/react";
import { useQuery } from "@tanstack/react-query";
import { get } from "lodash";
import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { getMockMaterialGroups, getOneMockMaterial } from "./api/test-material";
import { useMockStatisticGroupColumns } from "./hooks/useMockStatisticGroupColumsn";

const MocksStatisticsPage = () => {
  const { material_id } = useParams();
  const navigate = useNavigate();

  const {
    data: material,
    isLoading: materialIsLoading,
    isError: materialIsError,
  } = useQuery({
    queryKey: ["test-material-mock", material_id],
    queryFn: () => getOneMockMaterial(material_id),
  });

  const [page, setPage] = useState(1);
  const [searchInput, setSearchInput] = useState("");
  const debouncedSearch = useDebounce<string>(searchInput);

  const extraFilters = useMemo(
    () => ({
      material_id: material_id, // Hardcoded; replace with dynamic value if needed
    }),
    [material_id] // Empty deps since these are static; add dependencies if dynamic
  );

  // Set extra filter query synchronously
  const extraFilterQuery = buildFilterQuery(extraFilters);

  const { data, isLoading } = useQuery({
    queryKey: [
      "mock-statistic-groups",
      page,
      debouncedSearch,
      extraFilterQuery,
    ],
    queryFn: () =>
      getMockMaterialGroups(page, debouncedSearch, "", extraFilterQuery),
  });

  const columns = useMockStatisticGroupColumns();

  // Data and pagination info
  const groups = get(data, "results", []);
  const paginationInfo = {
    totalCount: get(data, "count", 0),
    totalPages: get(data, "total_pages", 1),
    currentPage: page,
  };

  // Reset page to 1 when search term or form filters change
  useEffect(() => {
    setPage(1);
  }, [debouncedSearch]);

  if (materialIsLoading) {
    return <LoadingSpinner />;
  }

  if (materialIsError)
    return (
      <ErrorMessage
        title="Failed to Load page"
        message="An error occurred while loading the page. Please try again later."
      />
    );

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between gap-2">
        <div className="text-xl font-semibold">{get(material, "title")}</div>
        <div className="flex gap-2">
          <BackButton to={"/teacher/tests/mock"} label="Back to mocks" />
        </div>
      </div>
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
      <div className="space-y-6">
        <div className="flex items-center justify-between gap-2">
          <div className="text-xl font-semibold">Mock Groups</div>
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
            data={groups}
            columns={columns}
            pagination={true}
            totalCount={paginationInfo.totalCount}
            totalPages={paginationInfo.totalPages}
            currentPage={paginationInfo.currentPage}
            onPageChange={setPage}
            isLoading={isLoading}
            // onRowClick={(row) => {
            //   navigate(`${row.id}`);
            // }}
          />
        </div>
      </div>
    </div>
  );
};

export default MocksStatisticsPage;
