import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/ui/data-table";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import ErrorMessage from "@/shared/components/atoms/error-message/ErrorMessage";
import { useDebounce } from "@/shared/hooks/useDebounce";
import { buildFilterQuery } from "@/shared/utils/helper";
import { useQuery } from "@tanstack/react-query";
import { get } from "lodash";
import { useEffect, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { useNavigate, useParams } from "react-router-dom";
import { getStudentReadingMockResults } from "../api/student";
import { useGroupColumns } from "../../groups/hooks/useGroupColumns";

interface FilterForm {
  status?: string;
}

export default function StudentReadingMockResults() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [page, setPage] = useState(1);
  const [searchInput, setSearchInput] = useState("");
  const [filterQuery, setFilterQuery] = useState("");
  const debouncedSearch = useDebounce<string>(searchInput);

  const { control, handleSubmit, reset } = useForm<FilterForm>({
    defaultValues: {
      status: "active",
    },
  });

  const { data, isLoading, isError } = useQuery({
    queryKey: ["StudentReadingMockResults", page, debouncedSearch, filterQuery],
    queryFn: () =>
      getStudentReadingMockResults(id, page, debouncedSearch, filterQuery),
  });

  const columns = useGroupColumns();

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
  }, [debouncedSearch, filterQuery]);

  if (isError)
    return (
      <ErrorMessage
        title="Failed to Load page"
        message="An error occurred while loading the page. Please try again later."
      />
    );

  const onSubmit = (data: FilterForm) => {
    setFilterQuery(buildFilterQuery(data));
  };

  const handleReset = () => {
    reset();
    setFilterQuery("");
  };

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
  );
}
