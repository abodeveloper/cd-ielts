import { Button } from "@/components/ui/button";
import { Card, CardContent, CardTitle } from "@/components/ui/card";
import { CardList } from "@/components/ui/card-list";
import { Input } from "@/components/ui/input";
import ErrorMessage from "@/shared/components/atoms/error-message/ErrorMessage";
import { useDebounce } from "@/shared/hooks/useDebounce";
import { buildFilterQuery } from "@/shared/utils/helper";
import {
  RiBookOpenLine,
  RiHeadphoneLine,
  RiPencilLine,
  RiMic2Line,
} from "@remixicon/react";
import { useQuery } from "@tanstack/react-query";
import { get } from "lodash";
import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getTestMaterialsData } from "../api/test-material";
import { TestMaterial } from "../types";

export default function MockDetailPage() {
  const navigate = useNavigate();
  const [page, setPage] = useState(1);
  const [searchInput, setSearchInput] = useState("");
  const debouncedSearch = useDebounce<string>(searchInput);

  // Define extra filters (group_id and status) with useMemo for stability
  const extraFilters = useMemo(
    () => ({
      // test_type: "Mock",
    }),
    []
  );

  // Set extra filter query synchronously
  const extraFilterQuery = buildFilterQuery(extraFilters);

  const { data, isLoading, isFetching, isError } = useQuery({
    queryKey: [
      "test-materials/mock",
      page,
      debouncedSearch,
      "",
      extraFilterQuery,
    ],
    queryFn: () =>
      getTestMaterialsData(page, debouncedSearch, "", extraFilterQuery),
  });

  // Data and pagination info
  const testMaterials = get(data, "results", []) as TestMaterial[];
  const paginationInfo = {
    totalCount: get(data, "count", 0),
    totalPages: get(data, "total_pages", 1),
    currentPage: page,
  };

  // Reset page to 1 when search term or form filters change
  useEffect(() => {
    setPage(1);
  }, [debouncedSearch]);

  if (isError) {
    return (
      <ErrorMessage
        title="Failed to Load page"
        message="An error occurred while loading the page. Please try again later."
      />
    );
  }

  const handlePageChange = (page: number) => {
    setPage(page);
  };

  const renderCard = (item: TestMaterial, index: number) => {
    const materials = get(item, "materials", []);

    return (
      <Card className="p-6 space-y-4" key={item.id || index}>
        <CardTitle className="text-base font-medium">{item.title}</CardTitle>
        <CardContent className="space-y-2 p-0 pt-2">
          {materials?.map((section) => (
            <div className="flex items-center gap-2" key={section.id}>
              <Button
                className="pointer-events-none"
                variant="outline"
                size="icon"
              >
                {section.type === "reading" ? (
                  <RiBookOpenLine className="h-6 w-6" />
                ) : section.type === "listening" ? (
                  <RiHeadphoneLine className="h-6 w-6" />
                ) : section.type === "writing" ? (
                  <RiPencilLine className="h-6 w-6" />
                ) : (
                  <RiMic2Line className="h-6 w-6" />
                )}
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="w-full text-left"
                onClick={() => {
                  const type = section.type;
                  switch (type) {
                    case "listening":
                      navigate(`/listenings/${section.id}`);
                      break;
                    case "reading":
                      navigate(`/readings/${section.id}`);
                      break;
                    case "writing":
                      navigate(`/writings/${section.id}`);
                      break;
                    case "speaking":
                      navigate(`/speakings/${section.id}`);
                      break;
                  }
                }}
              >
                {section.title}
              </Button>
            </div>
          ))}
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-2">
        <div className="text-xl font-semibold">Test materials - Mock</div>
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
        <CardList
          data={testMaterials}
          renderCard={renderCard}
          pagination={true}
          pageSize={9}
          totalCount={paginationInfo.totalCount}
          totalPages={paginationInfo.totalPages}
          currentPage={paginationInfo.currentPage}
          onPageChange={handlePageChange}
          isLoading={isLoading || isFetching} // Include isFetching to cover refetching
          columnsPerRow={3}
        />
      </div>
    </div>
  );
}
