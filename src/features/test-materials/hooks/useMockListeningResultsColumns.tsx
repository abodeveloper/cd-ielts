// useGroupColumns.ts
import { Badge } from "@/components/ui/badge";
import { ColumnDef } from "@tanstack/react-table";
import { get } from "lodash";
import { NavLink } from "react-router-dom";

interface Result {
  full_name: string;
  student_id: string;
  material_info: object;
  created_at: string;
}

export function useMockListeningResultsColumns(): ColumnDef<Result>[] {
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
      cell: ({ row }) => {
        const material_info = row.original.material_info;

        return (
          <Badge variant={"outline"}>
            {get(material_info, "total_questions")}
          </Badge>
        );
      },
    },
    {
      accessorKey: "incorrect_answers",
      header: "Incorrect answers",
      cell: ({ row }) => {
        const material_info = row.original.material_info;

        return (
          <Badge variant={"destructive"}>
            {get(material_info, "incorrect_answers")}
          </Badge>
        );
      },
    },
    {
      accessorKey: "correct_answers",
      header: "Correct answers",
      cell: ({ row }) => {
        const material_info = row.original.material_info;

        return (
          <Badge variant={"success"}>
            {get(material_info, "correct_answers")}
          </Badge>
        );
      },
    },
    {
      accessorKey: "score_percentage",
      header: "Score percentage (%)",
      cell: ({ row }) => {
        const material_info = row.original.material_info;

        return (
          <Badge variant={"secondary"}>
            {get(material_info, "score_percentage")}
          </Badge>
        );
      },
    },
    {
      accessorKey: "score",
      header: "Score",
      cell: ({ row }) => {
        const material_info = row.original.material_info;

        return <Badge variant={"default"}>{get(material_info, "score")}</Badge>;
      },
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
      accessorKey: "material_info",
      header: "Answer review",
      cell: ({ row }) => {
        const student_id = row.original.student_id;
        const material_info = row.getValue("material_info");
        const id = get(material_info, "id", null);

        return (
          <>
            <NavLink
              to={`/teacher/students/${student_id}/mock/listening/${id}/view`}
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
