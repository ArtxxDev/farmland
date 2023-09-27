import dayjs from "dayjs"
import {RentRow} from "@/types/interfaces"

const rentPaymentsCalculator = (
    rentAdvance: number,
    rentPeriod: number,
    rentPrice: number,
    contractLeaseDate: string
) => {
    const rentDetails: RentRow[] = []

    for (let i = 0; i < rentPeriod; i++) {
        const rentRow: RentRow = {
            rentYear: dayjs(contractLeaseDate).year() + i,
            rentPrice: 0,
            rentIsPaid: false
        }

        rentRow.rentYear = dayjs(contractLeaseDate).year() + i

        if (rentAdvance >= rentPrice) {
            rentAdvance -= rentPrice
            rentRow.rentPrice = 0
        } else {
            rentRow.rentPrice = rentPrice - rentAdvance
            rentAdvance = 0
        }

        rentRow.rentPrice === 0 ? rentRow.rentIsPaid = true : rentRow.rentIsPaid = false

        rentDetails.push(rentRow)
    }

    return rentDetails
}

export default rentPaymentsCalculator
