// useGroupColumns.ts
import { ColumnDef } from "@tanstack/react-table";
import { NavLink, useNavigate } from "react-router-dom";
import { Test } from "../types";

export function useTestColumns(): ColumnDef<Test>[] {
  const navigate = useNavigate();

  return [
    {
      accessorKey: "title",
      header: "Title",
      cell: ({ row }) => {
        const id = row.original.id;
        const title = row.getValue("title");

        return (
          <NavLink to={`${id}`} className="text-blue-400">
            {title as React.ReactNode}
          </NavLink>
        );
      },
    },
  ];
}
