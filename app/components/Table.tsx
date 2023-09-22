"use client"

import React, {Fragment, useMemo, useRef, useState} from "react"
import {useSession} from "next-auth/react"
import toast from "react-hot-toast"
import {
    MantineReactTable,
    type MRT_ColumnDef, MRT_Row,
    MRT_RowSelectionState,
    MRT_TableOptions,
    useMantineReactTable,
    createRow
} from "mantine-react-table"
import {ActionIcon, Box, Flex, MantineProvider, Stack, Tooltip} from "@mantine/core"
import {getTable} from "@/app/utils/clientRequests"
import {useMutation, useQuery, useQueryClient} from "@tanstack/react-query"
import {TableData} from "@/types/interfaces"
import {IconEdit, IconTrash} from "@tabler/icons-react"
import {Dialog, Transition} from "@headlessui/react"
import {ExclamationTriangleIcon} from "@heroicons/react/24/outline"
import Link from "next/link"
import {dateRange, rangeSlider} from "@/constants/filterFunctions"
import {oblastList} from "@/constants/filterSelectProps"
import {columnYellow} from "@/constants/commonColumnProps"
import dayjs from "dayjs"
import "dayjs/locale/ru"
import customParseFormat from "dayjs/plugin/customParseFormat"

dayjs.extend(customParseFormat)

