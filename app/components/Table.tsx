"use client"

import React, {useEffect, useMemo, useState} from "react"
import {useSession} from "next-auth/react"
import toast from "react-hot-toast"
import {
    MantineReactTable,
    type MRT_ColumnDef, MRT_Row,
    useMantineReactTable,
    createRow
} from "mantine-react-table"
import {ActionIcon, Box, Input, MantineProvider, Modal, Stack, Tooltip, Pagination} from "@mantine/core"
import {getTable} from "@/app/utils/clientRequests"
import {useMutation, useQuery, useQueryClient} from "@tanstack/react-query"
import {TableData, RentPayments} from "@/types/interfaces"
import {IconEdit, IconTrash} from "@tabler/icons-react"
import Link from "next/link"
import {dateRange, documentFilterFn, leasedFilterFn, range, rangeSlider} from "@/app/utils/filterFunctions"
import {oblastList} from "@/constants/filterSelectProps"
import {columnBlue} from "@/constants/commonColumnProps"
import dayjs from "dayjs"
import "dayjs/locale/ru"
import customParseFormat from "dayjs/plugin/customParseFormat"
import TickIcon from "@/app/components/TickIcon"
import CrossIcon from "@/app/components/CrossIcon"
import PieChart from "@/app/components/PieChart"
import {useDisclosure} from "@mantine/hooks"
import localization from "@/constants/tableLocalization"
import {notifyError} from "@/app/utils/notifications"
import {calculateRentPayments, rentPaymentsInitial} from "@/app/utils/rentPayments"
import ExclamationIcon from "@/app/components/ExclamationIcon"

dayjs.extend(customParseFormat)

