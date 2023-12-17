import dayjs from "dayjs"
import "dayjs/locale/ru";
import customParseFormat from "dayjs/plugin/customParseFormat";
import {RentDetails, RentPayment} from "@/types/interfaces"
import {
    calculateNextPaymentDate,
    calculatePaymentDatesInitial,
    updatePaymentsDate
} from "@/app/utils/calculateNextPaymentDate";

dayjs.extend(customParseFormat);

export const rentPaymentsInitial = (rentDetails: RentDetails) => {
    let {rentAdvance, rentPeriod, rentPrice, rentPaymentsPerYear, contractLeaseDate} = rentDetails
    const rentPaymentsInitial = []

    if (rentPeriod > 50) {
        rentPeriod = 50
    }

    let rentExcess = 0;

    const paymentDates = calculatePaymentDatesInitial(dayjs(contractLeaseDate), rentPeriod, rentPaymentsPerYear);

    for (let i = 0; i < rentPeriod; i++) {
        for (let j = 0; j < rentPaymentsPerYear; j++) {
            const rentRow: RentPayment = {
                rentPaymentsGroup: paymentDates[i * rentPaymentsPerYear + j].rentPaymentsGroup,
                rentPaymentDate: paymentDates[i * rentPaymentsPerYear + j].rentPaymentDate,
                rentValue: Number((rentPrice / rentPaymentsPerYear).toFixed(2)),
                rentValuePaid: 0,
                rentIsPaid: false,
            };

            if (rentAdvance > 0) {
                if (rentExcess > 0) {
                    const excessPayment = Math.min(rentExcess, rentRow.rentValue);
                    rentRow.rentValuePaid = excessPayment;
                    rentExcess -= excessPayment;
                    rentAdvance -= excessPayment;
                    rentRow.rentValue = Number((rentRow.rentValue - excessPayment).toFixed(2));
                }

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

            if (rentRow.rentValue === 0) rentRow.rentIsPaid = true;

            rentPaymentsInitial.push(rentRow);
        }
    }

    return rentPaymentsInitial;
}


export const calculateRentPayments = (rentDetails: RentDetails, action: any): RentPayment[] => {
    let {rentPeriod, rentPrice, contractLeaseDate, rentPayments, rentPaymentsPerYear} = rentDetails;
    let {initiator, oldValue, newValue} = action;

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
                            rentPaymentsGroup: i,
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
                const groups: number[] = Array.from(new Set(calculatedPayments.map(payment => payment.rentPaymentsGroup)));

                for (let i = 0; i < groups.length; i++) {
                    const paymentsInGroup = calculatedPayments.filter(e => e.rentPaymentsGroup === i);
                    newArr = [...newArr, ...paymentsInGroup.slice(0, newValue)];
                }

                calculatedPayments = [...newArr];
            } //else if (newValue > oldValue) { // increase the rentPaymentsPerYear
            //     const updatedDates = updatePaymentsDate(calculatedPayments, newValue);
            //
            //     for (let i = 0; i < newValue - oldValue; i++) {
            //         for (let j = 0; j < newValue; j++) {
            //             // const previousIndex = i * (newValue - oldValue) + j;
            //             // const previousRentPaymentDate = calculatedPayments[previousIndex]
            //             //     ? dayjs(calculatedPayments[previousIndex].rentPaymentDate)
            //             //     : dayjs(contractLeaseDate);
            //
            //             const rentRow: any = {
            //                 rentPaymentsGroup: i,
            //                 // rentPaymentDate: updatedDates[j].rentPaymentDate,
            //                 // rentPaymentDate: updatePaymentsDate()
            //                 rentValue: Number((rentPrice / newValue).toFixed(2)),
            //                 rentValuePaid: 0,
            //                 rentIsPaid: false,
            //             }
            //             calculatedPayments.push(rentRow);
            //         }
            //     }
            //
            //     calculatedPayments.map((e, i) => {
            //
            //     })
            //
            // }
            //
            // calculatedPayments = calculatedPayments.map(e =>
            //     !e.rentIsPaid && e.rentValue !== rentPrice / newValue
            //         ? {...e, rentValue: Number((rentPrice / newValue).toFixed(2))}
            //         : e
            // )
            //
            // break;
        }
    }

    calculatedPayments.sort((a, b) => dayjs(a.rentPaymentDate).unix() - dayjs(b.rentPaymentDate).unix());

    return calculatedPayments
}
