// useGroupColumns.ts
import { Badge } from "@/components/ui/badge";
import { ColumnDef } from "@tanstack/react-table";
import { NavLink, useParams } from "react-router-dom";

interface Group {
  group_id: number;
  group_name: string;
  total_test_students: number;
}

export function useMockStatisticGroupColumns(): ColumnDef<Group>[] {
  const { material_id } = useParams();

  return [
    {
      accessorKey: "group_name",
      header: "Group Name",
      cell: ({ row }) => {
        return (
          <NavLink
            to={`/teacher/groups/${row.original.group_id}`}
            className={"text-blue-500"}
          >
            {row.getValue("group_name")}
          </NavLink>
        );
      },
    },
    {
      accessorKey: "total_test_students",
      header: "Student Count",
      cell: ({ row }) => (
        <Badge variant={"outline"}>{row.getValue("total_test_students")}</Badge>
      ),
    },
    {
      accessorKey: "group_id",
      header: "Statistics",
      cell: ({ row }) => {
        const group_id = row.getValue("group_id");

        return (
          <>
            <NavLink
              to={`/teacher/tests/mock/statistics/${material_id}/groups/${group_id}`}
              className={"text-blue-500"}
            >
              View statistics
            </NavLink>
          </>
        );
      },
    },
  ];
}
