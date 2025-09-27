// useGroupColumns.ts
import { ColumnDef } from "@tanstack/react-table";
import { get } from "lodash";
import { ReactNode } from "react";
import { NavLink, useParams } from "react-router-dom";

export function useMyThematicsColumns(): ColumnDef<any>[] {
  const { student_id } = useParams();

  return [
    {
      accessorKey: "title",
      header: "Material title",
      cell: ({ row }) => {
        const title = row.getValue("title");
        return <div>{title as ReactNode}</div>;
      },
    },
    {
      accessorKey: "test_info",
      header: "Section title",
      cell: ({ row }) => {
        const test_info = row.getValue("test_info");
        return <div>{get(test_info, "test_title")}</div>;
      },
    },
    {
      accessorKey: "skill_info",
      header: "Test title",
      cell: ({ row }) => {
        const test_info = row.getValue("skill_info");
        return <div>{get(test_info, "skill_title")}</div>;
      },
    },
    {
      accessorKey: "id",
      header: "Results",
      cell: ({ row }) => {
        const material_id = row.getValue("id");
        const type = row.original.type;

        return (
          <>
            <NavLink
              to={`/student/results/thematic/${type}/${material_id}`}
              className={"text-blue-500"}
            >
              View
            </NavLink>
          </>
        );
      },
    },
  ];
}
