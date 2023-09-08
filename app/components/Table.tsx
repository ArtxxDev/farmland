"use client";

import React, {useEffect, useMemo, useState} from "react";
import {
    MantineReactTable,
    type MRT_ColumnDef, MRT_Row,
    MRT_RowSelectionState,
    MRT_TableOptions,
    useMantineReactTable
} from "mantine-react-table";
import {ActionIcon, Button, Flex, MantineProvider, Tooltip, useMantineTheme} from "@mantine/core";
import {columnsData} from "@/constants/columns";
import {getTable} from "@/app/utils/getTable";

export default function Table() {
    const [tableData, setTableData] = useState([]);
    const [rowSelection, setRowSelection] = useState<MRT_RowSelectionState>({});
    const [validationErrors, setValidationErrors] = useState<
        Record<string, string | undefined>
    >({});

    useEffect(() => {
        async function fetchData() {
            const data = await getTable();
            setTableData(data);
        }

        fetchData();
    }, []);

    //CREATE action
    // const handleCreateUser: MRT_TableOptions<TableData>["onCreatingRowSave"] = async ({values, exitCreatingMode}) => {
    //     const newValidationErrors = validateUser(values);
    //     if (Object.values(newValidationErrors).some((error) => error)) {
    //         setValidationErrors(newValidationErrors);
    //         return;
    //     }
    //     setValidationErrors({});
    //     await createUser(values);
    //     exitCreatingMode();
    // };

    // const handleSaveUser: MRT_TableOptions<TableData>["onEditingRowSave"] = async ({values, table}) => {
    //     const newValidationErrors = validateUser(values);
    //     if (Object.values(newValidationErrors).some((error) => error)) {
    //         setValidationErrors(newValidationErrors);
    //         return;
    //     }
    //     setValidationErrors({});
    //     await updateUser(values);
    //     table.setEditingRow(null); //exit editing mode
    // };

    //DELETE action
    // const openDeleteConfirmModal = (row: MRT_Row<TableData>) =>
    //     modals.openConfirmModal({
    //         title: "Ви впевнені що хочете видалити цей запис?",
    //         children: (
    //             <Text>
    //                 Are you sure you want to delete {row.original.firstName}{" "}
    //                 {row.original.lastName}? This action cannot be undone.
    //             </Text>
    //         ),
    //         labels: {confirm: "Delete", cancel: "Cancel"},
    //         confirmProps: {color: "red"},
    //         onConfirm: () => deleteUser(row.original.id),
    //     });

    // function useCreateUser() {
    //     const queryClient = useQueryClient();
    //     return useMutation({
    //         mutationFn: async (user: User) => {
    //             //send api update request here
    //             await new Promise((resolve) => setTimeout(resolve, 1000)); //fake api call
    //             return Promise.resolve();
    //         },
    //         //client side optimistic update
    //         onMutate: (newUserInfo: User) => {
    //             queryClient.setQueryData(
    //                 ["users"],
    //                 (prevUsers: any) =>
    //                     [
    //                         ...prevUsers,
    //                         {
    //                             ...newUserInfo,
    //                             id: (Math.random() + 1).toString(36).substring(7),
    //                         },
    //                     ] as User[],
    //             );
    //         },
    //         // onSettled: () => queryClient.invalidateQueries({ queryKey: ['users'] }), //refetch users after mutation, disabled for demo
    //     });
    // }

    const columns = useMemo(() => columnsData, []);

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
        // mantineToolbarAlertBannerProps: isLoadingUsersError
        //     ? {
        //         color: "red",
        //         children: "Error loading data",
        //     }
        //     : undefined,
        mantineTableContainerProps: {
            sx: {
                minHeight: "500px",
            },
        },
        displayColumnDefOptions: {
            'mrt-row-actions': {
                header: '',
                size: 100,
            },
        },
        // onCreatingRowCancel: () => setValidationErrors({}),
        // onCreatingRowSave: handleCreateUser,
        // onEditingRowCancel: () => setValidationErrors({}),
        // onEditingRowSave: handleSaveUser,
        // renderRowActions: ({row, table}) => (
        //     <Flex gap="md">
        //         <Tooltip label="Edit">
        //             <ActionIcon onClick={() => table.setEditingRow(row)}>
        //                 <IconEdit/>
        //             </ActionIcon>
        //         </Tooltip>
        //         <Tooltip label="Delete">
        //             <ActionIcon color="red" onClick={() => openDeleteConfirmModal(row)}>
        //                 <IconTrash/>
        //             </ActionIcon>
        //         </Tooltip>
        //     </Flex>
        // ),
        // renderTopToolbarCustomActions: ({table}) => (
        //     <Button
        //         onClick={() => {
        //             table.setCreatingRow(true); //simplest way to open the create row modal with no default values
        //             //or you can pass in a row object to set default values with the `createRow` helper function
        //             // table.setCreatingRow(
        //             //   createRow(table, {
        //             //     //optionally pass in default values for the new row, useful for nested data or other complex scenarios
        //             //   }),
        //             // );
        //         }}
        //     >
        //         Create New User
        //     </Button>
        // ),
        // state: {
        //     isLoading: isLoadingUsers,
        //     isSaving: isCreatingUser || isUpdatingUser || isDeletingUser,
        //     showAlertBanner: isLoadingUsersError,
        //     showProgressBars: isFetchingUsers,
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
