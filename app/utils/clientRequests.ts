export async function getTable() {
    const res = await fetch("/api/getTable", {
        method: "GET"
    })

    if (!res.ok) {
        console.log(res)
    }

    return res.json()
}

export async function getUsers() {
    const res = await fetch("/api/getUsers", {
        method: "GET"
    })

    if (!res.ok) {
        console.log(res)
    }

    return res.json()
}