export default function Table() {
    const session = useSession()

    const [modalOpen, setModalOpen] = useState(false)
    const cancelButtonRef = useRef(null)
    const [modalTableData, setModalTableData] = useState<TableData | null>(null)
    const queryClient = useQueryClient()

    const {
        data: fetchedData = [],
        isError: isLoadingDataError,
        isFetching: isFetchingData,
        isLoading: isLoadingData,
    } = useGetData()

    const {mutateAsync: createTableData, isLoading: isCreatingTableData} = useCreateTableData()
    const {mutateAsync: updateTableData, isLoading: isUpdatingTableData} = useUpdateTableData()
    const {mutateAsync: deleteTableData, isLoading: isDeletingTableData} = useDeleteTableData()

    const totalNGO = useMemo(
        () => fetchedData.reduce((acc, curr: any) => Number(acc) + Number(curr.ngo), 0),
        [fetchedData]
    )
    const totalArea = useMemo(
        () => fetchedData.reduce((acc, curr: any) => Number(acc) + Number(curr.area), 0),
        [fetchedData]
    )

    const dateToLocalFormat = (date: any) => date.toLocaleDateString("ru-RU", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric"
    })

    const columns = useMemo<MRT_ColumnDef<TableData>[]>(() => [
            {
                header: "ID",
                accessorKey: "id",
                size: 70,
                enableEditing: false,
                enableColumnFilter: false,
                enableGlobalFilter: false,
            },
            {
                header: "Область",
                accessorKey: "oblast",
                filterVariant: "multi-select",
                mantineFilterMultiSelectProps: {
                    data: oblastList
                },
                editVariant: "select",
                mantineEditSelectProps: {
                    data: oblastList,
                }
            },
            {
                header: "Район",
                accessorKey: "region",
                filterVariant: "multi-select",
                mantineFilterMultiSelectProps: {
                    data: fetchedData.map(e => e.region),
                },
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
                mantineFilterMultiSelectProps: {
                    //@ts-ignore
                    data: fetchedData.map(e => e.composition),
                },
            },
            {
                header: "Площа ділянки",
                accessorKey: "area",
                accessorFn: (row: any) => row.area ? Number(row.area).toFixed(2) : null,
                filterVariant: "range-slider",
                filterFn: "rangeSlider",
                mantineFilterRangeSliderProps: {
                    size: "lg",
                    precision: 4,
                    minRange: 0.1,
                    step: 0.1,
                    min: 0,
                    max: 100,
                    thumbSize: 15,
                },
                Cell: ({cell}: any) => cell.getValue(),
                Footer: () => (
                    <Stack className="flex flex-col justify-center items-center">
                        Загальна площа
                        <Box color="orange">{totalArea.toFixed(2)}</Box>
                    </Stack>
                ),
            },
            {
                header: "НГО",
                accessorKey: "ngo",
                accessorFn: (row: any) => row.ngo ? Number(row.ngo).toFixed(2) : null,
                filterVariant: "range-slider",
                filterFn: "rangeSlider",
                mantineFilterRangeSliderProps: () => ({
                    size: "lg",
                    minRange: 10,
                    min: 0,
                    max: 100000,
                    thumbSize: 15
                }),
                Cell: ({cell}: any) => cell.getValue(),
                Footer: () => (
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
                mantineFilterMultiSelectProps: {
                    //@ts-ignore
                    data: fetchedData.map(e => e.owner),
                },
            },
            {
                header: "Договір купівлі-продажу",
                accessorKey: "contract_sale",
            },
            {
                header: "Дата договору купівлі-продажу",
                id: "contract_sale_date",
                accessorFn: (originalRow: any) => originalRow.contract_sale_date ?
                    dateToLocalFormat(new Date(originalRow.contract_sale_date)) : "",
                filterVariant: "date-range",
                filterFn: "dateRange",
                Cell: ({cell}: any) => cell.getValue(),
                mantineFilterDateInputProps: {
                    locale: "ru",
                    valueFormat: "DD.MM.YYYY"
                },
                size: 350,
            },
            {
                header: "Витяг (номер запису в реєстрі)",
                accessorKey: "extract_land",
            },
            {
                header: "Дата витягу",
                id: "extract_land_date",
                accessorFn: (originalRow: any) => originalRow.extract_land_date ?
                    dateToLocalFormat(new Date(originalRow.extract_land_date)) : "",
                filterVariant: "date-range",
                filterFn: "dateRange",
                Cell: ({cell}: any) => cell.getValue(),
                mantineFilterDateInputProps: {
                    locale: "ru",
                    valueFormat: "DD.MM.YYYY"
                },
                size: 350,
            },
            {
                header: "Витрати на оформлення земельної ділянки",
                accessorKey: "expenses",
                accessorFn: (row: any) => row.expenses ? Number(row.expenses).toFixed(2) : null,
                filterVariant: "range-slider",
                filterFn: "rangeSlider",
                Cell: ({cell}) => cell.getValue() ? Number(cell.getValue()).toFixed(2) : null,
                mantineFilterRangeSliderProps: () => ({
                    size: "lg",
                    minRange: 10,
                    min: 0,
                    max: 10000,
                    thumbSize: 15
                }),
            },
            {
                header: "Наявність відсканованих документів",
                accessorKey: "document_land",
                filterVariant: "checkbox",
                size: 500,
            },
            {
                header: "Орендар",
                accessorKey: "tenant",
                filterVariant: "multi-select",
                mantineFilterMultiSelectProps: {
                    //@ts-ignore
                    data: fetchedData.map(e => e.tenant),
                },
                ...columnYellow
            },
            {
                header: "Договір оренди",
                accessorKey: "contract_lease",
                ...columnYellow
            },
            {
                header: "Дата договору оренди",
                accessorKey: "contract_lease_date",
                accessorFn: (originalRow: any) => originalRow.contract_lease_date ?
                    dateToLocalFormat(new Date(originalRow.contract_lease_date)) : "",
                filterVariant: "date-range",
                filterFn: "dateRange",
                Cell: ({cell}: any) => cell.getValue(),
                mantineFilterDateInputProps: {
                    locale: "ru",
                    valueFormat: "DD.MM.YYYY"
                },
                size: 350,
                ...columnYellow
            },
            {
                header: "Витяг (номер запису в реєстрі)",
                accessorKey: "extract_lease",
                ...columnYellow
            },
            {
                header: "Наявність відсканованих документів",
                accessorKey: "document_land_lease",
                filterVariant: "checkbox",
                size: 500,
                ...columnYellow
            },
        ],
        [totalNGO, totalArea]
    )

    const handleCreateTableData = async ({values, table}: any) => {
        const res = await toast.promise(
            createTableData(values),
            {
                loading: <b>Зберігається...</b>,
                success: <b>Інформація успішно додана!</b>,
                error: <b>Виникла помилка.</b>,
            }
        )

        if (res.ok) table.setCreatingRow(null)
    }

    const handleSaveTableData = async ({values, table}: any) => {
        const res = await toast.promise(
            updateTableData(values),
            {
                loading: <b>Зберігається...</b>,
                success: <b>Інформація успішно збережена!</b>,
                error: <b>Виникла помилка.</b>,
            }
        )

        if (res.ok) table.setEditingRow(null)
    }

    const openDeleteConfirmModal = async (row: MRT_Row<TableData>) => {
        const data: TableData = row.original
        setModalTableData(data)
        setModalOpen(true)
    }

    const table = useMantineReactTable({
        //@ts-ignore
        columns,
        data: fetchedData,
        enableColumnActions: false,
        initialState: {
            showColumnFilters: true,
            density: "md",
        },
        mantineSelectCheckboxProps: {
            color: "blue",
        },
        createDisplayMode: "row",
        editDisplayMode: "row",
        enableEditing: true,
        enableDensityToggle: false,
        enableFullScreenToggle: false,
        enableHiding: false,
        onEditingRowSave: handleSaveTableData,
        onCreatingRowSave: handleCreateTableData,
        getRowId: (row: any) => row.id,
        mantineTableProps: {
            striped: false,
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
            "mrt-row-actions": {
                header: "",
                size: 100,
            },
        },
        renderRowActions: ({row, table}) => (
            <Flex gap="md">
                <Tooltip label="Edit">
                    <ActionIcon onClick={() => table.setEditingRow(row)}>
                        <IconEdit/>
                    </ActionIcon>
                </Tooltip>
                <Tooltip label="Delete">
                    <ActionIcon color="red" onClick={() => openDeleteConfirmModal(row)}>
                        <IconTrash/>
                    </ActionIcon>
                </Tooltip>
            </Flex>
        ),
        filterFns: {
            dateRange: dateRange,
            rangeSlider: rangeSlider
        },
        state: {
            isLoading: isLoadingData,
            isSaving: isCreatingTableData || isUpdatingTableData || isDeletingTableData,
            showAlertBanner: isLoadingDataError,
            showProgressBars: isFetchingData,
        },

        renderTopToolbarCustomActions: ({table, row}: any) => (
            <div className="flex flex-row justify-between items-center">
                <button
                    className="flex-grow flex-shrink w-1/2 px-4 py-2 rounded bg-green-500 hover:bg-gradient-to-r hover:from-green-500 hover:to-green-400 text-white hover:ring-2 hover:ring-offset-2 hover:ring-green-400 transition-all ease-out duration-300"
                    onClick={() => {
                        table.setCreatingRow(
                            createRow(table, {
                                "extract_date": null,
                                "contract_sale_date": null,
                                "contract_lease_date": null,
                            })
                        )
                    }}
                >
                    <span className="relative text-center">Додати інформацію</span>
                </button>
                {session.data?.user.role === "admin" && (
                    <Link
                        className="flex-grow flex-shrink w-1/2 ml-4 px-4 py-2 rounded bg-blue-500 hover:bg-gradient-to-r hover:from-blue-500 hover:to-blue-400 text-white hover:ring-2 hover:ring-offset-2 hover:ring-blue-400 transition-all ease-out duration-300"
                        href="/dashboard"
                        style={{whiteSpace: "nowrap"}}
                    >
                        <span className="relative text-center">Панель адміністратора</span>
                    </Link>
                )}
            </div>
        ),
    })

    function useGetData() {
        return useQuery<TableData[]>({
            queryKey: ["table"],
            queryFn: async () => {
                return await getTable()
            },
            keepPreviousData: true,
            refetchInterval: 30000,
        })
    }

    function useCreateTableData() {
        return useMutation({
            mutationFn: async (tableData: TableData) => {
                const res = await fetch("/api/table", {
                    body: JSON.stringify(tableData),
                    method: "POST"
                })

                if (!res.ok) return Promise.reject(res)

                return Promise.resolve(res)
            },
            onSettled: () => queryClient.invalidateQueries({queryKey: ["table"]}),
        })
    }

    function useUpdateTableData() {
        return useMutation({
            mutationFn: async (tableData: TableData) => {
                const res = await fetch("/api/table", {
                    body: JSON.stringify(tableData),
                    method: "PUT"
                })

                if (!res.ok) return Promise.reject(res)

                return Promise.resolve(res)
            },
            onSettled: () => queryClient.invalidateQueries({queryKey: ["table"]}),
        })
    }

    function useDeleteTableData() {
        return useMutation({
            mutationFn: async (rowId: number) => {
                const res = await fetch("/api/table", {
                    body: JSON.stringify({id: rowId}),
                    method: "DELETE"
                })

                if (!res.ok) return Promise.reject(res)

                return Promise.resolve(res)
            },
            onSettled: () => {
                queryClient.invalidateQueries(["table"])
            },
        })
    }

    return (
        <MantineProvider
            theme={{
                colorScheme: "light",
                primaryColor: "blue",
                primaryShade: 9,
            }}
        >
            {modalOpen && <Transition.Root show={modalOpen} as={Fragment}>
                <Dialog as="div" className="relative z-10" initialFocus={cancelButtonRef} onClose={setModalOpen}>
                    <Transition.Child
                        as={Fragment}
                        enter="ease-out duration-300"
                        enterFrom="opacity-0"
                        enterTo="opacity-100"
                        leave="ease-in duration-200"
                        leaveFrom="opacity-100"
                        leaveTo="opacity-0"
                    >
                        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"/>
                    </Transition.Child>

                    <div className="fixed inset-0 z-10 w-screen overflow-y-auto">
                        <div
                            className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
                            <Transition.Child
                                as={Fragment}
                                enter="ease-out duration-300"
                                enterFrom="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
                                enterTo="opacity-100 translate-y-0 sm:scale-100"
                                leave="ease-in duration-200"
                                leaveFrom="opacity-100 translate-y-0 sm:scale-100"
                                leaveTo="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
                            >
                                <Dialog.Panel
                                    className="relative transform overflow-hidden rounded-lg bg-white text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg">
                                    <div className="bg-white px-4 pb-4 pt-5 sm:p-6 sm:pb-4">
                                        <div className="sm:flex sm:items-start">
                                            <div
                                                className="mx-auto flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-red-100 sm:mx-0 sm:h-10 sm:w-10">
                                                <ExclamationTriangleIcon className="h-6 w-6 text-red-600"
                                                                         aria-hidden="true"/>
                                            </div>
                                            <div className="mt-3 text-center sm:ml-4 sm:mt-0 sm:text-left">
                                                <Dialog.Title as="h3"
                                                              className="text-base font-semibold leading-6 text-gray-900">
                                                    Видалення інформації
                                                </Dialog.Title>
                                                <div className="mt-2">
                                                    <p className="text-sm text-gray-500">
                                                        Ви дійсно бажаєте видалити цю інформацію?
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="bg-gray-50 px-4 py-3 sm:flex sm:flex-row-reverse sm:px-6">
                                        <button
                                            type="button"
                                            className="inline-flex w-full justify-center rounded-md bg-red-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-red-500 sm:ml-3 sm:w-auto"
                                            onClick={async () => {
                                                setModalOpen(false)
                                                await toast.promise(
                                                    deleteTableData(Number(modalTableData?.id)),
                                                    {
                                                        loading: <b>Видаяється...</b>,
                                                        success: <b>Інформацію успішно видалено!</b>,
                                                        error: <b>Виникла помилка.</b>,
                                                    }
                                                )
                                                setModalTableData(null)
                                            }}
                                        >
                                            Видалити
                                        </button>
                                        <button
                                            type="button"
                                            className="mt-3 inline-flex w-full justify-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 sm:mt-0 sm:w-auto"
                                            onClick={() => setModalOpen(false)}
                                            ref={cancelButtonRef}
                                        >
                                            Відмінити
                                        </button>
                                    </div>
                                </Dialog.Panel>
                            </Transition.Child>
                        </div>
                    </div>
                </Dialog>
            </Transition.Root>}
            <MantineReactTable table={table}/>
        </MantineProvider>
    )
}
