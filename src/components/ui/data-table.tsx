import * as React from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationPrevious,
  PaginationLink,
  PaginationNext,
} from "@/components/ui/pagination";
import LoadingSpinner from "@/shared/components/atoms/loading-spinner/LoadingSpinner";

interface DataTableProps<TData> {
  data: TData[];
  columns: ColumnDef<TData>[];
  pagination?: boolean;
  pageSize?: number;
  totalCount?: number;
  totalPages?: number;
  currentPage?: number;
  onPageChange?: (page: number) => void;
  isLoading?: boolean;
  onRowClick?: (row: TData) => void; // ✅ qo‘shildi
}

export function DataTable<TData>({
  data,
  columns,
  pagination = false,
  pageSize = 10,
  totalCount = data.length,
  totalPages = Math.ceil(totalCount / pageSize),
  currentPage = 1,
  onPageChange,
  isLoading = false,
  onRowClick, // ✅ qo‘shildi
}: DataTableProps<TData>) {
  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    manualPagination: pagination,
    pageCount: pagination ? totalPages : undefined,
    state: {
      pagination: pagination
        ? {
            pageIndex: currentPage - 1,
            pageSize,
          }
        : undefined,
    },
  });

  // Start va end index hisoblash
  const start = (currentPage - 1) * pageSize + 1;
  const end = Math.min(currentPage * pageSize, totalCount);

  return (
    <div>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup, hIndex) => (
              <TableRow key={headerGroup.id}>
                {/* Tartib raqam uchun bosh column qo'shamiz */}
                {hIndex === 0 && <TableHead className="w-[50px]">№</TableHead>}
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id}>
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={columns.length + 1}>
                  <LoadingSpinner
                    className="min-h-[350px]"
                    message="Loading data ..."
                  />
                </TableCell>
              </TableRow>
            ) : table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row, rowIndex) => (
                <TableRow
                  key={row.id}
                  className={
                    onRowClick ? "cursor-pointer hover:bg-muted/50" : undefined
                  } // ✅ style faqat onRowClick bo‘lsa
                  onClick={() => onRowClick?.(row.original)} // ✅ qo‘shildi
                >
                  {/* Har bir row uchun tartib raqam chiqadi */}
                  <TableCell className="text-center">
                    {start + rowIndex}
                  </TableCell>
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length + 1}
                  className="h-24 text-center"
                >
                  No data.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      {pagination && (
        <div className="flex items-center justify-between py-4">
          {/* Nechtadan nechta ko'rsatilayotgani */}
          <div className="text-sm flex items-center justify-content-center w-[200px]">
            {`${start}-${end} / ${totalCount}`} items
          </div>

          <Pagination className="flex items-center justify-end">
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious
                  onClick={() => onPageChange?.(Math.max(currentPage - 1, 1))}
                  className={
                    currentPage === 1
                      ? "pointer-events-none opacity-50"
                      : "cursor-pointer"
                  }
                />
              </PaginationItem>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                (pageNum) => (
                  <PaginationItem key={pageNum}>
                    <PaginationLink
                      onClick={() => onPageChange?.(pageNum)}
                      isActive={pageNum === currentPage}
                      className="cursor-pointer"
                    >
                      {pageNum}
                    </PaginationLink>
                  </PaginationItem>
                )
              )}
              <PaginationItem>
                <PaginationNext
                  onClick={() =>
                    onPageChange?.(Math.min(currentPage + 1, totalPages))
                  }
                  className={
                    currentPage === totalPages
                      ? "pointer-events-none opacity-50"
                      : "cursor-pointer"
                  }
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </div>
      )}
    </div>
  );
}
