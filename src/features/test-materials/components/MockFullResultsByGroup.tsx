import { DataTable } from "@/components/ui/data-table";
import { Input } from "@/components/ui/input";
import ErrorMessage from "@/shared/components/atoms/error-message/ErrorMessage";
import { useDebounce } from "@/shared/hooks/useDebounce";
import { buildFilterQuery } from "@/shared/utils/helper";
import { useQuery } from "@tanstack/react-query";
import { get } from "lodash";
import { useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import { getMockMaterialResults } from "../api/test-material";
import { useMockFullResultsColumns } from "../hooks/useMockFullResultsColumns";
import MockFullResultsPdf from "./MockFullResultsPdf";

const MockFullResultsByGroup = ({ testData }: { testData: any }) => {
  const { material_id, group_id } = useParams();

  const [page, setPage] = useState(1);
  const [searchInput, setSearchInput] = useState("");
  const debouncedSearch = useDebounce<string>(searchInput);

  const extraFilters = useMemo(
    () => ({
      material_id: material_id, // Hardcoded; replace with dynamic value if needed
      group_id: group_id, // Hardcoded; replace with dynamic value if needed
    }),
    [material_id, group_id] // Empty deps since these are static; add dependencies if dynamic
  );

  // Set extra filter query synchronously
  const extraFilterQuery = buildFilterQuery(extraFilters);

  const { data, isLoading, isError } = useQuery({
    queryKey: ["mock-full-results", page, debouncedSearch, extraFilterQuery],
    queryFn: () =>
      getMockMaterialResults(
        "full",
        page,
        debouncedSearch,
        "",
        extraFilterQuery
      ),
  });

  const columns = useMockFullResultsColumns();

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

  if (isError)
    return (
      <ErrorMessage
        title="Failed to Load page"
        message="An error occurred while loading the page. Please try again later."
      />
    );

  return (
    <div className="space-y-8">
      <div className="space-y-6">
        <div className="flex items-center justify-between gap-2">
          <div className="text-xl font-semibold">Full results</div>
          <div className="flex gap-4">
            <Input
              placeholder="Search ..."
              value={searchInput}
              onChange={(event) => setSearchInput(event.target.value)}
              className="max-w-sm w-64"
            />
            <MockFullResultsPdf
              group_id={group_id}
              material_id={material_id}
              testData={testData}
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
            // onRowClick={(row) => {
            //   navigate(`${row.id}`);
            // }}
          />
        </div>
      </div>
    </div>
  );
};

export default MockFullResultsByGroup;
