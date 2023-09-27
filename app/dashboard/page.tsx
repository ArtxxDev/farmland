"use client"

// import {useSession} from "next-auth/react"
import {getUsers} from "@/app/utils/clientRequests"
import React, {Fragment, useMemo, useRef, useState} from "react"
import {MantineReactTable, MRT_ColumnDef, MRT_Row, useMantineReactTable} from "mantine-react-table"
import {ActionIcon, Flex, MantineProvider, Tooltip, useMantineTheme} from "@mantine/core"
import {IconEdit, IconTrash} from "@tabler/icons-react"
import toast from "react-hot-toast"
import {useMutation, useQuery, useQueryClient} from "@tanstack/react-query"
import {UserPublic} from "@/types/interfaces"
import {notifyError} from "@/app/utils/notifications"
import {Dialog, Transition} from "@headlessui/react"
import {ExclamationTriangleIcon} from "@heroicons/react/24/outline"
import Link from "next/link"
import localization from "@/constants/tableLocalization"

export default function Dashboard() {
    // const session = useSession()
    const queryClient = useQueryClient()
    const {colorScheme} = useMantineTheme()

    const [modalOpen, setModalOpen] = useState(false)
    const cancelButtonRef = useRef(null)
    const [modalUserData, setModalUserData] = useState<null | UserPublic>(null)

    const {
        data: fetchedUsers = [],
        isError: isLoadingUsersError,
        isFetching: isFetchingUsers,
        isLoading: isLoadingUsers,
    } = useGetUsers()
    const {mutateAsync: updateUser, isLoading: isUpdatingUser} = useUpdateUser()
    const {mutateAsync: deleteUser, isLoading: isDeletingUser} = useDeleteUser()

    const columns = useMemo<MRT_ColumnDef<UserPublic>[]>(
        () => [
            {
                accessorKey: "id",
                header: "ID",
                size: 40,
                enableEditing: false,
            },
            {
                accessorKey: "email",
                header: "Електронна пошта",
                size: 50,
            },
            {
                accessorKey: "role",
                header: "Роль",
                size: 50,
                editVariant: "select",
                // Edit: ({cell, column, table}) => <div>edit</div>,
                mantineEditSelectProps: {
                    data: ["guest", "user", "admin"]
                }
            },
        ], []
    )

    const openDeleteConfirmModal = async (row: MRT_Row<UserPublic>) => {
        const user: UserPublic = row.original
        setModalUserData(user)
        setModalOpen(true)
    }

    const handleSaveUser = async ({table, row, values}: any) => {
        const validationErrors = validateUser(values)

        if (!validationErrors) return

        const res = await toast.promise(
            updateUser(values),
            {
                loading: <b>Зберігається...</b>,
                success: <b>Інформація успішно збережена!</b>,
                error: <b>Виникла помилка.</b>,
            }
        )

        if (res.ok) table.setEditingRow(null)
    }

    const table = useMantineReactTable({
        // @ts-ignore
        columns,
        data: fetchedUsers,
        enableColumnActions: false,
        enableColumnFilters: true,
        enablePagination: true,
        paginationDisplayMode: "pages",
        enableSorting: false,
        enableRowActions: true,
        enableEditing: true,
        enableTopToolbar: false,
        createDisplayMode: "row",
        editDisplayMode: "row",
        localization: localization,
        renderRowActions: ({row, table}) => (
            <Flex gap="md">
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
            </Flex>
        ),
        mantineTableProps: {
            highlightOnHover: true,
            withColumnBorders: true,
            withBorder: colorScheme === "light",
            sx: {
                "thead > tr": {
                    backgroundColor: "inherit",
                },
                "thead > tr > th": {
                    backgroundColor: "inherit",
                },
                "tbody > tr > td": {
                    backgroundColor: "inherit",
                },
            },
        },
        displayColumnDefOptions: {
            "mrt-row-actions": {
                header: "",
            },
        },
        mantineTableBodyCellProps: {
            align: "center",
        },
        mantineTableHeadCellProps: {
            align: "center",
        },
        onEditingRowSave: handleSaveUser,
        state: {
            isLoading: isLoadingUsers,
            isSaving: isUpdatingUser || isDeletingUser,
            showAlertBanner: isLoadingUsersError,
            showProgressBars: isFetchingUsers,
        },
    })

    function useGetUsers() {
        return useQuery<UserPublic[]>({
            queryKey: ["users"],
            queryFn: async () => {
                return await getUsers()
            },
            keepPreviousData: true,
            refetchInterval: 60000,
        })
    }

    function useUpdateUser() {
        return useMutation({
            mutationFn: async (user: UserPublic) => {
                const res = await fetch("/api/users", {
                    body: JSON.stringify(user),
                    method: "PUT"
                })

                if (!res.ok) return Promise.reject(res)

                return Promise.resolve(res)
            },
            onSettled: () => queryClient.invalidateQueries({queryKey: ["users"]}),
        })
    }

    function useDeleteUser() {
        return useMutation({
            mutationFn: async (userId: number) => {
                const res = await fetch("/api/users", {
                    body: JSON.stringify({id: userId}),
                    method: "DELETE"
                })

                if (!res.ok) return Promise.reject(res)

                return Promise.resolve(res)
            },
            onSettled: () => {
                queryClient.invalidateQueries(["users"])
            },
        })
    }

    const validateRequired = (value: string) => !!value.length
    const validateEmail = (email: string) => !!email.length && email
        .toLowerCase()
        .match(/^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/)

    function validateUser(user: UserPublic) {
        if (!validateEmail(user.email)) {
            notifyError("Невірний формат електронної пошти")
            return false
        }
        if (!validateRequired(user.role)) {
            notifyError("Необхідно вказати роль користувача")
            return false
        }
        return true
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
                                                    Видалення користувача
                                                </Dialog.Title>
                                                <div className="mt-2">
                                                    <p className="text-sm text-gray-500">
                                                        Ви дійсно бажаєте видалити користувача {modalUserData?.email}?
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
                                                    deleteUser(Number(modalUserData?.id)),
                                                    {
                                                        loading: <b>Видаяється...</b>,
                                                        success: <b>Користувача успішно видалено!</b>,
                                                        error: <b>Виникла помилка.</b>,
                                                    }
                                                )
                                                setModalUserData(null)
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
            <div className="w-1/3 min-w-fit">
                    <MantineReactTable table={table}/>
            </div>
            <div className="flex">
                <Link
                    className="relative mt-5 ml-1.5 rounded px-5 py-2.5 overflow-hidden group bg-blue-500 hover:bg-gradient-to-r hover:from-blue-500 hover:to-blue-400 text-white hover:ring-2 hover:ring-offset-2 hover:ring-blue-400 transition-all ease-out duration-300"
                    href="/"
                >
                        <span
                            className="absolute right-0 w-8 h-32 -mt-12 transition-all duration-1000 transform translate-x-12 bg-white opacity-10 rotate-12 group-hover:-translate-x-40 ease">
                        </span>
                    <span className="relative">Головна сторінка</span>
                </Link>
            </div>
        </MantineProvider>
    )
}
