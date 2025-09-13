import { Button } from "@/components/ui/button";
import { Card, CardContent, CardTitle } from "@/components/ui/card";
import { CardList } from "@/components/ui/card-list";
import { Input } from "@/components/ui/input";
import ErrorMessage from "@/shared/components/atoms/error-message/ErrorMessage";
import { Role } from "@/shared/enums/role.enum";
import { useDebounce } from "@/shared/hooks/useDebounce";
import { buildFilterQuery } from "@/shared/utils/helper";
import { useAuthStore } from "@/store/auth-store";
import {
  RiBarChartBoxLine,
  RiBookOpenLine,
  RiHeadphoneLine,
  RiMic2Line,
  RiPencilLine,
  RiPresentationLine,
} from "@remixicon/react";
import { useQuery } from "@tanstack/react-query";
import { get } from "lodash";
import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getTestsData } from "./api/test-material";
import { Material, Test, TestSection } from "./types";

export default function MocksPage() {
  const { user } = useAuthStore();

  const navigate = useNavigate();
  const [page, setPage] = useState(1);
  const [searchInput, setSearchInput] = useState("");
  const debouncedSearch = useDebounce<string>(searchInput);

  // Define extra filters (group_id and status) with useMemo for stability
  const extraFilters = useMemo(
    () => ({
      test_type: "Mock",
    }),
    []
  );

  // Set extra filter query synchronously
  const extraFilterQuery = buildFilterQuery(extraFilters);

  const { data, isLoading, isFetching, isError } = useQuery({
    queryKey: ["tests/mock", page, debouncedSearch, "", extraFilterQuery],
    queryFn: () => getTestsData(page, debouncedSearch, "", extraFilterQuery),
  });

  // Data and pagination info
  const testMaterials = get(data, "results", []) as Test[];
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

  const renderCard = (item: Test, index: number) => {
    const sections = get(item, "sections", []);

    return (
      <div className="space-y-6" key={index}>
        <div className="text-xl text-center font-semibold">{item.title}</div>
        <div className="grid grid-cols-4 gap-6">
          {sections.map((section: TestSection, index) => {
            const materials = get(section, "materials", []);

            return (
              <Card className="p-4 space-y-4" key={item.id || index}>
                <CardTitle className="text-base font-medium">
                  {section.title}
                </CardTitle>
                <CardContent className="space-y-2 p-0 pt-2">
                  {materials?.map((material: Material) => {
                    return (
                      <div>
                        <div
                          className="flex items-center gap-2 w-full"
                          key={material.id}
                        >
                          <Button
                            className="pointer-events-none shrink-0"
                            variant="outline"
                            size="icon"
                          >
                            {material.type === "reading" ? (
                              <RiBookOpenLine className="h-6 w-6" />
                            ) : material.type === "listening" ? (
                              <RiHeadphoneLine className="h-6 w-6" />
                            ) : material.type === "writing" ? (
                              <RiPencilLine className="h-6 w-6" />
                            ) : (
                              <RiMic2Line className="h-6 w-6" />
                            )}
                          </Button>

                          {user?.role === Role.TEACHER ? (
                            <Button
                              variant="outline"
                              size="sm"
                              className="flex-1 min-w-0 text-left truncate px-3 py-2"
                              onClick={() => {
                                const type = material.type;
                                switch (type) {
                                  case "listening":
                                    navigate(`/listenings/${material.id}`);
                                    break;
                                  case "reading":
                                    navigate(`/readings/${material.id}`);
                                    break;
                                  case "writing":
                                    navigate(`/writings/${material.id}`);
                                    break;
                                  case "speaking":
                                    navigate(`/speakings/${material.id}`);
                                    break;
                                }
                              }}
                            >
                              {material.title}
                            </Button>
                          ) : (
                            <Button
                              variant="outline"
                              size="sm"
                              className="pointer-events-none flex-1 min-w-0 text-left truncate px-3 py-2"
                            >
                              {material.title}
                            </Button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                  {user?.role === Role.TEACHER ? (
                    <Button
                      variant="default"
                      size="sm"
                      className="w-full mt-8"
                      onClick={() => {
                        navigate(
                          `/teacher/tests/mock/statistics/${section.id}`
                        );
                      }}
                    >
                      <RiBarChartBoxLine className="w-5 h-5" />
                      Statistics
                    </Button>
                  ) : (
                    <Button
                      variant="default"
                      size="sm"
                      className="w-full mt-8"
                      onClick={() => {
                        const start_test: string | null = get(
                          item,
                          "start_test"
                        );
                        const start_test_id = get(item, "start_test_id", null);

                        switch (start_test?.toLowerCase()) {
                          case "listening":
                            navigate(`/listenings/${start_test_id}`);
                            break;
                          case "reading":
                            navigate(`/readings/${start_test_id}`);
                            break;
                          case "writing":
                            navigate(`/writings/${start_test_id}`);
                            break;
                          case "speaking":
                            navigate(`/speakings/${start_test_id}`);
                            break;
                          default:
                            break;
                        }
                      }}
                    >
                      <RiPresentationLine className="w-5 h-5" />
                      START MOCK
                    </Button>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-2">
        <div className="text-xl font-semibold">Mock tests</div>
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
          pageSize={10}
          totalCount={paginationInfo.totalCount}
          totalPages={paginationInfo.totalPages}
          currentPage={paginationInfo.currentPage}
          onPageChange={handlePageChange}
          isLoading={isLoading || isFetching} // Include isFetching to cover refetching
          columnsPerRow={1}
        />
      </div>
    </div>
  );
}
