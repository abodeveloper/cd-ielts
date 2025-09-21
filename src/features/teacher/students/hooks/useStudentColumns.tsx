// useGroupColumns.ts
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  RiArticleLine,
  RiBookmark3Line,
  RiBookOpenLine,
  RiHeadphoneLine,
  RiMic2Line,
  RiPencilLine,
  RiVerifiedBadgeLine,
} from "@remixicon/react";
import { ColumnDef } from "@tanstack/react-table";
import { get } from "lodash";
import { NavLink, useNavigate } from "react-router-dom";
import { Student } from "../types";

export function useStudentColumns(): ColumnDef<Student>[] {
  const navigate = useNavigate();

  return [
    {
      accessorKey: "full_name",
      header: "Full name",
      cell: ({ row }) => {
        const id = row.original.id;
        const fullName = row.getValue("full_name");

        return (
          <NavLink to={`/teacher/students/${id}`} className="text-blue-400">
            {fullName as React.ReactNode}
          </NavLink>
        );
      },
    },
    {
      accessorKey: "username",
      header: "Username",
      cell: ({ row }) => <div>{row.getValue("username")}</div>,
    },
    {
      accessorKey: "group",
      header: "Group",
      cell: ({ row }) => {
        const group = row.getValue("group");

        return (
          <>
            <Badge
              variant={"outline"}
              onClick={() => navigate(`/teacher/groups/${get(group, "id")}`)}
            >
              {get(group, "name")}
            </Badge>
          </>
        );
      },
    },
    {
      accessorKey: "phone",
      header: "Phone number",
      cell: ({ row }) => <div>{row.getValue("phone")}</div>,
    },
    {
      accessorKey: "id",
      header: "Results",
      cell: ({ row }) => {
        const id = row.getValue("id");

        return (
          <div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full text-left px-3 py-2"
                >
                  <RiVerifiedBadgeLine className="h-6 w-6" />
                  Results
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem
                  onClick={() => navigate(`/teacher/students/${id}/mock`)}
                >
                  <RiArticleLine className="w-5 h-5" />
                  Mock
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => navigate(`/teacher/students/${id}/thematic`)}
                >
                  <RiBookmark3Line className="w-5 h-5" />
                  Thematic
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() =>
                    navigate(`/teacher/students/${id}/results/reading`)
                  }
                >
                  <RiBookOpenLine className="w-5 h-5" />
                  Reading
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() =>
                    navigate(`/teacher/students/${id}/results/listening`)
                  }
                >
                  <RiHeadphoneLine className="w-5 h-5" />
                  Listening
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() =>
                    navigate(`/teacher/students/${id}/results/speaking`)
                  }
                >
                  <RiMic2Line className="w-5 h-5" />
                  Speaking
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() =>
                    navigate(`/teacher/students/${id}/results/Writing`)
                  }
                >
                  <RiPencilLine className="w-5 h-5" />
                  Writing
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        );
      },
    },
  ];
}
