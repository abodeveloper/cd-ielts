// useGroupColumns.ts
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ColumnDef } from "@tanstack/react-table";
import { get } from "lodash";
import { RiMessageLine, RiPhoneLine } from "@remixicon/react";

interface Result {
  full_name: string;
  student_id: string;
  material_info: object;
  created_at: string;
}

export function useMockFullResultsColumns(): ColumnDef<Result>[] {
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
      accessorKey: "material_info",
      header: "Listening",
      cell: ({ row }) => {
        const material_info = row.original.material_info;
        const is_completed = get(material_info, "listening_complete", false);

        return (
          <>
            {!is_completed ? (
              <Badge variant={"destructive"}>Not completed</Badge>
            ) : (
              <>
                {get(material_info, "listening_total_questions")} /{" "}
                {get(material_info, "listening_correct_answers")} /{" "}
                {get(material_info, "listening_score")}
              </>
            )}
          </>
        );
      },
    },
    {
      accessorKey: "material_info",
      header: "Reading",
      cell: ({ row }) => {
        const material_info = row.original.material_info;
        const is_completed = get(material_info, "reading_complete", false);

        return (
          <>
            {!is_completed ? (
              <Badge variant={"destructive"}>Not completed</Badge>
            ) : (
              <>
                {get(material_info, "reading_total_questions")} /{" "}
                {get(material_info, "reading_correct_answers")} /{" "}
                {get(material_info, "reading_score")}
              </>
            )}
          </>
        );
      },
    },
    {
      accessorKey: "material_info",
      header: "Writing (T1)",
      cell: ({ row }) => {
        const material_info = row.original.material_info;

        const is_completed = get(material_info, "writing_complete", false);

        return (
          <>
            {!is_completed ? (
              <Badge variant={"destructive"}>Not completed</Badge>
            ) : (
              <>{get(material_info, "writing_task1_score")}</>
            )}
          </>
        );
      },
    },
    {
      accessorKey: "material_info",
      header: "Writing (T2)",
      cell: ({ row }) => {
        const material_info = row.original.material_info;

        const is_completed = get(material_info, "writing_complete", false);

        return (
          <>
            {!is_completed ? (
              <Badge variant={"destructive"}>Not completed</Badge>
            ) : (
              <>{get(material_info, "writing_task2_score")}</>
            )}
          </>
        );
      },
    },
    {
      accessorKey: "material_info",
      header: "Writing total",
      cell: ({ row }) => {
        const material_info = row.original.material_info;
        const is_completed = get(material_info, "writing_complete", false);

        return (
          <>
            {!is_completed ? (
              <Badge variant={"destructive"}>Not completed</Badge>
            ) : (
              <>{get(material_info, "writing_overall_score")}</>
            )}
          </>
        );
      },
    },
    {
      accessorKey: "material_info",
      header: "Speaking",
      cell: ({ row }) => {
        const material_info = row.original.material_info;
        const is_completed = get(material_info, "speaking_complete", false);

        return (
          <>
            {!is_completed ? (
              <Badge variant={"destructive"}>Not completed</Badge>
            ) : (
              <>{get(material_info, "speaking_overall_score")}</>
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

        return (
          <Badge variant={"default"}>
            {get(material_info, "total_overall_score")}
          </Badge>
        );
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
      accessorKey: "actions",
      header: "Actions",
      cell: ({ row }) => {
        const is_call = get(row.original, "is_call", false);
        const is_sms = get(row.original, "is_sms", false);
        const phone = get(row.original, "phone", "");

        return (
          <div className="flex items-center gap-2">
            {is_call && (
              <Button
                variant="outline"
                size="icon"
                onClick={() => window.open(`tel:${phone}`, "_self")}
                className="h-8 w-8"
              >
                <RiPhoneLine className="h-4 w-4" />
              </Button>
            )}
            {is_sms && (
              <Button
                variant="outline"
                size="icon"
                onClick={() => window.open(`sms:${phone}`, "_self")}
                className="h-8 w-8"
              >
                <RiMessageLine className="h-4 w-4" />
              </Button>
            )}
          </div>
        );
      },
    },
  ];
}
