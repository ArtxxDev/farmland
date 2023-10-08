import {RentPayments} from "@/types/interfaces";

export const isValidRentInputs = (
    rentAdvanceInput: string,
    rentPeriodInput: string,
    rentPriceInput: string,
): boolean => {
    const rentAdvance = Number(rentAdvanceInput)
    const rentPeriod = Number(rentPeriodInput)
    const rentPrice = Number(rentPriceInput)

    return (!(isNaN(rentPeriod) || rentPeriod < 1) && !isNaN(rentAdvance) && !isNaN(rentPrice))
}

export const isValidRentPayments = (rentPayments: RentPayments[]): boolean => {
    console.log(rentPayments)
    return true
}
