const dateToLocalFormat = (date: any) => {
    if (!date) return ""

    return date.toLocaleDateString("ru-RU", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
    })
}

export default dateToLocalFormat
