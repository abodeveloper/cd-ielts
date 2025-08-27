// useGroupColumns.ts
import { ColumnDef } from "@tanstack/react-table";
import { Group } from "../types";

export function useStudentColumns(): ColumnDef<Group>[] {
  return [
    {
      accessorKey: "full_name",
      header: "Full Name",
      cell: ({ row }) => <div>{row.getValue("full_name")}</div>,
    },
    {
      accessorKey: "username",
      header: "Username",
      cell: ({ row }) => <div>{row.getValue("username")}</div>,
    },
    {
      accessorKey: "group",
      header: "Group",
      cell: ({ row }) => <div>{row.getValue("group")}</div>,
    },
    {
      accessorKey: "phone",
      header: "Phone number",
      cell: ({ row }) => <div>{row.getValue("phone")}</div>,
    },
  ];
}
