"use client"

import React, {useEffect, useState} from "react"
import {
    useReactTable,
    ColumnResizeMode,
    getCoreRowModel,
    getFilteredRowModel,
    ColumnDef,
    flexRender,
    Column,
    Table
} from '@tanstack/react-table'
import {columns} from "@/constants/columns"
import {signOut} from "next-auth/react";
import {TableData} from "@/types/interfaces";

async function getTable() {
    const res = await fetch("/api/getTable", {
        method: "GET"
    })

    if (!res.ok) {
        console.log(res)
    }

    return res.json()
}

export default function Table() {
    const [columnFilters, setColumnFilters] = React.useState([])
    const [tableData, setTableData] = useState([])

    const table = useReactTable({
        data: tableData,
        columns,
        state: {
            columnFilters
        },
        getFilteredRowModel: getFilteredRowModel(),
        getCoreRowModel: getCoreRowModel(),
        defaultColumn: {
            size: 200,
            maxSize: 300
        },
        enableColumnFilters: true,
    })

    useEffect(() => {
        async function fetchData() {
            const data = await getTable()
            console.log(data)
            setTableData(data)
        }

        fetchData()
    }, [])


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
        const [value, setValue] = React.useState(initialValue)

        React.useEffect(() => {
            setValue(initialValue)
        }, [initialValue])

        React.useEffect(() => {
            const timeout = setTimeout(() => {
                onChange(value)
            }, debounce)

            return () => clearTimeout(timeout)
        }, [value])

        return (
            <input {...props} value={value} onChange={e => setValue(e.target.value)}/>
        )
    }

    function Filter({
                        column,
                        table,
                    }: {
        column: any
        table: any
    }) {
        const firstValue = table
            .getPreFilteredRowModel()
            .flatRows[0]?.getValue(column.id)

        const columnFilterValue = column.getFilterValue()

        const sortedUniqueValues = React.useMemo(
            () =>
                typeof firstValue === 'number'
                    ? []
                    : Array.from(column.getFacetedUniqueValues().keys()).sort(),
            [column.getFacetedUniqueValues()]
        )

        return typeof firstValue === 'number' ? (
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
                        placeholder={`Min ${
                            column.getFacetedMinMaxValues()?.[0]
                                ? `(${column.getFacetedMinMaxValues()?.[0]})`
                                : ''
                        }`}
                        className="w-24 border shadow rounded"
                    />
                    <DebouncedInput
                        type="number"
                        min={Number(column.getFacetedMinMaxValues()?.[0] ?? '')}
                        max={Number(column.getFacetedMinMaxValues()?.[1] ?? '')}
                        value={(columnFilterValue as [number, number])?.[1] ?? ''}
                        onChange={value =>
                            column.setFilterValue((old: [number, number]) => [old?.[0], value])
                        }
                        placeholder={`Max ${
                            column.getFacetedMinMaxValues()?.[1]
                                ? `(${column.getFacetedMinMaxValues()?.[1]})`
                                : ''
                        }`}
                        className="w-24 border shadow rounded"
                    />
                </div>
                <div className="h-1"/>
            </div>
        ) : (
            <>
                <datalist id={column.id + 'list'}>
                    {sortedUniqueValues.slice(0, 5000).map((value: any) => (
                        <option value={value} key={value}/>
                    ))}
                </datalist>
                <DebouncedInput
                    type="text"
                    value={(columnFilterValue ?? '') as string}
                    onChange={value => column.setFilterValue(value)}
                    placeholder={`Search... (${column.getFacetedUniqueValues().size})`}
                    className="w-36 border shadow rounded"
                    list={column.id + 'list'}
                />
                <div className="h-1"/>
            </>
        )
    }

    return (
        <>
            <button onClick={() => signOut()}>Sign out</button>
            <table style={{tableLayout: 'fixed'}}>
                <thead>
                {table.getHeaderGroups().map((headerGroup) => (
                    <tr key={headerGroup.id}>
                        {headerGroup.headers.map((header) => {
                            return (
                                <th
                                    key={header.id}
                                    colSpan={header.colSpan}
                                >
                                    {header.isPlaceholder ? null : (
                                        <>
                                            {flexRender(
                                                header.column.columnDef.header,
                                                header.getContext()
                                            )}
                                        </>
                                    )}
                                    {header.column.getCanFilter() ? (
                                        <div>
                                            {/*<Filter column={header.column} table={table} />*/}
                                            <input type="text" onChange={event =>
                                                header.column.setFilterValue((old: [number, number]) => [old?.[0], event.target.value])
                                            }/>
                                        </div>
                                    ) : null}

                                </th>
                            )
                        })}
                    </tr>
                ))}
                </thead>
                <tbody>
                {table.getRowModel().rows.map((row) => (
                    <tr key={row.id}>
                        {row.getVisibleCells().map((cell) => {
                            return (
                                <td
                                    key={cell.id}
                                    style={{overflow: 'hidden', minWidth: '100px', maxWidth: '200px'}}
                                >
                                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                </td>
                            )
                        })}
                    </tr>
                ))}
                </tbody>
            </table>
        </>
    )
}
