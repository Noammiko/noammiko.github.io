import type { Song } from "./types";
import {
  Table as TableBase,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

import { Play, ArrowUpAZ, ArrowDownAZ } from "lucide-react"
import { playing } from "./utils.ts";

interface Props {
  songs: Song[];
}

import {
  type ColumnDef,
  type SortingState,
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  useReactTable,
} from '@tanstack/react-table'
import { useEffect, useMemo, useState } from "react";

export function Table({ songs }: Props) {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [data, _setData] = useState(() => [...songs])
  const [currentlyPlaying, setCurrentlyPlaying] = useState<Song | null>(null)

  useEffect(() => {
    return playing.subscribe((value) => setCurrentlyPlaying(value))
  }, [])

  const columns = useMemo<ColumnDef<Song>[]>(
    () => [
      {
        accessorKey: 'title',
        header: 'Title',
        cell: ({ row }) => (
          <span className="portfolio-title-cell">{row.original.title}</span>
        ),
      },
      {
        accessorKey: 'client',
        header: 'Artist',
      },
      {
        accessorKey: 'work',
        header: 'Services',
        cell: ({ row }) => {
          const { work } = row.original;
          return (
            <div className="flex items-center justify-start gap-1.5 flex-wrap">
              {work.toSorted().map((w, index) => (
                <span key={index} className="portfolio-work-tag">{w}</span>
              ))}
            </div>
          );
        },
        enableSorting: false,
      },
      {
        accessorKey: 'genres',
        header: 'Genre',
        cell: ({ row }) => (
          <span>{row.original.genres.join(", ")}</span>
        ),
        enableSorting: false,
      },
      {
        accessorKey: 'languages',
        header: 'Language',
        cell: ({ row }) => (
          <span>{row.original.languages.join(", ")}</span>
        ),
        enableSorting: false,
      },
    ],
    []
  )

  const table = useReactTable({
    columns,
    data,
    debugTable: false,
    getCoreRowModel: getCoreRowModel(),
    state: { sorting },
    onSortingChange: setSorting,
    getSortedRowModel: getSortedRowModel(),
  })

  return (
    <div className="p-2">
      <div className="h-2" />
      <TableBase>
        <TableHeader>
          {table.getHeaderGroups().map(headerGroup => (
            <TableRow key={headerGroup.id}>
              {/* Play column header — empty */}
              <TableHead className="sticky left-0 z-10" />
              {headerGroup.headers.map(header => (
                <TableHead key={header.id} colSpan={header.colSpan}>
                  {header.isPlaceholder ? null : (
                    <div
                      className={`text-xl flex justify-center pt-1 flex-row-reverse gap-2 items-center ${
                        header.column.getCanSort() ? 'cursor-pointer select-none' : ''
                      }`}
                      onClick={header.column.getToggleSortingHandler()}
                      title={
                        header.column.getCanSort()
                          ? header.column.getNextSortingOrder() === 'asc'
                            ? 'Sort ascending'
                            : header.column.getNextSortingOrder() === 'desc'
                              ? 'Sort descending'
                              : 'Clear sort'
                          : undefined
                      }
                    >
                      {flexRender(header.column.columnDef.header, header.getContext())}
                      {header.column.getIsSorted() ? (
                        {
                          asc:  <ArrowUpAZ   className="inline-block w-6 h-6 -ml-8 -translate-y-0.5" />,
                          desc: <ArrowDownAZ className="inline-block w-6 h-6 -ml-8 -translate-y-0.5" />,
                        }[header.column.getIsSorted() as string] ?? null
                      ) : null}
                    </div>
                  )}
                </TableHead>
              ))}
            </TableRow>
          ))}
        </TableHeader>
        <TableBody>
          {table.getRowModel().rows.map(row => (
            <TableRow key={row.id}>
              {/* Gold play triangle — no circle, no background */}
              <TableCell className="sticky left-0 z-10 whitespace-nowrap">
                <button
                  disabled={currentlyPlaying === row.original}
                  className="p-1.5 text-[#C9A96E] hover:text-[#E8C98A] transition-colors
                             disabled:opacity-40 disabled:cursor-default cursor-pointer
                             bg-transparent border-none outline-none"
                  onClick={() => playing.set(row.original)}
                  aria-label={`Play ${row.original.title}`}
                >
                  <Play className="w-4 h-4 fill-current" />
                </button>
              </TableCell>

              {row.getVisibleCells().map(cell => (
                <TableCell key={cell.id}>
                  {flexRender(cell.column.columnDef.cell, cell.getContext())}
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </TableBase>
    </div>
  )
}
