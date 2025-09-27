import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import ErrorMessage from "@/shared/components/atoms/error-message/ErrorMessage";
import LoadingSpinner from "@/shared/components/atoms/loading-spinner/LoadingSpinner";
import { useQuery } from "@tanstack/react-query";
import { useNavigate, useParams } from "react-router-dom";
import { getDashbordStatistics } from "./api/dashboard";
import CountUp from "react-countup";

const DashboardPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const {
    data: statistics,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["statistics", id],
    queryFn: () => getDashbordStatistics(),
  });

  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (isError) {
    return (
      <ErrorMessage
        title="Failed to Load page"
        message="An error occurred while loading the page. Please try again later."
      />
    );
  }

  return (
    <div className="space-y-8 bg-background min-h-screen">
      <h1 className="text-xl font-semibold text-foreground tracking-tight">
        Dashboard Overview
      </h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="shadow-md hover:shadow-lg transition-shadow duration-300 bg-card text-card-foreground">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg font-semibold text-muted-foreground">
              Total Students
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-4xl font-bold text-foreground">
              <CountUp end={statistics.total_students} duration={2} />
            </p>
            <p className="text-sm text-green-500 font-medium mt-2">
              Active: <CountUp end={statistics.active_students} duration={2} />
            </p>
          </CardContent>
        </Card>

        <Card className="shadow-md hover:shadow-lg transition-shadow duration-300 bg-card text-card-foreground">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg font-semibold text-muted-foreground">
              Tests
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-4xl font-bold text-foreground">
              <CountUp
                end={
                  statistics.mock_tests_count + statistics.thematic_tests_count
                }
                duration={2}
              />
            </p>
            <p className="text-sm text-muted-foreground mt-2">
              Mock: <CountUp end={statistics.mock_tests_count} duration={2} />,{" "}
              Thematic:{" "}
              <CountUp end={statistics.thematic_tests_count} duration={2} />
            </p>
          </CardContent>
        </Card>

        <Card className="shadow-md hover:shadow-lg transition-shadow duration-300 bg-card text-card-foreground">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg font-semibold text-muted-foreground">
              Total Groups
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-4xl font-bold text-foreground">
              <CountUp end={statistics.total_groups} duration={2} />
            </p>
            <p className="text-sm text-green-500 font-medium mt-2">
              Active: <CountUp end={statistics.active_groups} duration={2} />
            </p>
          </CardContent>
        </Card>

        <Card className="shadow-md hover:shadow-lg transition-shadow duration-300 bg-card text-card-foreground">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg font-semibold text-muted-foreground">
              Active Ratio
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-4xl font-bold text-green-500">
              <CountUp end={statistics.active_students} duration={2} />/
              <CountUp end={statistics.total_students} duration={2} />
            </p>
            <p className="text-sm text-muted-foreground mt-2">Active Students Ratio</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default DashboardPage;
