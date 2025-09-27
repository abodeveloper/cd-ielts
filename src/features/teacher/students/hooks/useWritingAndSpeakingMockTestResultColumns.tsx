// useGroupColumns.ts
import { Badge } from "@/components/ui/badge";
import { ColumnDef } from "@tanstack/react-table";
import { useParams } from "react-router-dom";
import { Student } from "../types";
import { NavLink } from "react-router-dom";

export function useWritingAndSpeakingMockTestResultColumns({
  type,
}: {
  type: "writing" | "speaking";
}): ColumnDef<Student>[] {
  const { id } = useParams();

  // type ga qarab title chiqarish
  const titleMap: Record<typeof type, string> = {
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
      accessorKey: "total_questions",
      header: "Total questions",
      cell: ({ row }) => (
        <>
          <Badge variant={"default"}>{row.getValue("total_questions")}</Badge>
        </>
      ),
    },
    {
      accessorKey: "overall_score",
      header: "Overall",
      cell: ({ row }) => (
        <>
          <Badge variant={"secondary"}>{row.getValue("overall_score")}</Badge>
        </>
      ),
    },
    {
      accessorKey: "created_at",
      header: "Test performed",
      cell: ({ row }) => {
        const created_at = String(row.getValue("created_at"));
        return (
          <>
            {created_at.slice(0, 10)} {created_at.slice(11, 19)}
          </>
        );
      },
    },
    {
      accessorKey: `material_id`,
      header: "Answer review",
      cell: ({ row }) => {
        const test_id = row.getValue(`material_id`);

        return (
          <NavLink
            to={`/teacher/students/${id}/mock/${type}/${test_id}/view`}
            className={"text-blue-500"}
          >
            View
          </NavLink>
        );
      },
    },
  ];
}
