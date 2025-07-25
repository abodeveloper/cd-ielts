import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";
import { getReadingsData } from "../../api/reading";
import { useNavigate } from "react-router-dom";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const ReadingsPage = () => {
  const { data, isLoading, isError } = useQuery({
    queryKey: ["readings"],
    queryFn: getReadingsData,
  });

  const navigate = useNavigate();

  if (isLoading) return <div className="p-4">Loading...</div>;
  if (isError) return <div className="p-4">Error loading readings.</div>;

  return (
    <div className="p-4">
      <Card className="w-full shadow-sm rounded-lg border">
        <CardHeader className="border-b">
          <CardTitle className="text-xl font-bold">Readings Tests</CardTitle>
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
                      {reading.title || `Reading ${reading.id}`}
                    </TableCell>
                    <TableCell className="py-3">
                      <Button
                        onClick={() => navigate(`/readings/${reading.id}`)}
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

export default ReadingsPage;
