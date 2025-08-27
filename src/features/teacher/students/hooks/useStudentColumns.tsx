// useGroupColumns.ts
import { Badge } from "@/components/ui/badge";
import { ColumnDef } from "@tanstack/react-table";
import { get } from "lodash";
import { NavLink, useNavigate } from "react-router-dom";
import { Student } from "../types";

export function useStudentColumns(): ColumnDef<Student>[] {
  const navigate = useNavigate();

  return [
    {
      accessorKey: "full_name",
      header: "Full name",
      cell: ({ row }) => {
        const id = row.original.id;
        const fullName = row.getValue("full_name");

        return (
          <NavLink to={`/teacher/students/${id}`} className="text-blue-400">
            {fullName as React.ReactNode}
          </NavLink>
        );
      },
    },
    {
      accessorKey: "username",
      header: "Username",
      cell: ({ row }) => <div>{row.getValue("username")}</div>,
    },
    {
      accessorKey: "group",
      header: "Group",
      cell: ({ row }) => {
        const group = row.getValue("group");

        return (
          <>
            <Badge
              variant={"outline"}
              onClick={() => navigate(`/teacher/groups/${get(group, "id")}`)}
            >
              {get(group, "name")}
            </Badge>
          </>
        );
      },
    },
    {
      accessorKey: "phone",
      header: "Phone number",
      cell: ({ row }) => <div>{row.getValue("phone")}</div>,
    },
  ];
}
