import { DataTable } from "@/components/ui/data-table";
import { Input } from "@/components/ui/input";
import ErrorMessage from "@/shared/components/atoms/error-message/ErrorMessage";
import { useDebounce } from "@/shared/hooks/useDebounce";
import { useQuery } from "@tanstack/react-query";
import { get } from "lodash";
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { getStudentResults } from "../api/student";
import { useWritingAndSpeakingMockTestResultColumns } from "../hooks/useWritingAndSpeakingMockTestResultColumns";

export default function StudentWritingMockResults() {
  const { id } = useParams();
  const [page, setPage] = useState(1);
  const [searchInput, setSearchInput] = useState("");
  const debouncedSearch = useDebounce<string>(searchInput);

  const { data, isLoading, isError } = useQuery({
    queryKey: ["mock-writing", page, debouncedSearch],
    queryFn: () =>
      getStudentResults(id, "mock", "writing", page, debouncedSearch),
  });

  const columns = useWritingAndSpeakingMockTestResultColumns({
    type: "writing",
  });

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
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-2">
        <div className="text-xl font-semibold">Mock</div>
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
  );
}
