import type { Song } from "./types";
import {
  Table as TableBase,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

import { Badge } from "@/components/ui/badge";

import { Play, ArrowUpAZ, ArrowDownAZ } from "lucide-react"
import { playing } from "./utils.ts";

import { Button } from "@/components/ui/button";

interface Props {
  songs: Song[];
}

import {
  type Table,
  type Column,
  type ColumnDef,
  type ColumnFiltersState,
  type FilterFn,
  flexRender,
  getCoreRowModel,
  getFacetedRowModel,
  getFacetedUniqueValues,
  getFilteredRowModel,
  getSortedRowModel,
  type SortingState,
  useReactTable,
} from '@tanstack/react-table'
import { useEffect, useMemo, useReducer, useState } from "react";

const arrayIncludesFilterFn: FilterFn<Song> = (rows, id, filterValue: string[]) => {
  const row = rows.getValue<Array<string>>(id).map(v => v.toLowerCase().trim());
  // doing progressive checks to avoid heavy comparisons
  return filterValue.every(v => row.some((e) => e == v || e.startsWith(v) || e.includes(v)));
}
arrayIncludesFilterFn.autoRemove = (val) => !val;
// turn string into an array, split on commas, clean up values
arrayIncludesFilterFn.resolveFilterValue = (filterValue: string) => filterValue.split(',').map(v => v.toString().toLowerCase().trim());

export function Table({ songs }: Props) {
  const rerender = useReducer(() => ({}), {})[1]

  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])
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
      },
      {
        accessorKey: 'client',
        header: 'Client',
      },
      {
        accessorKey: 'work',
        header: 'Work',
        cell: ({ row }) => {
          const { work } = row.original;
          return (
            <div className="flex items-center justify-start gap-2">
              {work.toSorted().map((work, index) => (
                <Badge key={index} variant="outline">{work}</Badge>
              ))}
            </div>
          );
        },
        enableSorting: false,
        filterFn: arrayIncludesFilterFn,
        getUniqueValues: (table) => table.work
      },
      {
        accessorKey: 'languages',
        header: 'Language',
        cell: ({ row }) => {
          const { languages } = row.original;
          return (
            <span>
              {languages.join(", ")}
            </span>
          );
        },
        filterFn: arrayIncludesFilterFn,
        getUniqueValues: (table) => table.languages
      },
      {
        accessorKey: 'genres',
        header: 'Genre',
        cell: ({ row }) => {
          const { genres } = row.original;
          return (
            <span>
              {genres.join(", ")}
            </span>
          );
        },
        filterFn: arrayIncludesFilterFn,
        getUniqueValues: (table) => table.genres
      },
    ],
    []
  )


  const table = useReactTable({
    columns,
    data,
    debugTable: false,
    getCoreRowModel: getCoreRowModel(),
    state: {
      sorting,
      columnFilters,
    },
    onColumnFiltersChange: setColumnFilters,
    onSortingChange: setSorting,
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFacetedRowModel: getFacetedRowModel(),
    getFacetedUniqueValues: getFacetedUniqueValues()
  })

  return (
    <div className="p-2">
      <div className="h-2" />
      <TableBase>
        <TableHeader>
          {table.getHeaderGroups().map(headerGroup => (
            <TableRow key={headerGroup.id}>
              <TableHead className="sticky left-0 z-10">
              </TableHead>
              {headerGroup.headers.map(header => {
                return (
                  <TableHead key={header.id} colSpan={header.colSpan}>
                    {header.isPlaceholder ? null : (
                      <>
                        <div
                          className={`text-xl flex justify-center flex-row-reverse gap-2 items-center ${
                            header.column.getCanSort()
                              ? 'cursor-pointer select-none'
                              : ''
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
                          {flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                          {header.column.getIsSorted() ? (
                            {
                              asc: <ArrowUpAZ className="inline-block w-6 h-6 -ml-8 -translate-y-0.5" />,
                              desc: <ArrowDownAZ className="inline-block w-6 h-6 -ml-8 -translate-y-0.5" />,
                            }[header.column.getIsSorted() as string] ?? null
                          ) : null}
                        </div>
                        {header.column.getCanFilter() ? (
                          <div className="w-full pt-2">
                            <Filter column={header.column} />
                          </div>
                        ) : null}
                      </>
                    )}
                  </TableHead>
                )
              })}
            </TableRow>
          ))}
        </TableHeader>
        <TableBody>
          {table
            .getRowModel()
            .rows
            .map(row => {
              return (
                <TableRow key={row.id}>
                  <TableCell className="sticky left-0 z-10 whitespace-nowrap flex justify-center">
                    <div className="backdrop-blur-md rounded-full">
                      <Button
                        disabled={currentlyPlaying === row.original}
                        className="p-2 not-disabled:cursor-pointer w-8 h-8 rounded-full"
                        onClick={() => playing.set(row.original)}
                      ><Play /></Button>
                    </div>
                  </TableCell>

                  {row.getVisibleCells().map(cell => {
                    return (
                      <TableCell key={cell.id}>
                        {flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext()
                        )}
                      </TableCell>
                    )
                  })}
                </TableRow>
              )
            })}
        </TableBody>
      </TableBase>
    </div>
  )
}

function Filter({ column }: { column: Column<any, unknown> }) {
  // @ts-ignore
  const { filterVariant } = column.columnDef.meta ?? {}

  const columnFilterValue = column.getFilterValue()

  const sortedUniqueValues = useMemo(
    () =>
      filterVariant === 'range'
        ? []
        : Array.from(column.getFacetedUniqueValues().keys())
          .sort()
          .slice(0, 5000),
    [column.getFacetedUniqueValues(), filterVariant]
  )

  return filterVariant === 'range' ? (
    <div>
      <div className="flex space-x-2">
        <DebouncedInput
          type="number"
          min={Number(column.getFacetedMinMaxValues()?.[0] ?? '')}
          max={Number(column.getFacetedMinMaxValues()?.[1] ?? '')}
          value={(columnFilterValue as [number, number])?.[0] ?? ''}
          onChange={value =>
            column.setFilterValue((old: [number, number]) => [value, old?.[1]])
          }
          placeholder={`Min ${column.getFacetedMinMaxValues()?.[0] !== undefined
            ? `(${column.getFacetedMinMaxValues()?.[0]})`
            : ''
            }`}
          className="min-w-24 w-full border shadow rounded"
        />
        <DebouncedInput
          type="number"
          min={Number(column.getFacetedMinMaxValues()?.[0] ?? '')}
          max={Number(column.getFacetedMinMaxValues()?.[1] ?? '')}
          value={(columnFilterValue as [number, number])?.[1] ?? ''}
          onChange={value =>
            column.setFilterValue((old: [number, number]) => [old?.[0], value])
          }
          placeholder={`Max ${column.getFacetedMinMaxValues()?.[1]
            ? `(${column.getFacetedMinMaxValues()?.[1]})`
            : ''
            }`}
          className="w-24 border shadow rounded"
        />
      </div>
      <div className="h-1" />
    </div>
  ) : filterVariant === 'select' ? (
    <select
      onChange={e => column.setFilterValue(e.target.value)}
      value={columnFilterValue?.toString()}
    >
      <option value="">All</option>
      {sortedUniqueValues.map(value => (
        //dynamically generated select options from faceted values feature
        <option value={value} key={value}>
          {value}
        </option>
      ))}
    </select>
  ) : (
    <>
      {/* Autocomplete suggestions from faceted values feature */}
      <datalist id={column.id + 'list'}>
        {sortedUniqueValues.map((value: any) => (
          <option value={value} key={value} />
        ))}
      </datalist>
      <DebouncedInput
        type="text"
        value={(columnFilterValue ?? '') as string}
        onChange={value => column.setFilterValue(value)}
        placeholder={`Search... (${column.getFacetedUniqueValues().size})`}
        className="min-w-36 w-full border shadow rounded"
        list={column.id + 'list'}
      />
      <div className="h-1" />
    </>
  )
}

// A typical debounced input react component
function DebouncedInput({
  value: initialValue,
  onChange,
  debounce = 500,
  ...props
}: {
  value: string | number
  onChange: (value: string | number) => void
  debounce?: number
} & Omit<React.InputHTMLAttributes<HTMLInputElement>, 'onChange'>) {
  const [value, setValue] = useState(initialValue)

  useEffect(() => {
    setValue(initialValue)
  }, [initialValue])

  useEffect(() => {
    const timeout = setTimeout(() => {
      onChange(value)
    }, debounce)

    return () => clearTimeout(timeout)
  }, [value])

  return (
    <input {...props} value={value} onChange={e => setValue(e.target.value)} />
  )
}
