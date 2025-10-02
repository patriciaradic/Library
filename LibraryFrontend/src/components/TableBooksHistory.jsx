"use client"

import {
  useReactTable,
  getCoreRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  flexRender,
  createColumnHelper,
} from "@tanstack/react-table";
import { Link } from "react-router-dom";
import { ChevronDown, ChevronUp } from "lucide-react";
import ProfileImage from "./ProfileImage";
import React from "react";
import "../styles/Table.css";

const columnHelper = createColumnHelper()

// Define columns for Borrowed data
const columns = [
  columnHelper.accessor("memberName", {
    id:"profile",
    header: "Profile",
    enableSorting: false,
    cell: info => <ProfileImage name={info.getValue()} size={40}/>,
  }),
  columnHelper.accessor("memberName", {
    id:"member",
    header: "Member",
    cell: info => {
      const { memberId } = info.row.original;
      return (
        <Link
          to={`/member/${memberId}`}
          style={{ color: "inherit", textDecoration: "none" }}
        >
          {info.getValue()}
        </Link>
      );
    },
  }),
  columnHelper.accessor("borrowedDate", {
    header: "Borrowed",
    cell: info => info.getValue() ? new Date(info.getValue()).toLocaleDateString() : "—",
  }),
  columnHelper.accessor("due", {
    header: "Due",
    cell: info => info.getValue() ? new Date(info.getValue()).toLocaleDateString() : "—",
  }),
  columnHelper.accessor("returnedDate", {
    header: "Returned",
    cell: info => info.getValue() ? new Date(info.getValue()).toLocaleDateString() : "—",
  }),
  columnHelper.accessor("extendedCount", {
    header: "Extensions",
  }),
  columnHelper.accessor("isLate", {
    header: "Late",
    cell: info => {
    const value = info.getValue();
    if (value) {
      return <span className="late-yes">Yes</span>;
    }
    if (!value) {
      return <span className="late-no">No</span>;
    }
    return "—";
  },
  }),
  columnHelper.accessor("copies", {
    header: "Copies",
  }),
];

export default function BookTable({ data }) {
  const [sorting, setSorting] = React.useState([]);
  
  const table = useReactTable({
      data,
      columns,
      state: {
        sorting,
      },
      onSortingChange: setSorting,
      getCoreRowModel: getCoreRowModel(),
      getPaginationRowModel: getPaginationRowModel(),
      getSortedRowModel: getSortedRowModel(),
      initialState: {
        pagination: {
          pageSize: 5,
        },
      },
    });

  return (
    <div className="table-container">
      <table className="table">
        <thead>
          {table.getHeaderGroups().map(headerGroup => (
            <tr key={headerGroup.id}>
              {headerGroup.headers.map(header => (
                <th 
                  key={header.id} 
                  colSpan={header.colSpan}
                  onClick={header.column.getToggleSortingHandler()}
                  style={{
                    cursor: header.column.getCanSort() ? "pointer" : "default",
                  }}
                >
                  {header.isPlaceholder ? null : (
                    <div style={{ display: "flex", alignItems: "center" }}>
                      {flexRender(
                        header.column.columnDef.header,
                        header.getContext()
                      )}
                      {/* sorting indicator */}
                      {header.column.getIsSorted() === "asc" && (
                        <ChevronUp className="sort-icon" size={16} />
                      )}
                      {header.column.getIsSorted() === "desc" && (
                        <ChevronDown className="sort-icon" size={16} />
                      )}
                    </div>
                  )}
                </th>
              ))}
            </tr>
          ))}
        </thead>
        <tbody>
          {table.getRowModel().rows.map(row => (
            <tr key={row.id}>
              {row.getVisibleCells().map(cell => (
                <td key={cell.id}>
                  {flexRender(cell.column.columnDef.cell, cell.getContext())}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>

      {/* Pagination Controls */}
      <div className="table-pagination">
        <button
          className="page-btn"
          onClick={() => table.setPageIndex(0)}
          disabled={!table.getCanPreviousPage()}
        >
          {"<<"}
        </button>
        <button
          className="page-btn"
          onClick={() => table.previousPage()}
          disabled={!table.getCanPreviousPage()}
        >
          {"<"}
        </button>
        
        <div className="page-numbers">
          {Array.from({ length: table.getPageCount() }, (_, i) => (
            <button
              key={i}
              className={`page-number ${table.getState().pagination.pageIndex === i ? "active" : ""}`}
              onClick={() => table.setPageIndex(i)}
            >
              {i + 1}
            </button>
          ))}
        </div>

        <button
          className="page-btn"
          onClick={() => table.nextPage()}
          disabled={!table.getCanNextPage()}
        >
          {">"}
        </button>
        <button
          className="page-btn"
          onClick={() => table.setPageIndex(table.getPageCount() - 1)}
          disabled={!table.getCanNextPage()}
        >
          {">>"}
        </button>

        <select
          value={table.getState().pagination.pageSize}
          onChange={(e) => {
            table.setPageSize(Number(e.target.value));
          }}
          className="page-size"
        >
          {[5, 10, 15, 20, 30, 40, 50].map((pageSize) => (
            <option key={pageSize} value={pageSize}>
              Show {pageSize}
            </option>
          ))}
        </select>
      </div>
    </div>
  )
}