export default function Table() {
    const session = useSession()
    const queryClient = useQueryClient()

    const [isMobile, setIsMobile] = useState(false)

    const [openedDeleteModal, {open: openDeleteModal, close: closeDeleteModal}] = useDisclosure(false)
    const [deleteModalData, setDeleteModalData] = useState<TableData | null>(null)

    const [openedRentModal, {open: openRentModal, close: closeRentModal}] = useDisclosure(false)
    const [rentModalData, setRentModalData] = useState<any>(null)

    const [rentAdvanceInput, setRentAdvanceInput] = useState<number>(0)
    const [rentPeriodInput, setRentPeriodInput] = useState<number>(0)
    const [rentPriceInput, setRentPriceInput] = useState<number>(0)

    const [rentPayments, setRentPayments] = useState<(RentPayments[])>([])
    const [editedRentPayments, setEditedRentPayments] = useState<(RentPayments[])>([])
    const [editedRowIndex, setEditedRowIndex] = useState(-1)
    const [rentPaymentsActivePage, setRentPaymentActivePage] = useState(1)

    const [columnFilters, setColumnFilters] = useState([])
    const [filteredData, setFilteredData] = useState([])
    const [slidersRange, setSlidersRange] = useState({
        area: {min: 0, max: 100},
        ngo: {min: 0, max: 250000},
        expenses: {min: 0, max: 10000}
    })

    const {
        data: fetchedData = [],
        isError: isLoadingDataError,
        isFetching: isFetchingData,
        isLoading: isLoadingData,
    } = useGetData()

    const {mutateAsync: createTableData, isLoading: isCreatingTableData} = useCreateTableData()
    const {mutateAsync: updateTableData, isLoading: isUpdatingTableData} = useUpdateTableData()
    const {mutateAsync: deleteTableData, isLoading: isDeletingTableData} = useDeleteTableData()

    useEffect(() => {
        const handleResize = () => {
            setIsMobile(window.innerWidth <= 768)
        }

        handleResize()
        window.addEventListener('resize', handleResize)

        return () => {
            window.removeEventListener('resize', handleResize)
        }
    }, [])

    useEffect(() => {
        if (fetchedData.length > 0) {
            // @ts-ignore
            setFilteredData(table.getFilteredRowModel().rows)

            setSlidersRange({
                area: {
                    min: Math.min(...fetchedData.map((e: any) => parseFloat(e.area) || 0)) || 0,
                    max: Math.max(...fetchedData.map((e: any) => parseFloat(e.area) || 0)) || 100
                },
                ngo: {
                    min: Math.min(...fetchedData.map((e: any) => parseFloat(e.ngo) || 0)) || 0,
                    max: Math.max(...fetchedData.map((e: any) => parseFloat(e.ngo) || 0)) || 250000
                },
                expenses: {
                    min: Math.min(...fetchedData.map((e: any) => parseFloat(e.expenses) || 0)) || 0,
                    max: Math.max(...fetchedData.map((e: any) => parseFloat(e.expenses) || 0)) || 10000,
                }
            })
        }
    }, [fetchedData])

    // Set filteredData and slidersRange on columnFilters change
    useEffect(() => {
        // @ts-ignore
        setFilteredData(table.getFilteredRowModel().rows)

        if (fetchedData.length > 0) {
            setSlidersRange({
                area: {
                    min: Math.min(...fetchedData.map((e: any) => parseFloat(e.area) || 0)) || 0,
                    max: Math.max(...fetchedData.map((e: any) => parseFloat(e.area) || 0)) || 100
                },
                ngo: {
                    min: Math.min(...fetchedData.map((e: any) => parseFloat(e.ngo) || 0)) || 0,
                    max: Math.max(...fetchedData.map((e: any) => parseFloat(e.ngo) || 0)) || 250000
                },
                expenses: {
                    min: Math.min(...fetchedData.map((e: any) => parseFloat(e.expenses) || 0)) || 0,
                    max: Math.max(...fetchedData.map((e: any) => parseFloat(e.expenses) || 0)) || 10000,
                }
            })
        }
    }, [columnFilters])

    // Total NGO footer
    const totalNGO = useMemo(() => {
        return filteredData.reduce((a, b: any) => {
            return !isNaN(parseFloat(b.original.ngo)) ? a + parseFloat(b.original.ngo) : a
        }, 0)
    }, [filteredData])

    // Total Area footer
    const totalArea = useMemo(() => {
        return filteredData.reduce((a, b: any) => {
            return !isNaN(parseFloat(b.original.area)) ? a + parseFloat(b.original.area) : a
        }, 0)
    }, [filteredData])

    // Leased chart pie stats
    const leasedStats = useMemo(
        () => {
            //@ts-ignore
            const leased = filteredData.filter(item => item.original.contract_lease).length
            const notLeased = filteredData.length - leased
            const totalCount = filteredData.length

            const leasedPercentage = Number(((leased / totalCount) * 100).toFixed(2))
            const notLeasedPercentage = Number(((notLeased / totalCount) * 100).toFixed(2))

            return [leasedPercentage, notLeasedPercentage]
        }, [filteredData]
    )

    // Initial Rent Payments (from DB)
    useEffect(() => {
        if (openedRentModal && rentModalData && fetchedData) {
            const row: any = {...fetchedData.find((data) => data.id === rentModalData?.id)}

            setRentAdvanceInput(!isNaN(parseFloat(row.rent_advance)) ? row.rent_advance : 0)
            setRentPeriodInput(!isNaN(parseFloat(row.rent_period)) ? row.rent_period : 0)
            setRentPriceInput(!isNaN(parseFloat(row.rent_price)) ? row.rent_price : 0)
            setRentPayments(row.rent_payments || [])
            setRentPaymentActivePage(1)
            setEditedRowIndex(-1)
        }
    }, [openedRentModal])

    const dateToLocalFormat = (date: any) => date.toLocaleDateString("ru-RU", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric"
    })

    const calculateRentValue = (row: any) => {
        if (!row.rent_payments) {
            return null
        }

        return row.rent_payments
            .filter((payment: any) => payment && !isNaN(payment.rentPrice) && !payment.rentIsPaid)
            .reduce((total: any, payment: any) => total + Number(payment.rentPrice), 0)
            .toFixed(2)
    }

    const getUpdatedRentPayments = () => {
        return rentPayments.map((payment) => {
            const editedPayment = editedRentPayments.find(
                (editedPayment) => editedPayment.rentYear === payment.rentYear
            )

            return editedPayment ? editedPayment : payment
        })
    }

    const rentIsPaidIcon = (
        rentIsPaid: boolean | undefined,
        rentRow: RentPayments
    ) => {
        return rentIsPaid ? (
            <TickIcon
                width={32}
                height={32}
                onClick={() => handleEditRentStatus(rentRow)}
            />
        ) : (
            <CrossIcon
                width={32}
                height={32}
                onClick={() => handleEditRentStatus(rentRow)}
            />
        )
    }

    const isDebtor = (row: any) => {
        const rentPayments = row.rent_payments
        const isDebt = (rentPayments: RentPayments[]) => {
            return rentPayments.some((payment) => {
                const nextYearDate = dayjs(`${payment.rentYear + 1}-01-01`)
                return payment.rentPrice > 0 && !payment.rentIsPaid && dayjs().isAfter(nextYearDate)
            })
        }

        return (
            <div className="flex items-center justify-center">
                <div>{row.id}</div>
                {rentPayments && isDebt(rentPayments) &&
                    <ExclamationIcon width={16} height={16} style={{position: "absolute", marginLeft: "-48px"}}/>}
            </div>
        )
    }

    const columns = useMemo<MRT_ColumnDef<TableData>[]>(() => [
            {
                header: "ID",
                accessorKey: "id",
                accessorFn: (row: any) => isDebtor(row),
                enableEditing: false,
                enableColumnFilter: false,
                enableGlobalFilter: false,
                size: 75,
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
                },
                size: 200,
            },
            {
                header: "Район",
                accessorKey: "region",
                filterVariant: "multi-select",
                mantineFilterMultiSelectProps: {
                    //@ts-ignore
                    data: [...new Set(fetchedData.map((e) => e.region ? e.region : null))]
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
                    data: [...new Set(fetchedData.map((e) => e.composition))]
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
                    min: slidersRange.area.min,
                    max: slidersRange.area.max,
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
                    precision: 4,
                    minRange: 1,
                    min: slidersRange.ngo.min,
                    max: slidersRange.ngo.max,
                    thumbSize: 15
                }),
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
                    data: [...new Set(fetchedData.map((e) => e.owner))]
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
                    min: slidersRange.expenses.min,
                    max: slidersRange.expenses.max,
                    thumbSize: 15
                }),
            },
            {
                header: "Наявність відсканованих документів",
                accessorKey: "document_land",
                filterVariant: "checkbox",
                filterFn: documentFilterFn,
                size: 500,
            },
            {
                header: "Орендар",
                accessorKey: "tenant",
                filterVariant: "multi-select",
                mantineFilterMultiSelectProps: {
                    //@ts-ignore
                    data: [...new Set(fetchedData.map((e) => e.tenant))]
                },
                ...columnBlue
            },
            {
                header: "Договір оренди",
                accessorKey: "contract_lease",
                ...columnBlue
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
                    valueFormat: "DD.MM.YYYY",
                },
                size: 350,
                ...columnBlue
            },
            {
                header: "Витяг (номер запису в реєстрі)",
                accessorKey: "extract_lease",
                ...columnBlue
            },
            {
                header: "Орендна плата",
                accessorKey: "rent",
                accessorFn: (row: any) => row.rent_payments ?
                    calculateRentValue(row) : null,
                enableEditing: false,
                filterVariant: "range",
                filterFn: "range",
                Cell: ({cell, row}: any) => (
                    <div
                        className={`clickable-cell ${cell.getValue() === null ? 'empty-cell' : ''}`}
                        onClick={() => {
                            const {
                                id,
                                rent_period,
                                rent_price,
                                rent_advance,
                                contract_lease_date,
                                rent_payments
                            } = row.original

                            if (rent_period || rent_price || rent_advance || contract_lease_date || rent_payments) {
                                setRentModalData({
                                    id,
                                    contractLeaseDate: contract_lease_date,
                                })

                                openRentModal()
                            } else {
                                notifyError("Спочатку необхідно вказати дату договору оренди")
                            }
                        }}
                    >
                        {cell.getValue()}
                    </div>
                ),
                size: 200,
                ...columnBlue
            },
            {
                header: "Здано в оренду",
                accessorKey: "isLeased",
                enableEditing: false,
                accessorFn: (originalRow: any) => originalRow.contract_lease ?
                    <TickIcon width={32} height={32}/> : <CrossIcon width={32} height={32}/>,
                filterVariant: "checkbox",
                filterFn: leasedFilterFn,
                mantineFilterCheckboxProps: {
                    label: "",
                    size: "lg",
                    style: {
                        position: "relative",
                        marginTop: "30px",
                        top: "50%",
                        left: "50%",
                        transform: "translate(-50%, -50%)",
                    },
                },
                Footer: () => <PieChart values={leasedStats}/>,
                ...columnBlue
            },
            {
                header: "Наявність відсканованих документів",
                accessorKey: "document_land_lease",
                filterVariant: "checkbox",
                filterFn: documentFilterFn,
                size: 500,
                ...columnBlue
            },
        ], [fetchedData, filteredData, totalNGO, totalArea, leasedStats, rentPayments, slidersRange.ngo.min, slidersRange.ngo.max, slidersRange.area.min, slidersRange.area.max, slidersRange.expenses.min, slidersRange.expenses.max]
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
        setDeleteModalData(data)
        openDeleteModal()
    }

    useEffect(() => {
        if (rentModalData) {
            updateRentPayments()
        }

    }, [rentAdvanceInput, rentPeriodInput, rentPriceInput])

    const updateRentPayments = () => {
        if (rentPayments.length < 1) {
            const calculatedRentPayments = rentPaymentsInitial({
                rentAdvance: rentAdvanceInput,
                rentPeriod: rentPeriodInput,
                rentPrice: rentPriceInput,
                contractLeaseDate: rentModalData.contractLeaseDate,
                rentPayments: rentPayments,
            })

            setRentPayments(calculatedRentPayments)
        } else {

            const calculatedRentPayments = calculateRentPayments({
                rentAdvance: rentAdvanceInput,
                rentPeriod: rentPeriodInput,
                rentPrice: rentPriceInput,
                contractLeaseDate: rentModalData.contractLeaseDate,
                rentPayments: rentPayments,
            })

            setRentPayments(calculatedRentPayments)
        }

    }

    const handleRentInputsChange = (e: any) => {
        if (e.target.name === "rentAdvance") {
            setRentAdvanceInput(parseFloat(e.target.value))
        } else if (e.target.name === "rentPeriod") {
            setRentPeriodInput(parseInt(e.target.value, 10))
        } else if (e.target.name === "rentPrice") {
            setRentPriceInput(parseFloat(e.target.value))
        }
    }

    const handleEditRentPrice = (rentPaymentsRow: RentPayments, newValue: string) => {
        const updatedRentPayments: RentPayments[] = [...editedRentPayments]

        const rowIndex = updatedRentPayments.findIndex((e) => e.rentYear === rentPaymentsRow.rentYear)

        if (rowIndex !== -1) {
            updatedRentPayments[rowIndex].rentPrice = Number(newValue)
        } else {
            updatedRentPayments.push({
                ...rentPaymentsRow,
                rentPrice: Number(newValue),
            })
        }

        setEditedRentPayments(updatedRentPayments)
    }

    const handleEditRentStatus = (rentPaymentsRow: RentPayments) => {
        const updatedRentPayments: RentPayments[] = [...editedRentPayments]

        const rowIndex = updatedRentPayments.findIndex((e) => e.rentYear === rentPaymentsRow.rentYear)

        if (rowIndex !== -1) {
            updatedRentPayments[rowIndex].rentIsPaid = !updatedRentPayments[rowIndex].rentIsPaid
        } else {
            updatedRentPayments.push({
                ...rentPaymentsRow,
                rentIsPaid: !rentPaymentsRow.rentIsPaid,
            })
        }

        setEditedRentPayments(updatedRentPayments)
    }


    const table = useMantineReactTable({
        // @ts-ignore
        columns,
        data: fetchedData,
        enableColumnActions: false,
        initialState: {
            showColumnFilters: true,
            density: "md",
            isFullScreen: true
        },
        localization: localization,
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
        // @ts-ignore
        onColumnFiltersChange: setColumnFilters,
        getRowId: (row: any) => row.id,
        mantineTableBodyRowProps: ({row}) => ({
            onDoubleClick: () => {
                table.setEditingRow(row)
            },
        }),
        mantineTableProps: {
            withColumnBorders: true,
            withBorder: true,
            sx: {
                tableLayout: "fixed"
            }
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
            <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', alignItems: 'center'}}>
                <Tooltip label="Відредагувати">
                    <ActionIcon onClick={() => table.setEditingRow(row)}>
                        <IconEdit/>
                    </ActionIcon>
                </Tooltip>
                <Tooltip label="Видалити">
                    <ActionIcon color="red" onClick={() => openDeleteConfirmModal(row)}>
                        <IconTrash/>
                    </ActionIcon>
                </Tooltip>
            </div>
        ),
        filterFns: {
            dateRange: dateRange,
            range: range,
            rangeSlider: rangeSlider,
            leasedFilterFn: leasedFilterFn,
            documentFilterFn: documentFilterFn,
        },
        state: {
            columnFilters: columnFilters,
            isLoading: isLoadingData,
            isSaving: isCreatingTableData || isUpdatingTableData || isDeletingTableData,
            showAlertBanner: isLoadingDataError,
            showProgressBars: isFetchingData,
        },

        renderTopToolbarCustomActions: ({table, row}: any) => (
            <div className="flex flex-row justify-between items-center">
                <button
                    className={
                        "flex-grow flex-shrink  rounded bg-green-500 hover:bg-gradient-to-r hover:from-green-500 hover:to-green-400 text-white hover:ring-2 hover:ring-offset-2 hover:ring-green-400 transition-all ease-out duration-300 " +
                        (isMobile ? "w-1/4 px-0 py-2" : "w-1/2 px-4 py-2")
                    }
                    onClick={() => {
                        table.setCreatingRow(
                            createRow(table, {})
                        )
                    }}
                >
                    <span className="relative text-center">Додати інформацію</span>
                </button>
                {session.data?.user.role === "admin" && (
                    <Link
                        className={
                            "flex-grow flex-shrink ml-4 px-4 py-2 rounded bg-blue-500 hover:bg-gradient-to-r hover:from-blue-500 hover:to-blue-400 text-white hover:ring-2 hover:ring-offset-2 hover:ring-blue-400 transition-all ease-out duration-300 " +
                            (isMobile ? "w-1/4" : "w-1/2")
                        }
                        href="/dashboard"
                        style={{
                            whiteSpace: isMobile ? "normal" : "nowrap",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                        }}
                    >
                        <span className={"relative text-center"}>Панель адміністратора</span>
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
                // @ts-ignore
                const id = tableData.id.props ? tableData.id.props.children[0].props.children : tableData.id

                const formattedTableData = {
                    ...tableData,
                    id: id,
                }

                delete formattedTableData.isLeased
                delete formattedTableData.rent

                const res = await fetch("/api/table", {
                    body: JSON.stringify(formattedTableData),
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
                // @ts-ignore
                const id = tableData.id.props ? tableData.id.props.children[0].props.children : tableData.id

                const formattedTableData = {
                    ...tableData,
                    id,
                }

                delete formattedTableData.isLeased
                delete formattedTableData.rent

                const res = await fetch("/api/table", {
                    body: JSON.stringify(formattedTableData),
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
            <Modal
                opened={openedDeleteModal}
                onClose={() => {
                    setDeleteModalData(null)
                    closeDeleteModal()
                }}
                title={
                    <div className="flex flex-row items-center justify-center">
                        <div
                            className="flex w-7 h-7 flex-shrink-0 items-center justify-center rounded-full bg-red-100 sm:mx-0 sm:h-7 sm:w-7">
                            <ExclamationIcon width={16} height={16}/>
                        </div>
                        <p className="ml-1.5 text-xl font-bold">Видалення інформації</p>
                    </div>
                }
                size="xs"
            >
                <div className="flex justify-center align-top bg-white sm:p-0 sm:pb-5 sm:pl-5">
                    <div className="flex align-top sm:flex sm:items-start">
                        <div className="mt-0 text-center sm:ml-4 sm:mt-0 sm:text-left">
                            <p className="text-sm font-semibold text-gray-600 leading-5">
                                Ви дійсно бажаєте видалити цю інформацію?
                            </p>
                        </div>
                    </div>
                </div>
                <div className="mt-4 px-4 flex flex-row-reverse sm:mt-1 sm:px-3 sm:flex sm:flex-row-reverse">
                    <button
                        type="button"
                        className="inline-flex w-full justify-center rounded-md bg-red-600 ml-3 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-red-500 sm:ml-3 sm:w-auto"
                        onClick={async () => {
                            closeDeleteModal()
                            await toast.promise(deleteTableData(Number(deleteModalData?.id)), {
                                loading: <b>Видаяється...</b>,
                                success: <b>Інформацію успішно видалено!</b>,
                                error: <b>Виникла помилка.</b>,
                            })
                            setDeleteModalData(null)
                        }}
                    >
                        Видалити
                    </button>
                    <button
                        type="button"
                        className="inline-flex w-full justify-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 sm:mt-0 sm:w-auto"
                        onClick={closeDeleteModal}
                    >
                        Скасувати
                    </button>
                </div>
            </Modal>
            <Modal
                opened={openedRentModal}
                onClose={() => {
                    setRentModalData(null)
                    setRentAdvanceInput(0)
                    setRentPeriodInput(0)
                    setRentPriceInput(0)
                    setRentPayments([])
                    setEditedRentPayments([])
                    closeRentModal()
                }}
                title={<p className="text-xl font-bold">Деталі орендної плати</p>}
                size="sm"
            >
                {rentModalData && (
                    <div>
                        <div className="flex flex-row items-center mb-4">
                            <p className="text-md font-semibold w-32">Аванс</p>
                            <Input
                                type="number"
                                name="rentAdvance"
                                value={rentAdvanceInput}
                                onChange={handleRentInputsChange}
                                className="w-20"
                            />
                        </div>
                        <div className="flex flex-row items-center mb-4">
                            <p className="text-md font-semibold w-32">Термін оренди</p>
                            <Input
                                type="number"
                                name="rentPeriod"
                                value={rentPeriodInput}
                                onChange={handleRentInputsChange}
                                className="w-20"
                            />
                        </div>
                        <div className="flex flex-row items-center mb-4">
                            <p className="text-md font-semibold w-32">Плата (за рік)</p>
                            <Input
                                type="number"
                                name="rentPrice"
                                value={rentPriceInput}
                                onChange={handleRentInputsChange}
                                className="w-20"
                            />
                        </div>
                        {rentModalData?.contractLeaseDate ? (
                            <div className="flex flex-col items-start">
                                <table className="border-collapse border border-slate-400 mt-2">
                                    <thead>
                                    <tr>
                                        <th className="border border-slate-300 p-4 w-24">Рік</th>
                                        <th className="border border-slate-300 p-4 w-40">Сума до сплати</th>
                                        <th className="border border-slate-300 p-4" style={{width: "74px"}}></th>
                                    </tr>
                                    </thead>
                                    <tbody>
                                    {rentPayments
                                        ?.slice(
                                            (rentPaymentsActivePage - 1) * 5,
                                            Math.min((rentPaymentsActivePage - 1) * 5 + 5, rentPayments.length)
                                        )
                                        .map((rentRow, i) => (
                                            <tr key={i}>
                                                <td className="border border-slate-300 p-4 text-center">
                                                    {rentRow.rentYear}
                                                </td>
                                                <td
                                                    className="border border-slate-300 p-4 text-center w-20"
                                                    style={{height: "69px"}}
                                                    onClick={() => {
                                                        setEditedRowIndex(i)
                                                    }}
                                                    onBlur={() => setEditedRowIndex(-1)}
                                                >
                                                    {i === editedRowIndex ? (
                                                        <Input
                                                            type="text"
                                                            style={{
                                                                width: "100%",
                                                                height: "100%",
                                                                margin: 0,
                                                                padding: "0",
                                                                boxSizing: "border-box"
                                                            }}
                                                            value={
                                                                editedRentPayments.find((e) => e.rentYear === rentRow.rentYear)?.rentPrice?.toString()
                                                                || rentRow.rentPrice.toString()
                                                            }
                                                            onChange={(e) => handleEditRentPrice(rentRow, e.target.value)}
                                                        />
                                                    ) : editedRentPayments.find((e) => e.rentYear === rentRow.rentYear)?.rentPrice !== undefined
                                                        ? editedRentPayments.find((e) => e.rentYear === rentRow.rentYear)?.rentPrice
                                                        : rentRow.rentPrice
                                                    }
                                                </td>
                                                <td className="w-16 border border-slate-300">
                                                    <div className="flex justify-center items-center h-full">
                                                        {editedRentPayments.find((e) => e.rentYear === rentRow.rentYear) ? (
                                                            rentIsPaidIcon(
                                                                editedRentPayments.find((e) => e.rentYear === rentRow.rentYear)?.rentIsPaid,
                                                                rentRow
                                                            )
                                                        ) : (
                                                            rentIsPaidIcon(rentRow.rentIsPaid, rentRow)
                                                        )}
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                                <div className="flex justify-center mt-3.5">
                                    <Pagination
                                        value={rentPaymentsActivePage}
                                        onChange={setRentPaymentActivePage}
                                        total={10}
                                        size="md"
                                        style={isMobile ? {gap: 1.5, margin: 0} : {gap: 5, margin: 0}}
                                    />
                                </div>
                            </div>
                        ) : (
                            <p className="text-md text-red-500 font-bold mt-8">
                                Вкажіть дату договору оренди в таблиці
                            </p>
                        )}
                        <button
                            className="mt-6 w-full px-6 py-2 font-semibold rounded bg-green-500 hover:bg-gradient-to-r hover:from-green-500 hover:to-green-400 text-white hover:ring-2 hover:ring-offset-2 hover:ring-green-400 transition-all ease-out duration-300"
                            style={{whiteSpace: "nowrap"}}
                            onClick={async () => {
                                const updatedRentPayments = getUpdatedRentPayments()
                                const updatedRentDetails = {
                                    id: rentModalData?.id,
                                    rent_advance: Number(rentAdvanceInput),
                                    rent_period: Number(rentPeriodInput),
                                    rent_price: Number(rentPriceInput),
                                    rent_payments: updatedRentPayments || null,
                                }
                                const res = await toast.promise(updateTableData(updatedRentDetails), {
                                    loading: <b>Зберігається...</b>,
                                    success: <b>Інформація успішно збережена!</b>,
                                    error: <b>Виникла помилка.</b>,
                                })
                                if (res.ok) {
                                    setEditedRentPayments([])
                                    setRentPayments(updatedRentPayments)
                                }
                            }}
                        >
                            Зберегти
                        </button>
                    </div>
                )}
            </Modal>
            <MantineReactTable table={table}/>
        </MantineProvider>
    )
}
