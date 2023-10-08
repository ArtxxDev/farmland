import dayjs from "dayjs"

const isValidDate = (dateString: string) => {
    const date = dayjs(dateString, "DD.MM.YYYY")
    return date.isValid()
}

export default isValidDate
