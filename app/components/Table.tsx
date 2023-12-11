"use client";

import React, {useEffect, useMemo, useState} from "react";
import {useSession} from "next-auth/react";
import toast from "react-hot-toast";
import {createRow, MantineReactTable, type MRT_ColumnDef, MRT_Row, useMantineReactTable} from "mantine-react-table";
import {
    ActionIcon,
    Box, Input,
    MantineProvider,
    Modal, NumberInput,
    Pagination,
    Stack,
    Text,
    Textarea,
    Tooltip
} from "@mantine/core";
import {getTable} from "@/app/utils/clientRequests";
import {useMutation, useQuery, useQueryClient} from "@tanstack/react-query";
import {RentPayment, TableData} from "@/types/interfaces";
import {IconEdit, IconTrash} from "@tabler/icons-react";
import Link from "next/link";
import {dateRange, documentFilterFn, leasedFilterFn, range, rangeSlider} from "@/app/utils/filterFunctions";
import {oblastList} from "@/constants/filterSelectProps";
import {columnBlue} from "@/constants/commonColumnProps";
import dayjs from "dayjs";
import "dayjs/locale/ru";
import customParseFormat from "dayjs/plugin/customParseFormat";
import TickIcon from "@/app/components/TickIcon";
import CrossIcon from "@/app/components/CrossIcon";
import PieChart from "@/app/components/PieChart";
import {useDisclosure} from "@mantine/hooks";
import localization from "@/constants/tableLocalization";
import {notifyError, notifySuccess} from "@/app/utils/notifications";
import ExclamationIcon from "@/app/components/ExclamationIcon";
import {EditCadastralInput, EditDateRange, EditNumberInput, EditTextArea} from "./CustomEditComponents";
import dateToLocalFormat from "../utils/dateToLocalFormat";
import {calculateRentValuePaid, calculateRentValueNotPaid} from "@/app/utils/tableCalculations";
import {calculateRentPayments, rentPaymentsInitial} from "@/app/utils/rentPayments";
import {validateCadastral} from "@/app/utils/validateInputs";
import isValidDate from "@/app/utils/isValidDate";
import {DatePickerInput} from "@mantine/dates";


dayjs.extend(customParseFormat);

