"use client"

import {useEffect, useMemo, useState} from 'react'
import {
    MantineReactTable,
    type MRT_ColumnDef, MRT_Row,
    MRT_RowSelectionState,
    MRT_TableOptions,
    useMantineReactTable
} from 'mantine-react-table'
import {MantineProvider, useMantineTheme} from "@mantine/core"
import {ScrollArea} from '@mantine/core';
import {TableData} from "@/types/interfaces"
import prisma from "@/prisma/client"
import {columnsData} from "@/constants/columns"
import {getTable} from "@/app/utils/getTable"
import {
    QueryClient,
    QueryClientProvider,
    useMutation,
    useQuery,
    useQueryClient,
} from '@tanstack/react-query';

export default function Table() {
    const [tableData, setTableData] = useState([])
    const [rowSelection, setRowSelection] = useState<MRT_RowSelectionState>({})
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

    //CREATE action
    const handleCreateUser: MRT_TableOptions<TableData>['onCreatingRowSave'] = async ({values, exitCreatingMode}) => {
        const newValidationErrors = validateUser(values);
        if (Object.values(newValidationErrors).some((error) => error)) {
            setValidationErrors(newValidationErrors);
            return;
        }
        setValidationErrors({});
        await createUser(values);
        exitCreatingMode();
    };

    //UPDATE action
    const handleSaveUser: MRT_TableOptions<TableData>['onEditingRowSave'] = async ({values, table}) => {
        const newValidationErrors = validateUser(values);
        if (Object.values(newValidationErrors).some((error) => error)) {
            setValidationErrors(newValidationErrors);
            return;
        }
        setValidationErrors({});
        await updateUser(values);
        table.setEditingRow(null); //exit editing mode
    };

    //DELETE action
    const openDeleteConfirmModal = (row: MRT_Row<TableData>) =>
        modals.openConfirmModal({
            title: 'Are you sure you want to delete this user?',
            children: (
                <Text>
                    Are you sure you want to delete {row.original.firstName}{' '}
                    {row.original.lastName}? This action cannot be undone.
                </Text>
            ),
            labels: {confirm: 'Delete', cancel: 'Cancel'},
            confirmProps: {color: 'red'},
            onConfirm: () => deleteUser(row.original.id),
        })

    function useCreateUser() {
        prisma
        return useMutation({
            mutationFn: async (user: User) => {
                //send api update request here
                await new Promise((resolve) => setTimeout(resolve, 1000)); //fake api call
                return Promise.resolve();
            },
            //client side optimistic update
            onMutate: (newUserInfo: User) => {
                queryClient.setQueryData(
                    ['users'],
                    (prevUsers: any) =>
                        [
                            ...prevUsers,
                            {
                                ...newUserInfo,
                                id: (Math.random() + 1).toString(36).substring(7),
                            },
                        ] as User[],
                );
            },
            // onSettled: () => queryClient.invalidateQueries({ queryKey: ['users'] }), //refetch users after mutation, disabled for demo
        });
    }

    const columns = useMemo(() => columnsData, [])

    const table = useMantineReactTable({
        // @ts-ignore
        columns,
        data: tableData,
        enableFacetedValues: true,
        initialState: {
            showColumnFilters: true,
            density: 'md',
            isFullScreen: true,
        },
        mantineSelectCheckboxProps: {
            color: 'blue',
        },
        createDisplayMode: 'row',
        editDisplayMode: 'row',
        enableEditing: true,
        getRowId: (row) => row.id,
        onCreatingRowCancel: () => setValidationErrors({}),
        onCreatingRowSave: handleCreateUser,
        onEditingRowCancel: () => setValidationErrors({}),
        onEditingRowSave: handleSaveUser,
        mantineTableProps: {
            striped: true,
            withColumnBorders: true,
            withBorder: true,
            sx: {
                tableLayout: 'fixed'
            },
        },
        mantineTableBodyCellProps: {
            align: 'center',
        },
        //     initialState={{
        //     columnVisibility: { required: false, description: false },
        //     density: 'xs',
        //         showGlobalFilter: true,
        //         sorting: [{ id: 'columnOption', desc: false }],
        // }}
    })


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
    )
};

