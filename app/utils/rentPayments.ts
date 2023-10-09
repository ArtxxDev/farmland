import dayjs from "dayjs"
import {RentDetails, RentPayments} from "@/types/interfaces"

export const rentPaymentsInitial = (rentDetails: RentDetails) => {
    let {rentAdvance, rentPeriod, rentPrice, contractLeaseDate} = rentDetails
    const rentPaymentsInitial = []

    if (rentPeriod > 50) {
        rentPeriod = 50
    }

    for (let i = 0; i < rentPeriod; i++) {
        const rentRow = {
            rentYear: dayjs(contractLeaseDate).year() + i,
            rentPrice: 0,
            rentIsPaid: false,
        }

        if (rentAdvance >= rentPrice) {
            rentAdvance -= rentPrice
            rentRow.rentIsPaid = true
        } else {
            rentRow.rentPrice = rentPrice - rentAdvance
            rentAdvance = 0
        }

        rentPaymentsInitial.push(rentRow)
    }

    return rentPaymentsInitial
}


export const calculateRentPayments = (rentDetails: RentDetails): RentPayments[] => {
    let { rentAdvance, rentPeriod, rentPrice, contractLeaseDate, rentPayments } = rentDetails

    if (rentPeriod > 50) {
        rentPeriod = 50
    }

    const calculatedPayments: RentPayments[] = [];

    for (let i = 0; i < rentPeriod; i++) {
        if (i < rentPayments.length) {
            // Use values from rentPayments if they exist
            calculatedPayments.push(rentPayments[i])
        } else {
            // Calculate new payment if not provided in rentPayments
            const rentRow = {
                rentYear: dayjs(contractLeaseDate).year() + i,
                rentPrice: rentPrice,
                rentIsPaid: false,
            };

            calculatedPayments.push(rentRow);
        }
    }

    return calculatedPayments;
};

