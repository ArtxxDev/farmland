"use client"

import {useSession} from "next-auth/react"
import {getUsers} from "@/app/utils/clientRequests"
import {useEffect, useState} from "react"
import {User} from "@prisma/client"

export default function Dashboard() {
    const [users, setUsers] = useState<User[]>([])
    const session = useSession()

    useEffect(() => {
        async function fetchData() {
            const data = await getUsers()
            setUsers(data)
        }

        fetchData()
    }, [])

    return (
        <div>
            <table>
                <thead>
                <tr>
                    <th>ID</th>
                    <th>EMAIL</th>
                    <th>ROLE</th>
                </tr>
                </thead>
                <tbody>
                {users ? (
                    Object.values(users)?.map((user: User) => (
                        <tr key={user?.id}>
                            <td>{user?.id}</td>
                            <td>{user?.email}</td>
                            <td>{user?.role}</td>
                            <td>O X</td>
                        </tr>
                    ))
                ) : (
                    <tr>
                        <td>N/A</td>
                    </tr>
                )}
                </tbody>
            </table>
        </div>

    )
}
