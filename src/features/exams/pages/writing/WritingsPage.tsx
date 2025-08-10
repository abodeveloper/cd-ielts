import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import ErrorMessage from "@/shared/components/atoms/error-message/ErrorMessage";
import LoadingSpinner from "@/shared/components/atoms/loading-spinner/LoadingSpinner";
import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { getWritingsData } from "../../api/writing";

const WritingsPage = () => {
  const { data, isLoading, isError } = useQuery({
    queryKey: ["writings"],
    queryFn: getWritingsData,
  });

  const navigate = useNavigate();

  if (isLoading) return <LoadingSpinner />;
  if (isError) return <ErrorMessage message="Error" />;

  return (
    <div className="p-4">
      <Card className="w-full shadow-sm rounded-lg border">
        <CardHeader className="border-b">
          <CardTitle className="text-xl font-bold">Writing Tests</CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          {data && Array.isArray(data) && data.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-left">ID</TableHead>
                  <TableHead className="text-left">Title</TableHead>
                  <TableHead className="text-left">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.map((reading) => (
                  <TableRow key={reading.id}>
                    <TableCell className="py-3">{reading.id}</TableCell>
                    <TableCell className="py-3">
                      {reading.title || `Writing ${reading.id}`}
                    </TableCell>
                    <TableCell className="py-3">
                      <Button
                        onClick={() => navigate(`/writings/${reading.id}`)}
                      >
                        Start Test
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="text-center text-gray-500 py-6">
              No readings available.
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default WritingsPage;
