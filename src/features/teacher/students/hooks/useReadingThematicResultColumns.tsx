// useGroupColumns.ts
import { Badge } from "@/components/ui/badge";
import { ColumnDef } from "@tanstack/react-table";
import { NavLink, useParams } from "react-router-dom";
import { Student } from "../types";

export function useReadingThematicResultColumns(): ColumnDef<Student>[] {
  const { id } = useParams();

  return [
    {
      accessorKey: "test_title",
      header: "Test title",
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
          <Badge variant={"secondary"}>
            {row.getValue("percentage_correct_for_material")} %
          </Badge>
        </>
      ),
    },
    {
      accessorKey: "reading_material_id",
      header: "Answer review",
      cell: ({ row }) => {
        const test_id = row.getValue("reading_material_id");

        return (
          <>
            <NavLink
              to={`/teacher/students/${id}/thematic/reading/${test_id}`}
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
