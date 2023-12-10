import dayjs from "dayjs"
import "dayjs/locale/ru";
import customParseFormat from "dayjs/plugin/customParseFormat";
import {RentDetails, RentPayment} from "@/types/interfaces"
import {calculateNextPaymentDate} from "@/app/utils/calculateNextPaymentDate";

dayjs.extend(customParseFormat);

export const rentPaymentsInitial = (rentDetails: RentDetails) => {
    let {rentAdvance, rentPeriod, rentPrice, rentPaymentsPerYear, contractLeaseDate} = rentDetails
    const rentPaymentsInitial = []

    if (rentPeriod > 50) {
        rentPeriod = 50
    }

    let rentExcess = 0;

    for (let i = 0; i < rentPeriod; i++) {
        for (let j = 0; j < rentPaymentsPerYear; j++) {
            const previousIndex = i * rentPaymentsPerYear + j - 1;
            const previousRentPaymentDate = rentPaymentsInitial[previousIndex]
                ? dayjs(rentPaymentsInitial[previousIndex].rentPaymentDate)
                : dayjs(contractLeaseDate);

            const rentRow: RentPayment = {
                rentPaymentDate: previousIndex >= 0
                    ? calculateNextPaymentDate(previousRentPaymentDate, rentPaymentsPerYear).toISOString()
                    : contractLeaseDate,
                rentValue: Number((rentPrice / rentPaymentsPerYear).toFixed(2)),
                rentValuePaid: 0,
                rentIsPaid: false,
            };

            // console.log("prev index:" , previousIndex, "date:", rentRow.rentPaymentDate)

            if (rentAdvance > 0) {
                // Check if there is an excess amount to pay from the previous cycle
                if (rentExcess > 0) {
                    const excessPayment = Math.min(rentExcess, rentRow.rentValue);
                    rentRow.rentValuePaid = excessPayment;
                    rentExcess -= excessPayment;
                    rentAdvance -= excessPayment;
                    rentRow.rentValue = Number((rentRow.rentValue - excessPayment).toFixed(2));
                }

                // Pay the remaining amount from the advance
                if (rentAdvance >= rentRow.rentValue) {
                    rentRow.rentValuePaid = Number((rentRow.rentValuePaid + rentRow.rentValue).toFixed(2));
                    rentAdvance -= rentRow.rentValue;
                    rentRow.rentValue = 0;
                    rentRow.rentIsPaid = true;
                } else {
                    rentRow.rentValuePaid = Number((rentRow.rentValuePaid + rentAdvance).toFixed(2));
                    rentRow.rentValue = Number((rentRow.rentValue - rentAdvance).toFixed(2));
                    rentAdvance = 0;
                }
            }

            if (rentRow.rentValue === 0) {
                rentRow.rentIsPaid = true;
            }

            rentPaymentsInitial.push(rentRow);
        }
    }

    return rentPaymentsInitial
}


export const calculateRentPayments = (rentDetails: RentDetails, action: any): RentPayment[] => {
    let {rentPeriod, rentPrice, contractLeaseDate, rentPayments, rentPaymentsPerYear} = rentDetails
    let {initiator, oldValue, newValue} = action

    if (rentPeriod > 50) {
        rentPeriod = 50
    }

    let calculatedPayments: RentPayment[] = [...rentPayments.map((e: any) =>
        ({...e, rentValue: Number(e.rentValue), rentValuePaid: Number(e.rentValuePaid)}))
    ]

    switch (initiator) {
        case "rentAdvance": {
            break;
        }

        case "rentPeriod": {
            if (newValue > 50) {
                newValue = 50
            }
            if (newValue < oldValue) { // reduce the rentPeriod
                calculatedPayments = calculatedPayments.slice(0, calculatedPayments.length - ((oldValue - newValue) * rentPaymentsPerYear));
            } else if (newValue > oldValue) { // increase the rentPeriod
                for (let i = 0; i < newValue - oldValue; i++) {
                    for (let j = 0; j < rentPaymentsPerYear; j++) {
                        const previousIndex = i * (newValue - oldValue) + j;
                        const previousRentPaymentDate = calculatedPayments[previousIndex]
                            ? dayjs(calculatedPayments[previousIndex].rentPaymentDate)
                            : dayjs(contractLeaseDate);

                        calculatedPayments.push({
                            // rentYear: dayjs(contractLeaseDate).year() + newValue - i - 1,
                            rentPaymentDate: (dayjs(contractLeaseDate).set("year", dayjs(contractLeaseDate).year() - i + 1)).toISOString(),
                            rentValue: Number((rentPrice / rentPaymentsPerYear).toFixed(2)),
                            rentValuePaid: 0,
                            rentIsPaid: false,
                        })
                    }
                }
            }
            break;
        }

        case "rentPrice": {
            calculatedPayments = calculatedPayments.map(e =>
                !e.rentIsPaid && e.rentValue !== newValue / rentPaymentsPerYear
                    ? {...e, rentValue: Number((newValue / rentPaymentsPerYear).toFixed(2))}
                    : e
            )
            break;
        }

        case "rentPaymentsPerYear": {
            if (newValue < oldValue) { // Reduce the rentPaymentsPerYear
                let newArr: any[] = [];

                for (let i = 0; i < calculatedPayments.length; i += oldValue) {
                    const tempArr = calculatedPayments.filter(e => dayjs(e.rentPaymentDate).year() === dayjs(calculatedPayments[i].rentPaymentDate).year());
                    newArr = [...newArr, ...tempArr.slice(0, newValue)];
                }

                calculatedPayments = [...newArr];
            } else if (newValue > oldValue) { // increase the rentPaymentsPerYear
                const tempArr = [];

                for (let i = 0; i < rentPeriod; i++) {
                    for (let j = 0; j < newValue - oldValue; j++) {
                        const previousIndex = i * (newValue - oldValue) + j;
                        const previousRentPaymentDate = calculatedPayments[previousIndex]
                            ? dayjs(calculatedPayments[previousIndex].rentPaymentDate)
                            : dayjs(contractLeaseDate);

                        const rentRow = {
                            rentPaymentDate: previousIndex >= 0
                                ? calculateNextPaymentDate(previousRentPaymentDate, newValue).toISOString()
                                : contractLeaseDate,
                            rentValue: Number((rentPrice / newValue).toFixed(2)),
                            rentValuePaid: 0,
                            rentIsPaid: false,
                        }
                        calculatedPayments.push(rentRow);
                        // tempArr.push(rentRow);
                    }
                }


            }

            calculatedPayments = calculatedPayments.map(e =>
                !e.rentIsPaid && e.rentValue !== rentPrice / newValue
                    ? {...e, rentValue: Number((rentPrice / newValue).toFixed(2))}
                    : e
            )

            break;
        }
    }

    calculatedPayments.sort((a, b) => dayjs(a.rentPaymentDate).unix() - dayjs(b.rentPaymentDate).unix());

    return calculatedPayments
}
