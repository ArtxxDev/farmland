export async function getTable() {
    const res = await fetch("/api/table", {
        method: "GET"
    })

    if (!res.ok) {
        console.log(res)
    }

    return res.json()
}

export async function getUsers() {
    const res = await fetch("/api/users", {
        method: "GET"
    })

    if (!res.ok) {
        console.log(res)
    }

    return res.json()
}