export default function Table() {
    const session = useSession();
    const queryClient = useQueryClient();

    const [isMobile, setIsMobile] = useState(false);

    const [openedDeleteModal, {open: openDeleteModal, close: closeDeleteModal}] = useDisclosure(false);
    const [deleteModalData, setDeleteModalData] = useState<TableData | null>(null);

    const [openedRentModal, {open: openRentModal, close: closeRentModal}] = useDisclosure(false);
    const [rentModalData, setRentModalData] = useState<any>(null);
    const [rentDetailsCreating, setRentDetailsCreating] = useState<any>({});

    const [rentAdvanceInput, setRentAdvanceInput] = useState<number>(0);
    const [rentPeriodInput, setRentPeriodInput] = useState<number>(0);
    const [rentPriceInput, setRentPriceInput] = useState<number>(0);
    const [rentPaymentsPerYearInput, setRentPaymentsPerYearInput] = useState<number>(1);

    const [rentPayments, setRentPayments] = useState<(RentPayment[])>([]);
    const [editedRentPayments, setEditedRentPayments] = useState<any>([]);
    const [rentPaymentsActivePage, setRentPaymentActivePage] = useState(1);
    const [rentPaymentsTotalPages, setRentPaymentsTotalPages] = useState<number>(1);

    const [editingRow, setEditingRow] = useState();
    const [columnFilters, setColumnFilters] = useState([]);
    const [filteredData, setFilteredData] = useState([]);
    const [slidersRange, setSlidersRange] = useState({
        area: {min: 0, max: 100},
        ngo: {min: 0, max: 250000},
        expenses: {min: 0, max: 10000}
    });

    const {
        data: fetchedData = [],
        isError: isLoadingDataError,
        isFetching: isFetchingData,
        isLoading: isLoadingData,
    } = useGetData();

    const {mutateAsync: createTableData, isLoading: isCreatingTableData} = useCreateTableData();
    const {mutateAsync: updateTableData, isLoading: isUpdatingTableData} = useUpdateTableData();
    const {mutateAsync: deleteTableData, isLoading: isDeletingTableData} = useDeleteTableData();

    useEffect(() => {
        const handleResize = () => {
            setIsMobile(window.innerWidth <= 768);
        };

        handleResize();
        window.addEventListener("resize", handleResize);

        return () => {
            window.removeEventListener("resize", handleResize);
        };
    }, []);

    useEffect(() => {
        if (fetchedData.length > 0) {
            // @ts-ignore
            setFilteredData(table.getFilteredRowModel().rows);

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
            });
        }
    }, [fetchedData]);

    // Set filteredData and slidersRange on columnFilters change
    useEffect(() => {
        // @ts-ignore
        setFilteredData(table.getFilteredRowModel().rows);

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
            });
        }
    }, [columnFilters]);

    // Total NGO footer
    const totalNGO = useMemo(() => {
        return filteredData.reduce((a, b: any) => {
            return !isNaN(parseFloat(b.original.ngo)) ? a + parseFloat(b.original.ngo) : a;
        }, 0);
    }, [filteredData]);

    // Total Area footer
    const totalArea = useMemo(() => {
        return filteredData.reduce((a, b: any) => {
            return !isNaN(parseFloat(b.original.area)) ? a + parseFloat(b.original.area) : a;
        }, 0);
    }, [filteredData]);

    // Total Paid Rent footer
    const totalRentValueNotPaid = useMemo(() => {
        let total = 0;

        if (filteredData) {
            filteredData.forEach((row: any) => (total += Number(calculateRentValueNotPaid(row.original))));
        }

        return total || 0;
    }, [filteredData]);

    // Total Not Paid Rent footer
    const totalRentValuePaid = useMemo(() => {
        let total = 0;

        if (filteredData) {
            filteredData.forEach((row: any) => (total += Number(calculateRentValuePaid(row.original))));
        }

        return total || 0;
    }, [filteredData]);

    // Leased chart pie stats
    const leasedStats = useMemo(
        () => {
            if (filteredData.length < 1) {
                return [0, 0]
            }
            //@ts-ignore
            const leased = filteredData.filter(item => item.original.contract_lease).length;
            const notLeased = filteredData.length - leased;
            const totalCount = filteredData.length;

            const leasedPercentage = Number(((leased / totalCount) * 100).toFixed(2));
            const notLeasedPercentage = Number(((notLeased / totalCount) * 100).toFixed(2));

            return [leasedPercentage, notLeasedPercentage];
        }, [filteredData]
    );

    // Initial Rent Payments (from DB)
    useEffect(() => {
        if (openedRentModal && rentModalData && fetchedData) {
            const row: any = {...fetchedData.find((data) => data.id === rentModalData?.id)};

            if (Object.keys(row).length > 0) {
                const totalPages = row.rent_payments ? Math.ceil(row.rent_payments.length / 5) : 1;

                setRentPaymentsTotalPages(totalPages);
                setRentAdvanceInput(!isNaN(parseFloat(row.rent_advance)) ? row.rent_advance : 0);
                setRentPeriodInput(!isNaN(parseFloat(row.rent_period)) ? row.rent_period : 0);
                setRentPriceInput(!isNaN(parseFloat(row.rent_price)) ? row.rent_price : 0);
                setRentPaymentsPerYearInput(!isNaN(parseFloat(row.rent_payments_per_year)) ? row.rent_payments_per_year : 1)
                setRentPayments(row.rent_payments || []);
                //@ts-ignore
                setEditedRentPayments((row.rent_payments || []).map((e: any) => ({...e})));
                setRentPaymentActivePage(1);
            } else {
                const totalPages = rentDetailsCreating.rent_payments ? Math.ceil(rentDetailsCreating.rent_payments.length / 5) : 1;

                setRentPaymentsTotalPages(totalPages);
                setRentAdvanceInput(!isNaN(parseFloat(rentDetailsCreating.rent_advance)) ? rentDetailsCreating.rent_advance : 0);
                setRentPeriodInput(!isNaN(parseFloat(rentDetailsCreating.rent_period)) ? rentDetailsCreating.rent_period : 0);
                setRentPriceInput(!isNaN(parseFloat(rentDetailsCreating.rent_price)) ? rentDetailsCreating.rent_price : 0);
                setRentPaymentsPerYearInput(!isNaN(parseFloat(rentDetailsCreating.rent_payments_per_year)) ? rentDetailsCreating.rent_payments_per_year : 1)
                setRentPayments(rentDetailsCreating.rent_payments || []);
                //@ts-ignore
                setEditedRentPayments((rentDetailsCreating.rent_payments || []).map((e: any) => ({...e})));
                setRentPaymentActivePage(1);
            }
        }

    }, [openedRentModal]);


    const getUpdatedRentPayments = (editedRentPayments: RentPayment[]) => editedRentPayments
        .map((e: any) => ({...e, rentValue: Number(e.rentValue), rentValuePaid: Number(e.rentValuePaid)}))

    const rentIsPaidIcon = (rentIsPaid: boolean | undefined, i: number) => {
        return rentIsPaid ? (
            <TickIcon
                width={32}
                height={32}
                onClick={() => handleEditRentPayments({rentIsPaid}, null, i)}
            />
        ) : (
            <CrossIcon
                width={32}
                height={32}
                onClick={() => handleEditRentPayments({rentIsPaid}, null, i)}
            />
        );
    };

    const isDebtor = (row: any) => {
        const rentPayments = row.rent_payments;

        const isDebt = (rentPayments: RentPayment[]) => {
            return rentPayments.some((payment) => {
                return payment.rentValue > 0 && !payment.rentIsPaid
                    && dayjs().isAfter(dayjs(payment.rentPaymentDate));
            });
        };

        return (
            <div className="flex items-center justify-center">
                <div>{row.id}</div>
                {rentPayments && isDebt(rentPayments) &&
                    <ExclamationIcon width={16} height={16} style={{position: "absolute", marginLeft: "-48px"}}/>}
            </div>
        );
    };

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
                    clearable: true
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
                Edit: (props) => {
                    return <EditTextArea {...props} />
                },
            },
            {
                header: "Сільска рада / Cелищна рада / Міська рада",
                accessorKey: "council",
                filterVariant: "multi-select",
                mantineFilterMultiSelectProps: {
                    //@ts-ignore
                    data: [...new Set(fetchedData.map((e) => e.council ? e.council : null))]
                },
                Edit: (props) => {
                    return <EditTextArea {...props} />;
                },
            },
            {
                header: "Кадастровий номер",
                accessorKey: "cadastral",
                size: 200,
                Edit: (props) => {
                    return <EditCadastralInput {...props} />
                },
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
                accessorFn: (row: any) => row.area ? Number(row.area).toFixed(3) : null,
                filterVariant: "range-slider",
                filterFn: "rangeSlider",
                mantineFilterRangeSliderProps: {
                    size: "lg",
                    precision: 4,
                    minRange: 0.1,
                    step: 0.01,
                    min: slidersRange.area.min,
                    max: slidersRange.area.max,
                    thumbSize: 15,
                },
                Cell: ({cell}: any) => Number(cell.getValue()) || null,
                Edit: (props) => {
                    return <EditNumberInput {...props} precision={3}/>;
                },
                Footer: () => (
                    <Stack className="flex flex-col justify-center items-center">
                        Загальна площа
                        <Box>{totalArea.toFixed(3)} га</Box>
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
                Cell: ({cell}: any) => Number(cell.getValue()) || null,
                Edit: (props) => {
                    return <EditNumberInput {...props} precision={2}/>;
                },
                Footer: () => (
                    <Stack className="flex flex-col justify-center items-center">
                        Загальне НГО
                        <Box>{totalNGO.toFixed(2)} ₴</Box>
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
                    valueFormat: "DD.MM.YYYY",
                },
                Edit: (props) => {
                    return <EditDateRange {...props} />;
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
                Edit: (props) => {
                    return <EditDateRange {...props} />;
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
                Edit: (props) => {
                    return <EditNumberInput {...props} precision={2}/>;
                },
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
                Cell: ({cell}) => {
                    return cell.getValue() ? (
                        <Textarea
                            variant="unstyled"
                            readOnly
                            // @ts-ignore
                            value={cell.getValue()}
                            maxRows={2}
                        />
                    ) : "";
                },
                Edit: (props) => {
                    return <EditTextArea {...props} />;
                },
                size: 400,
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
                Edit: (props) => {
                    return <EditDateRange {...props}
                                          rentDetailsCreatingEffect={{rentDetailsCreating, setRentDetailsCreating}}/>;
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
                    calculateRentValueNotPaid(row) : null,
                enableEditing: false,
                filterVariant: "range",
                filterFn: "range",
                Cell: ({cell, row}: any) => (
                    <div
                        className={`clickable-cell ${cell.getValue() === null ? "empty-cell" : ""}`}
                        onClick={() => {
                            let {
                                id,
                                rent_period,
                                rent_price,
                                rent_advance,
                                contract_lease_date,
                                rent_payments
                            } = row.original;

                            if (!contract_lease_date) {
                                const date = row._valuesCache.contract_lease_date;

                                if (isValidDate(date)) {
                                    contract_lease_date = dayjs(date, "DD.MM.YYYY").format()
                                }
                            }

                            if (rent_period || rent_price || rent_advance || contract_lease_date || rent_payments) {
                                setRentModalData({
                                    id,
                                    contractLeaseDate: contract_lease_date,
                                });

                                openRentModal();
                            } else {
                                notifyError("Спочатку необхідно вказати дату договору оренди");
                            }
                        }}
                    >
                        {cell.getValue()}
                    </div>
                ),
                size: 200,
                Footer: () => (
                    <Stack className="flex flex-col justify-center items-center">
                        Загальна орендна плата
                        <Box>
                            <span>
                                <Tooltip label="Сплачено" className="text-green-600">
                                    <Text style={{display: "inline"}}>{totalRentValuePaid.toFixed(2)} </Text>
                                </Tooltip>
                                /
                                <Tooltip label="Очікується" className="text-red-500">
                                    <Text style={{display: "inline"}}> {totalRentValueNotPaid.toFixed(2)} </Text>
                                </Tooltip>
                                ₴
                            </span>
                        </Box>
                    </Stack>
                ),
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
                Cell: ({cell}) => {
                    return cell.getValue() ? (
                        <Textarea
                            variant="unstyled"
                            readOnly
                            // @ts-ignore
                            value={cell.getValue()}
                            maxRows={2}
                        />
                    ) : "";
                },
                Edit: (props) => {
                    return <EditTextArea {...props} />;
                },
                size: 400,
                ...columnBlue
            },
        ], [fetchedData, filteredData, rentPayments]
    );

    const handleCreateTableData = async ({values, table}: any) => {
        if (!validateCadastral(values.cadastral)) {
            notifyError("Невірний формат Кадастрового номеру!");
            return;
        }

        const res = await toast.promise(
            createTableData({
                ...values,
                area: Number(values.area) || null,
                ngo: Number(values.ngo) || null,
                expenses: Number(values.expenses) || null,
                rent_advance: values.rent_advance || rentDetailsCreating.rent_advance || null,
                rent_period: values.rent_period || rentDetailsCreating.rent_period || null,
                rent_price: values.rent_price || rentDetailsCreating.rent_price || null,
                rent_payments_per_year: values.rent_payments_per_year || rentDetailsCreating.rent_payments_per_year || null,
                rent_payments: values.rent_payments || rentDetailsCreating.rent_payments || null,
            }),
            {
                loading: <b>Зберігається...</b>,
                success: <b>Інформація успішно додана!</b>,
                error: <b>Виникла помилка.</b>,
            }
        );

        if (res.ok) {
            setRentDetailsCreating({});
            table.setCreatingRow(null);
        }
    }

    const handleSaveTableData = async ({values, table}: any) => {
        if (!validateCadastral(values.cadastral)) {
            notifyError("Невірний формат Кадастрового номеру!");
            return;
        }

        const res = await toast.promise(
            updateTableData({
                ...values,
                area: Number(values.area) || null,
                ngo: Number(values.ngo) || null,
                expenses: Number(values.expenses) || null,
                region: values.region ? values.region.trim() : null,
                council: values.council ? values.council.trim() : null,
                composition: values.composition ? values.composition.trim() : null,
                owner: values.owner ? values.owner.trim() : null,
                extract_land: values.extract_land ? values.extract_land.trim() : null,
                tenant: values.tenant ? values.tenant.trim() : null,
            }),
            {
                loading: <b>Зберігається...</b>,
                success: <b>Інформація успішно збережена!</b>,
                error: <b>Виникла помилка.</b>,
            }
        );

        if (res.ok) table.setEditingRow(null);
    };

    const openDeleteConfirmModal = async (row: MRT_Row<TableData>) => {
        const data: TableData = row.original;
        setDeleteModalData(data);
        openDeleteModal();
    };

    const initiateRentPayments = () => {
        const calculatedRentPayments = rentPaymentsInitial({
            rentAdvance: rentAdvanceInput,
            rentPeriod: rentPeriodInput,
            rentPrice: rentPriceInput,
            rentPaymentsPerYear: rentPaymentsPerYearInput,
            contractLeaseDate: rentModalData.contractLeaseDate,
            rentPayments: [],
        });

        setRentPayments(calculatedRentPayments);
        // @ts-ignore
        setEditedRentPayments((calculatedRentPayments || []).map((e: any) => ({...e})));
        setRentPaymentsTotalPages(Math.ceil(calculatedRentPayments.length / 5) || 1);
    }

    const initiateButtonDisabled = () => !(rentPeriodInput > 0 && rentPaymentsPerYearInput > 0);


    const handleRentAdvanceChange = (oldValue: any, newValue: any) => {
        if (isNaN(parseFloat(newValue))) {
            newValue = 0;
        }

        const action = {initiator: "rentAdvance", oldValue: oldValue, newValue: newValue}

        setRentAdvanceInput(newValue);

        if (!rentPayments || rentPayments.length < 1) return;

        const calculatedRentPayments = calculateRentPayments({
            rentAdvance: rentAdvanceInput,
            rentPeriod: rentPeriodInput,
            rentPrice: rentPriceInput,
            rentPaymentsPerYear: rentPaymentsPerYearInput,
            contractLeaseDate: rentModalData.contractLeaseDate,
            rentPayments: editedRentPayments
        }, action);

        setRentPayments(calculatedRentPayments);
        // @ts-ignore
        setEditedRentPayments((calculatedRentPayments || []).map((e: any) => ({...e})));
        setRentPaymentsTotalPages(Math.ceil(calculatedRentPayments.length / 5) || 1);
    }


    const handleRentPeriodChange = (oldValue: any, newValue: any) => {
        if (isNaN(parseFloat(newValue))) {
            newValue = oldValue;
        }

        const action = {initiator: "rentPeriod", oldValue: oldValue, newValue: newValue}

        setRentPeriodInput(newValue);

        if (!rentPayments || rentPayments.length < 1) return;

        const calculatedRentPayments = calculateRentPayments({
            rentAdvance: rentAdvanceInput,
            rentPeriod: rentPeriodInput,
            rentPrice: rentPriceInput,
            rentPaymentsPerYear: rentPaymentsPerYearInput,
            contractLeaseDate: rentModalData.contractLeaseDate,
            rentPayments: editedRentPayments
        }, action);

        setRentPayments(calculatedRentPayments);
        // @ts-ignore
        setEditedRentPayments((calculatedRentPayments || []).map((e: any) => ({...e})));
        setRentPaymentsTotalPages(Math.ceil(calculatedRentPayments.length / 5) || 1);
    }

    const handleRentPriceChange = (oldValue: any, newValue: any) => {
        if (isNaN(parseFloat(newValue))) {
            newValue = oldValue;
        }

        const action = {initiator: "rentPrice", oldValue: oldValue, newValue: newValue}

        setRentPriceInput(newValue);

        if (!rentPayments || rentPayments.length < 1) return;

        const calculatedRentPayments = calculateRentPayments({
            rentAdvance: rentAdvanceInput,
            rentPeriod: rentPeriodInput,
            rentPrice: rentPriceInput,
            rentPaymentsPerYear: rentPaymentsPerYearInput,
            contractLeaseDate: rentModalData.contractLeaseDate,
            rentPayments: editedRentPayments
        }, action);

        setRentPayments(calculatedRentPayments);
        // @ts-ignore
        setEditedRentPayments((calculatedRentPayments || []).map((e: any) => ({...e})));
        setRentPaymentsTotalPages(Math.ceil(calculatedRentPayments.length / 5) || 1);
    }

    const handleRentPaymentsPerYearChange = (oldValue: any, newValue: any) => {
        if (isNaN(parseFloat(newValue))) {
            newValue = 1
        }

        const action = {initiator: "rentPaymentsPerYear", oldValue: oldValue, newValue: newValue}

        setRentPaymentsPerYearInput(newValue);

        if (!rentPayments || rentPayments.length < 1) return;

        const calculatedRentPayments = calculateRentPayments({
            rentAdvance: rentAdvanceInput,
            rentPeriod: rentPeriodInput,
            rentPrice: rentPriceInput,
            rentPaymentsPerYear: rentPaymentsPerYearInput,
            contractLeaseDate: rentModalData.contractLeaseDate,
            rentPayments: editedRentPayments
        }, action);

        setRentPayments(calculatedRentPayments);
        // @ts-ignore
        setEditedRentPayments((calculatedRentPayments || []).map((e: any) => ({...e})));
        setRentPaymentsTotalPages(Math.ceil(calculatedRentPayments.length / 5) || 1);
    }

    const handleEditRentPayments = (
        {
            rentPaymentDate,
            rentValue,
            rentValuePaid,
            rentIsPaid
        }: any,
        oldValue: any,
        i: number
    ) => {
        const newRentPayments = [...editedRentPayments];

        if (rentValue !== undefined || rentValue === "") {
            if (isNaN(parseFloat(rentValue))) {
                newRentPayments[i].rentValue = oldValue;
            } else {
                newRentPayments[i].rentValuePaid -= rentValue - oldValue;
                newRentPayments[i].rentValue = rentValue;

                if (parseFloat(rentValue) <= 0) {
                    newRentPayments[i].rentIsPaid = true;
                } else if (parseFloat(rentValue) > 0) {
                    newRentPayments[i].rentIsPaid = false;
                }
            }
        } else if (rentValuePaid !== undefined || rentValuePaid === "") {
            if (isNaN(parseFloat(rentValuePaid))) {
                newRentPayments[i].rentValuePaid = oldValue;
            } else {
                newRentPayments[i].rentValue -= rentValuePaid - oldValue;
                newRentPayments[i].rentValuePaid = rentValuePaid;

                if (parseFloat(newRentPayments[i].rentValue) <= 0) {
                    newRentPayments[i].rentIsPaid = true;
                } else if (parseFloat(newRentPayments[i].rentValue) > 0) {
                    newRentPayments[i].rentIsPaid = false;
                }
            }
        } else if (rentIsPaid !== undefined) {
            newRentPayments[i].rentIsPaid = !rentIsPaid;

            if (newRentPayments[i].rentIsPaid === true) {
                newRentPayments[i].rentValuePaid = newRentPayments[i].rentValue + newRentPayments[i].rentValuePaid;
                newRentPayments[i].rentValue = 0;
            } else if (newRentPayments[i].rentIsPaid === false) {
                const tempValue = newRentPayments[i].rentValue;
                newRentPayments[i].rentValue = newRentPayments[i].rentValuePaid;
                newRentPayments[i].rentValuePaid = tempValue;
            }
        } else if (rentPaymentDate !== undefined) {
            newRentPayments[i].rentPaymentDate = rentPaymentDate;
        }

        setEditedRentPayments(newRentPayments);
    };

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
        onCreatingRowCancel: ({row, table}) => {
            setRentDetailsCreating({});
            table.setEditingRow(null);
        },
        // @ts-ignore
        onColumnFiltersChange: setColumnFilters,
        // @ts-ignore
        onEditingRowChange: setEditingRow,
        getRowId: (row: any) => row.id,
        mantineTableBodyRowProps: ({table, row}) => ({
            onDoubleClick: async () => {
                if (!editingRow) {
                    // const originalRow = {...row.original, id: null, isLeased: null};
                    // const changedRow = {...row._valuesCache, id: null, isLeased: null};

                    table.setEditingRow(row);
                }
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
            <div style={{display: "grid", gridTemplateColumns: "1fr 1fr", alignItems: "center"}}>
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
            editingRow: editingRow,
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
                        );
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
    });

    function useGetData() {
        return useQuery<TableData[]>({
            queryKey: ["table"],
            queryFn: async () => {
                return await getTable();
            },
            keepPreviousData: true,
            refetchInterval: 30000,
        });
    }

    function useCreateTableData() {
        return useMutation({
            mutationFn: async (tableData: TableData) => {
                // @ts-ignore
                const id = tableData.id.props ? tableData.id.props.children[0].props.children : tableData.id;

                const formattedTableData = {
                    ...tableData,
                    id: id,
                };

                delete formattedTableData.isLeased;
                delete formattedTableData.rent;

                const res = await fetch("/api/table", {
                    body: JSON.stringify(formattedTableData),
                    method: "POST"
                });

                if (!res.ok) return Promise.reject(res);

                return Promise.resolve(res);
            },
            onSettled: () => queryClient.invalidateQueries({queryKey: ["table"]}),
        });
    }

    function useUpdateTableData() {
        return useMutation({
            mutationFn: async (tableData: TableData) => {
                // @ts-ignore
                const id = tableData.id.props ? tableData.id.props.children[0].props.children : tableData.id;

                const formattedTableData = {
                    ...tableData,
                    id,
                };

                delete formattedTableData.isLeased;
                delete formattedTableData.rent;

                const res = await fetch("/api/table", {
                    body: JSON.stringify(formattedTableData),
                    method: "PUT"
                });

                if (!res.ok) return Promise.reject(res);

                return Promise.resolve(res);
            },
            onSettled: () => queryClient.invalidateQueries({queryKey: ["table"]}),
        });
    }

    function useDeleteTableData() {
        return useMutation({
            mutationFn: async (rowId: number) => {
                const res = await fetch("/api/table", {
                    body: JSON.stringify({id: rowId}),
                    method: "DELETE"
                });

                if (!res.ok) return Promise.reject(res);

                return Promise.resolve(res);
            },
            onSettled: () => {
                queryClient.invalidateQueries(["table"]);
            },
        });
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
                    setDeleteModalData(null);
                    closeDeleteModal();
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
                            closeDeleteModal();
                            await toast.promise(deleteTableData(Number(deleteModalData?.id)), {
                                loading: <b>Видаяється...</b>,
                                success: <b>Інформацію успішно видалено!</b>,
                                error: <b>Виникла помилка.</b>,
                            });
                            setDeleteModalData(null);
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
                    setRentModalData(null);
                    setRentAdvanceInput(0);
                    setRentPeriodInput(0);
                    setRentPriceInput(0);
                    setRentPaymentsPerYearInput(1);
                    setRentPayments([]);
                    closeRentModal();
                }}
                title={<p className="text-xl font-bold">Деталі орендної плати</p>}
                size="27.5rem"
            >
                {rentModalData && (
                    <div>
                        <div className="flex flex-row items-center mb-4">
                            <p className="text-md font-semibold w-32">Аванс</p>
                            <NumberInput
                                value={rentAdvanceInput}
                                onChange={(newValue) => handleRentAdvanceChange(rentAdvanceInput, newValue)}
                                min={0}
                                precision={2}
                                hideControls
                                className="w-24"
                            />
                        </div>
                        <div className="flex flex-row items-center mb-4">
                            <p className="text-md font-semibold w-32">Термін оренди</p>
                            <NumberInput
                                value={rentPeriodInput}
                                onChange={(newValue) => handleRentPeriodChange(rentPeriodInput, newValue)}
                                min={0}
                                max={50}
                                stepHoldDelay={250}
                                stepHoldInterval={(t) => Math.max(1000 / t ** 2, 25)}
                                className="w-24"
                            />
                        </div>
                        <div className="flex flex-row items-center mb-4">
                            <p className="text-md font-semibold w-32">Плата за рік</p>
                            <NumberInput
                                value={rentPriceInput}
                                onChange={(newValue) => handleRentPriceChange(rentPriceInput, newValue)}
                                min={0}
                                precision={2}
                                hideControls
                                className="w-24"
                            />
                        </div>
                        <div className="flex flex-row items-center mb-4">
                            <div className="text-md font-semibold w-32 leading-tight">
                                <p>Кількість оплат</p>
                                <p>на рік</p>
                            </div>
                            <NumberInput
                                value={rentPaymentsPerYearInput}
                                onChange={(newValue) => handleRentPaymentsPerYearChange(rentPaymentsPerYearInput, newValue)}
                                min={1}
                                max={12}
                                stepHoldDelay={250}
                                stepHoldInterval={(t) => Math.max(1000 / t ** 2, 25)}
                                className="w-24"
                            />
                        </div>
                        {
                            (rentPayments.length < 1 || !rentPayments) && (
                                <button
                                    className={
                                        "mt-1 mb-2 flex-grow flex-shrink px-4 py-2 rounded hover:bg-gradient-to-r  transition-all ease-out duration-300 " +
                                        (initiateButtonDisabled()
                                            ? "text-gray-100 bg-gray-500"
                                            : "text-white bg-orange-500 hover:from-orange-500 hover:to-orange-400 hover:ring-orange-400 hover:ring-2 hover:ring-offset-2")
                                    }
                                    style={{
                                        whiteSpace: "nowrap",
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "center",
                                    }}
                                    onClick={initiateRentPayments}
                                    disabled={initiateButtonDisabled()}
                                >
                                    <span className={"relative text-center"}>Розрахувати</span>
                                </button>
                            )
                        }
                        {rentModalData?.contractLeaseDate ? (
                            <div className="flex flex-col items-start">
                                <table className="border-collapse border border-slate-400 mt-2">
                                    <thead>
                                    <tr>
                                        <th className="border border-slate-300 p-4">Дата оплати</th>
                                        <th className="border border-slate-300 p-4">Сума до сплати</th>
                                        <th className="border border-slate-300 p-4">Сплачена сума</th>
                                        <th className="border border-slate-300 p-4"/>
                                    </tr>
                                    </thead>
                                    <tbody>
                                    {rentPayments
                                        ?.slice(
                                            (rentPaymentsActivePage - 1) * 5,
                                            Math.min(rentPaymentsActivePage * 5, rentPayments.length)
                                        )
                                        .map((rentRow, i) => {
                                            const index = (rentPaymentsActivePage - 1) * 5 + i;
                                            return (
                                                <tr key={index}>
                                                    <td
                                                        className="border border-slate-300 p-3.5 text-center"
                                                        style={{width: "18%"}}
                                                    >
                                                        <DatePickerInput
                                                            value={dayjs(editedRentPayments[index].rentPaymentDate).toDate()}
                                                            valueFormat="DD.MM.YYYY"
                                                            onChange={(e: any) =>
                                                                handleEditRentPayments({rentPaymentDate: e}, editedRentPayments[index].rentPaymentDate, index)
                                                            }
                                                            locale="ru"
                                                            variant="unstyled"
                                                        />
                                                    </td>
                                                    <td
                                                        className="border border-slate-300 p-3.5 text-center"
                                                        style={{width: "34.53%"}}
                                                    >
                                                        <NumberInput
                                                            value={editedRentPayments[index].rentValue}
                                                            onChange={(newValue) =>
                                                                handleEditRentPayments({rentValue: newValue}, editedRentPayments[index].rentValue, index)
                                                            }
                                                            min={0}
                                                            precision={2}
                                                            hideControls
                                                        />
                                                    </td>
                                                    <td
                                                        className="border border-slate-300 p-3.5 text-center"
                                                        style={{width: "32.47%"}}
                                                    >
                                                        <NumberInput
                                                            value={editedRentPayments[index].rentValuePaid}
                                                            onChange={(newValue) =>
                                                                handleEditRentPayments({rentValuePaid: newValue}, editedRentPayments[index].rentValuePaid, index)
                                                            }
                                                            min={0}
                                                            precision={2}
                                                            hideControls
                                                        />
                                                    </td>
                                                    <td
                                                        className="border border-slate-300 p-3.5"
                                                        style={{width: "15%"}}
                                                    >
                                                        <div className="flex justify-center items-center h-full">
                                                            {rentIsPaidIcon(editedRentPayments[index].rentIsPaid, index)}
                                                        </div>
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                                <div className="flex w-full justify-center mt-2.5">
                                    <Pagination
                                        value={rentPaymentsActivePage}
                                        onChange={setRentPaymentActivePage}
                                        total={rentPaymentsTotalPages}
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
                                const updatedRentPayments = getUpdatedRentPayments(editedRentPayments);
                                const updatedRentDetails = {
                                    id: rentModalData?.id,
                                    rent_advance: Number(rentAdvanceInput),
                                    rent_period: Number(rentPeriodInput),
                                    rent_price: Number(rentPriceInput),
                                    rent_payments_per_year: Number(rentPaymentsPerYearInput),
                                    rent_payments: updatedRentPayments || null,
                                };

                                if (updatedRentDetails.id) {
                                    const res = await toast.promise(updateTableData(updatedRentDetails), {
                                        loading: <b>Зберігається...</b>,
                                        success: <b>Інформація успішно збережена!</b>,
                                        error: <b>Виникла помилка.</b>,
                                    });
                                    if (res.ok) {
                                        setRentPayments(updatedRentPayments);
                                    }
                                } else {
                                    setRentPayments(updatedRentPayments);
                                    setRentDetailsCreating(updatedRentDetails);
                                    notifySuccess("Інформація успішно збережена!");
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
    );
}
