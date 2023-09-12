"use client"

import React, {useEffect, useMemo, useState} from "react"
import {
    MantineReactTable,
    type MRT_ColumnDef, MRT_Row,
    MRT_RowSelectionState,
    MRT_TableOptions,
    useMantineReactTable
} from "mantine-react-table"
import {ActionIcon, Box, Button, MantineProvider, Stack} from "@mantine/core"
import {getTable} from "@/app/utils/clientRequests"

export default function Table() {
    const [tableData, setTableData] = useState([]);
    const [rowSelection, setRowSelection] = useState<MRT_RowSelectionState>({});
    const [validationErrors, setValidationErrors] = useState<
        Record<string, string | undefined>
    >({})

    useEffect(() => {
        async function fetchData() {
            const data = await getTable()
            setTableData(data)
        }

        fetchData()
    }, [])


    const totalNGO = useMemo(
        // @ts-ignore
        () => tableData.reduce((acc, curr) => acc + curr.ngo, 0),
        [tableData]
    )

    const columns = useMemo(() => [
        {
            header: "Область",
            accessorKey: "oblast",
            filterVariant: "multi-select",
        },
        {
            header: "Район",
            accessorKey: "region",
            filterVariant: "multi-select",
        },
        {
            header: "Кадастровий номер",
            accessorKey: "cadastral",
            size: 200,
        },
        {
            header: "Склад узгідь",
            accessorKey: "composition",
            filterVariant: "multi-select",
        },
        {
            accessorKey: "area",
            header: "Площа ділянки",
            filterVariant: "range-slider",
            mantineFilterRangeSliderProps: {
                size: "lg",
                precision: 4,
                minRange: 0.1,
                step: 0.1,
                min: 0,
                max: 100,
                thumbSize: 15,
            },

            Cell: ({cell}: any) => {
                return Number(cell.getValue()).toFixed(4)
            },
        },
        {
            header: "НГО",
            accessorKey: "ngo",
            filterVariant: "range-slider",
            filterFn: "betweenInclusive",
            mantineFilterRangeSliderProps: {
                size: "lg",
                precision: 2,
                minRange: 10,
                min: 0,
                max: 100000,
                thumbSize: 15,
            },
            Cell: ({cell}: any) => {
                return Number(cell.getValue()).toFixed(2)
            },
            Footer: (table: any) => (
                <Stack className="flex flex-col justify-center items-center">
                    Загальне НГО
                    <Box color="orange">{totalNGO.toFixed(2)}</Box>
                </Stack>
            ),
        },
        {
            header: "Власник / Орендодавець",
            accessorKey: "owner",
            filterVariant: "multi-select",
        },
        {
            header: "Договір купівлі-продажу",
            accessorKey: "contract",
        },
        {
            accessorFn: (originalRow: any) => new Date(originalRow.extract_date),
            id: "contract_date",
            header: "Дата договору купівлі-продажу",
            filterVariant: "date-range",
            size: 350,
            Cell: ({cell}: any) => {
                // @ts-ignore
                const dt = new Date(cell.getValue<Date>());
                return Date.parse(dt as any as string) ?
                    new Date(dt).toLocaleDateString("ru-RU", {day: "2-digit", month: "2-digit", year: "numeric"}) : null;
            },
        },
        {
            header: "Витяг (номер запису в реєстрі)",
            accessorKey: "extract",
        },
        {
            accessorFn: (originalRow: any) => new Date(originalRow.extract_date),
            id: "extract_date",
            header: "Дата витягу",
            filterVariant: "date-range",
            size: 350,
            Cell: ({cell}: any) => {
                // @ts-ignore
                const dt = new Date(cell.getValue<Date>());
                return Date.parse(dt as any as string) ?
                    new Date(dt).toLocaleDateString("ru-RU", {day: "2-digit", month: "2-digit", year: "numeric"}) : null;
            },
        },
        {
            header: "Витрати на оформлення земельної ділянки",
            accessorKey: "expenses",
            filterVariant: "range-slider",
            filterFn: "between",
        },
        {
            header: "Наявність відсканованих документів",
            accessorKey: "document",
            size: 500,
            enableClickToCopy: true,
        },
    ], [totalNGO]);

    const table = useMantineReactTable({
        // @ts-ignore
        columns,
        data: tableData,
        enableFacetedValues: true,
        initialState: {
            showColumnFilters: true,
            density: "md",
            isFullScreen: true,
        },
        mantineSelectCheckboxProps: {
            color: "blue",
        },
        createDisplayMode: "row",
        editDisplayMode: "row",
        enableEditing: true,
        getRowId: (row) => row.id,
        mantineTableProps: {
            striped: true,
            withColumnBorders: true,
            withBorder: true,
            sx: {
                tableLayout: "fixed"
            },
        },
        mantineTableBodyCellProps: {
            align: "center",
        },
        displayColumnDefOptions: {
            'mrt-row-actions': {
                header: '',
                size: 100,
            },
        },
        // renderTopToolbar: ({ table }) => {
        //     return (
        //         <Button>DEACTIVATE</Button>
        //     )
        // },
    });


    return (
        <MantineProvider
            theme={{
                colorScheme: "light",
                primaryColor: "blue",
                primaryShade: 9,
            }}
        >
            <MantineReactTable table={table}/>
        </MantineProvider>
    );
}
