import dayjs from "dayjs"

export const dateRange = (row: any, id: any, filterValue: any) => {
    const [dateFrom, dateTo] = filterValue
    const rowDate = dayjs(row.getValue(id), "DD.MM.YYYY")

    if (!dateFrom && !dateTo) {
        return true
    }

    if (!rowDate.isValid()) {
        return false
    }

    if (!dateFrom) {
        return !rowDate.isAfter(dayjs(dateTo).endOf("day"))
    }

    if (!dateTo) {
        return !rowDate.isBefore(dayjs(dateFrom).startOf("day"))
    }

    return (
        !rowDate.isBefore(dayjs(dateFrom).startOf("day")) &&
        !rowDate.isAfter(dayjs(dateTo).endOf("day"))
    )
}
export const rangeSlider = (row: any, id: any, filterValue: any) => {
    const [min, max] = filterValue
    const cellValue = parseFloat(row.getValue(id))

    if (!isNaN(min) && !isNaN(max)) {
        return cellValue >= min && cellValue <= max
    } else if (!isNaN(min)) {
        return cellValue >= min
    } else if (!isNaN(max)) {
        return cellValue <= max
    }

    return true
}