// useGroupColumns.ts
import { Badge } from "@/components/ui/badge";
import { ColumnDef } from "@tanstack/react-table";
import { NavLink, useParams } from "react-router-dom";
import { Student } from "../types";

export function useThematicTestResultColumns({
  type,
}: {
  type: "reading" | "listening" | "writing" | "speaking";
}): ColumnDef<Student>[] {
  const { id } = useParams();

  // type ga qarab title chiqarish
  const titleMap: Record<typeof type, string> = {
    reading: "Reading title",
    listening: "Listening title",
    writing: "Writing title",
    speaking: "Speaking title",
  };

  return [
    {
      accessorKey: "test_title",
      header: "Test title",
    },
    {
      accessorKey: `${type}_title`, // dinamik ustun
      header: titleMap[type], // dinamik header
    },
    {
      accessorKey: "total_answers_for_material",
      header: "Total questions",
      cell: ({ row }) => (
        <Badge variant={"default"}>
          {row.getValue("total_answers_for_material")}
        </Badge>
      ),
    },
    {
      accessorKey: "total_incorrect_answers_for_material",
      header: "Total incorrect answers",
      cell: ({ row }) => (
        <Badge variant={"destructive"}>
          {row.getValue("total_incorrect_answers_for_material")}
        </Badge>
      ),
    },
    {
      accessorKey: "total_correct_answers_for_material",
      header: "Total correct answers",
      cell: ({ row }) => (
        <Badge variant={"success"}>
          {row.getValue("total_correct_answers_for_material")}
        </Badge>
      ),
    },
    {
      accessorKey: "percentage_correct_for_material",
      header: "Percentage correct",
      cell: ({ row }) => (
        <Badge variant={"secondary"}>
          {row.getValue("percentage_correct_for_material")} %
        </Badge>
      ),
    },
    {
      accessorKey: `${type}_material_id`,
      header: "Answer review",
      cell: ({ row }) => {
        const test_id = row.getValue(`${type}_material_id`);

        return (
          <NavLink
            to={`/teacher/students/${id}/thematic/${type}/${test_id}`}
            className={"text-blue-500"}
          >
            View
          </NavLink>
        );
      },
    },
  ];
}
