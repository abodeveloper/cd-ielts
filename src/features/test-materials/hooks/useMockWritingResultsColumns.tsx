// useGroupColumns.ts
import { Badge } from "@/components/ui/badge";
import { ColumnDef } from "@tanstack/react-table";
import { NavLink, useParams } from "react-router-dom";

interface Result {
  full_name: string;
  total_questions: number;
  incorrect_answers: number;
  correct_answers: number;
  reading_id: number;
}

export function useMockWritingResultsColumns(): ColumnDef<Result>[] {
  const { material_id } = useParams();

  return [
    {
      accessorKey: "full_name",
      header: "Student Name",
      cell: ({ row }) => {
        return (
          <div>
            {row.getValue("full_name")}
            {/* <NavLink
              to={`/teacher/groups/${row.original.group_id}`}
              className={"text-blue-500"}
            >
              {row.getValue("group_name")}
            </NavLink> */}
          </div>
        );
      },
    },
    {
      accessorKey: "total_questions",
      header: "Total questions",
      cell: ({ row }) => (
        <Badge variant={"default"}>{row.getValue("total_questions")}</Badge>
      ),
    },
    {
      accessorKey: "incorrect_answers",
      header: "Incorrect answers",
      cell: ({ row }) => (
        <Badge variant={"destructive"}>
          {row.getValue("incorrect_answers")}
        </Badge>
      ),
    },
    {
      accessorKey: "correct_answers",
      header: "Correct answers",
      cell: ({ row }) => (
        <Badge variant={"success"}>{row.getValue("correct_answers")}</Badge>
      ),
    },
    {
      accessorKey: "student_id",
      header: "Answer review",
      cell: ({ row }) => {
        const student_id = row.getValue("student_id");

        const reading_id = row.original["reading_id"];

        return (
          <>
            <NavLink
              to={`/teacher/students/${student_id}/mock/reading/${reading_id}`}
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
