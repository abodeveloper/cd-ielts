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
import { useEffect, useMemo, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { getAllGroups } from "../groups/api/groups";
import { getStudentsData } from "./api/student";
import { useStudentColumns } from "./hooks/useStudentColumns";
import { Group } from "./types";

interface FilterForm {
  name: string;
  group_id?: string;
}

export default function StudentsPage() {
  const navigate = useNavigate();
  const [page, setPage] = useState(1);
  const [searchInput, setSearchInput] = useState("");
  const [filterQuery, setFilterQuery] = useState("");
  const debouncedSearch = useDebounce<string>(searchInput);

  const { control, handleSubmit, reset } = useForm<FilterForm>({
    defaultValues: {
      name: "",
      group_id: "all",
    },
  });

  // ✅ Groups data (fetch faqat kerak bo‘lganda)
  const {
    data: groups,
    refetch: refetchGroups,
    isFetching: isGroupsLoading,
  } = useQuery({
    queryKey: ["groups"],
    queryFn: () => getAllGroups(),
    enabled: false, // ❌ avtomatik emas
  });

  const [fetchedOnce, setFetchedOnce] = useState(false);

  // Define extra filters (group_id and status) with useMemo for stability
  const extraFilters = useMemo(
    () => ({
      // group_id: 1, // Hardcoded; replace with dynamic value if needed
    }),
    [] // Empty deps since these are static; add dependencies if dynamic
  );

  // Set extra filter query synchronously
  const extraFilterQuery = buildFilterQuery(extraFilters);

  const { data, isLoading, isError } = useQuery({
    queryKey: [
      "students",
      page,
      debouncedSearch,
      filterQuery,
      extraFilterQuery,
    ],
    queryFn: () =>
      getStudentsData(page, debouncedSearch, filterQuery, extraFilterQuery),
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
  }, [debouncedSearch, filterQuery]);

  if (isError)
    return (
      <ErrorMessage
        title="Failed to Load page"
        message="An error occurred while loading the page. Please try again later."
      />
    );

  const onSubmit = (data: FilterForm) => {
    const filters = { ...data };

    if (filters.group_id === "all") {
      delete filters.group_id;
    }

    setFilterQuery(buildFilterQuery(filters));
  };

  const handleReset = () => {
    reset();
    setFilterQuery("");
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-2">
        <div className="text-xl font-semibold">Students</div>
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
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* ✅ grid layout */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Controller
              name="name"
              control={control}
              render={({ field }) => (
                <Input placeholder="Filter by name" {...field} />
              )}
            />

            <Controller
              name="group_id"
              control={control}
              render={({ field }) => (
                <Select
                  onValueChange={field.onChange}
                  value={field.value}
                  onOpenChange={(open) => {
                    if (open && !fetchedOnce) {
                      refetchGroups();
                      setFetchedOnce(true);
                    }
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Filter by group" />
                  </SelectTrigger>
                  <SelectContent searchable>
                    <SelectItem value="all">All Groups</SelectItem>
                    {isGroupsLoading && (
                      <SelectItem value="loading" disabled>
                        Loading...
                      </SelectItem>
                    )}
                    {groups?.map((group: Group) => (
                      <SelectItem key={group.id} value={group.id.toString()}>
                        {group.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />

            <div className="flex gap-2">
              <Button type="submit">Filter</Button>
              <Button type="button" variant="outline" onClick={handleReset}>
                Reset
              </Button>
            </div>
          </div>
        </form>
        <DataTable
          data={students}
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
  );
}
