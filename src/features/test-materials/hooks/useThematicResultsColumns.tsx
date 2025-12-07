// useGroupColumns.ts
import { Badge } from "@/components/ui/badge";
import { ColumnDef } from "@tanstack/react-table";
import { get } from "lodash";
import { NavLink } from "react-router-dom";

interface Result {
  full_name: string;
  student_id: string;
  material_info: Record<string, any>;
  created_at: string;
}
type ResultType = "reading" | "writing" | "speaking" | "listening"; // sizda boshqa turlar ham bo‘lsa qo‘shishingiz mumkin

export function useThematicResultsColumns(
  type: ResultType
): ColumnDef<Result>[] {
  const baseColumns: ColumnDef<Result>[] = [
    {
      accessorKey: "full_name",
      header: "Student Name",
      cell: ({ row }) => <div>{row.getValue("full_name")}</div>,
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
  ];

  const readingColumns: ColumnDef<Result>[] = [
    {
      accessorKey: "total_questions",
      header: "Total questions",
      cell: ({ row }) => (
        <Badge variant={"outline"}>
          {get(row.original.material_info, "total_questions")}
        </Badge>
      ),
    },
    {
      accessorKey: "incorrect_answers",
      header: "Incorrect answers",
      cell: ({ row }) => (
        <Badge variant={"destructive"}>
          {get(row.original.material_info, "incorrect_answers")}
        </Badge>
      ),
    },
    {
      accessorKey: "correct_answers",
      header: "Correct answers",
      cell: ({ row }) => (
        <Badge variant={"success"}>
          {get(row.original.material_info, "correct_answers")}
        </Badge>
      ),
    },
    {
      accessorKey: "score_percentage",
      header: "Score percentage (%)",
      cell: ({ row }) => (
        <Badge variant={"secondary"}>
          {get(row.original.material_info, "score_percentage")}
        </Badge>
      ),
    },
    {
      accessorKey: "material_info",
      header: "Answer review",
      cell: ({ row }) => {
        const student_id = row.original.student_id;
        const id = get(row.original.material_info, "id", null);

        return (
          <NavLink
            to={`/teacher/students/${student_id}/thematic/reading/${id}/view`}
            className={"text-blue-500"}
          >
            View
          </NavLink>
        );
      },
    },
  ];

  const listeningColumns: ColumnDef<Result>[] = [
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
      accessorKey: "material_info",
      header: "Answer review",
      cell: ({ row }) => {
        const student_id = row.original.student_id;
        const material_info = row.getValue("material_info");
        const id = get(material_info, "id", null);

        return (
          <>
            <NavLink
              to={`/teacher/students/${student_id}/thematic/listening/${id}/view`}
              className={"text-blue-500"}
            >
              View
            </NavLink>
          </>
        );
      },
    },
  ];

  const writingColumns: ColumnDef<Result>[] = [
    {
      accessorKey: "writing_task1_score",
      header: "Writing (T1) score",
      cell: ({ row }) => {
        const material_info = row.original.material_info;
        const writing_task1 = get(material_info, "writing_task1");
        const is_completed = get(writing_task1, "completed", false);

        return (
          <>
            {!is_completed ? (
              <Badge variant={"destructive"}>Not completed</Badge>
            ) : (
              <Badge variant={"secondary"}>{get(writing_task1, "score")}</Badge>
            )}
          </>
        );
      },
    },
    {
      accessorKey: "writing_task2_score",
      header: "Writing (T2) score",
      cell: ({ row }) => {
        const material_info = row.original.material_info;
        const writing_task1 = get(material_info, "writing_task2");
        const is_completed = get(writing_task1, "completed", false);

        return (
          <>
            {!is_completed ? (
              <Badge variant={"destructive"}>Not completed</Badge>
            ) : (
              <Badge variant={"secondary"}>{get(writing_task1, "score")}</Badge>
            )}
          </>
        );
      },
    },
    {
      accessorKey: "score",
      header: "Total score",
      cell: ({ row }) => {
        const material_info = row.original.material_info;

        return <Badge variant={"default"}>{get(material_info, "score")}</Badge>;
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
              to={`/teacher/students/${student_id}/thematic/writing/${id}/view`}
              className={"text-blue-500"}
            >
              View
            </NavLink>
          </>
        );
      },
    },
  ];

  const speakingColumns: ColumnDef<Result>[] = [
    {
      accessorKey: "feedback",
      header: "Feedback",
      cell: ({ row }) => {
        const material_info = row.original.material_info;

        return <>{get(material_info, "feedback")}</>;
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
      accessorKey: "material_info",
      header: "Answer review",
      cell: ({ row }) => {
        const student_id = row.original.student_id;
        const material_info = row.getValue("material_info");
        const id = get(material_info, "id", null);

        return (
          <>
            <NavLink
              to={`/teacher/students/${student_id}/thematic/writing/${id}/view`}
              className={"text-blue-500"}
            >
              View
            </NavLink>
          </>
        );
      },
    },
  ];

  if (type === "reading") {
    return [...baseColumns, ...readingColumns];
  }

  if (type === "speaking") {
    return [...baseColumns, ...speakingColumns];
  }

  if (type === "listening") {
    return [...baseColumns, ...listeningColumns];
  }

  if (type === "writing") {
    return [...baseColumns, ...writingColumns];
  }

  return baseColumns;
}
