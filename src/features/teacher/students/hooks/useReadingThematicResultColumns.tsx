// useGroupColumns.ts
import { Badge } from "@/components/ui/badge";
import { ColumnDef } from "@tanstack/react-table";
import { get } from "lodash";
import { NavLink, useNavigate } from "react-router-dom";
import { Student } from "../types";

export function useReadingThematicResultColumns(): ColumnDef<Student>[] {
  const navigate = useNavigate();

  return [
    {
      accessorKey: "test_title",
      header: "Test title",
      // cell: ({ row }) => <div>{row.getValue("username")}</div>,
    },
    {
      accessorKey: "reading_title",
      header: "Reading title",
    },
    {
      accessorKey: "total_answers_for_material",
      header: "Total questions",
      cell: ({ row }) => (
        <>
          <Badge variant={"default"}>
            {row.getValue("total_answers_for_material")}
          </Badge>
        </>
      ),
    },
    {
      accessorKey: "total_incorrect_answers_for_material",
      header: "Total incorrect answers",
      cell: ({ row }) => (
        <>
          <Badge variant={"destructive"}>
            {row.getValue("total_incorrect_answers_for_material")}
          </Badge>
        </>
      ),
    },
    {
      accessorKey: "total_correct_answers_for_material",
      header: "Total correct answers",
      cell: ({ row }) => (
        <>
          <Badge variant={"success"}>
            {row.getValue("total_correct_answers_for_material")}
          </Badge>
        </>
      ),
    },
    {
      accessorKey: "percentage_correct_for_material",
      header: "Percentage correct",
      cell: ({ row }) => (
        <>
          <Badge variant={'secondary'}>
            {row.getValue("percentage_correct_for_material")} %
          </Badge>
        </>
      ),
    },
  ];
}
