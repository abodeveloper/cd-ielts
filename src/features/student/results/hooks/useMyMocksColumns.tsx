// useGroupColumns.ts
import { Badge } from "@/components/ui/badge";
import {
    RiBookOpenLine,
    RiHeadphoneLine,
    RiMic2Line,
    RiPencilLine,
} from "@remixicon/react";
import { ColumnDef } from "@tanstack/react-table";
import { get } from "lodash";
import { ReactNode } from "react";
import { NavLink } from "react-router-dom";

export function useMyMocksColumns(): ColumnDef<any>[] {
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
      header: "Test title",
      cell: ({ row }) => {
        const test_info = row.getValue("test_info");
        return <div>{get(test_info, "test_title")}</div>;
      },
    },
    {
      accessorKey: "materials",
      header: "Materials",
      cell: ({ row }) => {
        const materials = row.getValue("materials");
        return (
          <div>
            <div className="space-y-2 my-2">
              {materials?.map((section: any) => (
                <div key={section.id} className="mb-2">
                  <Badge variant={"outline"} className="inline-flex gap-2 p-1">
                    {section.type === "reading" ? (
                      <RiBookOpenLine className="h-6 w-6" />
                    ) : section.type === "listening" ? (
                      <RiHeadphoneLine className="h-6 w-6" />
                    ) : section.type === "writing" ? (
                      <RiPencilLine className="h-6 w-6" />
                    ) : (
                      <RiMic2Line className="h-6 w-6" />
                    )}
                    {get(section, "title", "N/A")}
                  </Badge>
                </div>
              ))}
            </div>
          </div>
        );
      },
    },
    {
      accessorKey: "id",
      header: "Results",
      cell: ({ row }) => {
        const test_id = row.getValue("id");

        return (
          <>
            <NavLink
              to={`/student/results/mock/${test_id}`}
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
