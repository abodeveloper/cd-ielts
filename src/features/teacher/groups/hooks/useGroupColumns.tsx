// useGroupColumns.ts
import { Badge } from "@/components/ui/badge";
import { ColumnDef } from "@tanstack/react-table";
import { Group } from "../types";

export function useGroupColumns(): ColumnDef<Group>[] {
  return [
    {
      accessorKey: "name",
      header: "Group Name",
      cell: ({ row }) => <div>{row.getValue("name")}</div>,
    },
    {
      accessorKey: "student_count",
      header: "Student Count",
      cell: ({ row }) => <div>{row.getValue("student_count")}</div>,
    },
    {
      accessorKey: "is_active",
      header: "Status",
      cell: ({ row }) => (
        <div>
          {row.getValue("is_active") ? (
            <Badge variant="success">Active</Badge>
          ) : (
            <Badge variant="destructive">Inactive</Badge>
          )}
        </div>
      ),
    },
  ];
}
