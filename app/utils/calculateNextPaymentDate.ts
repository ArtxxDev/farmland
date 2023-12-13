import dayjs, {Dayjs} from "dayjs";
import {RentPayment} from "@/types/interfaces";

const isLeapYear = (year: number): boolean => (year % 4 === 0 && year % 100 !== 0) || (year % 400 === 0);

export const calculateNextPaymentDate = (previousRentPaymentDate: Dayjs | null, rentPaymentPerYear: number): Dayjs => {
    // const daysInYear = isLeapYear(dayjs(previousRentPaymentDate).year()) ? 366 : 365;
    const daysBetweenPayments = Math.floor(365 / rentPaymentPerYear);
    return dayjs(previousRentPaymentDate)
        .add(Math.floor(daysBetweenPayments), "day");
}

export const updatePaymentsDate = (payments: RentPayment[], rentPaymentPerYear: number): RentPayment[] => {
    const calculatedPayments = [];

    const daysBetweenPayments = 365 / rentPaymentPerYear;
    const groups: number[] = Array.from(new Set(payments.map(payment => payment.rentPaymentsGroup)));

    for (let i = 0; i < groups.length; i++) {
        const paymentsInGroup = payments.filter(e => e.rentPaymentsGroup === i);

        const startDate = paymentsInGroup[0].rentIsPaid
            ? dayjs(paymentsInGroup[0].rentPaymentDate)
            : dayjs(paymentsInGroup[0].rentPaymentDate).startOf("year");

        for (let j = 0; j < rentPaymentPerYear; j++) {
            if (i > 0) {
                const rentRow: any = {
                    ...paymentsInGroup[j],
                    rentPaymentDate: calculatedPayments.filter(e => e.rentPaymentsGroup === i - 1)//[j].rentPaymentDate
                }
                console.log("NOTIFY,", calculatedPayments.filter(e => e.rentPaymentsGroup === i - 1))
                calculatedPayments.push(rentRow);
                continue;
            }
            if (paymentsInGroup[j] && paymentsInGroup[j].rentIsPaid) {
                calculatedPayments.push(paymentsInGroup[j]);
                continue;
            }

            const rentRow: any = {
                ...paymentsInGroup[j],
                rentPaymentDate: dayjs(j === 0
                    ? startDate.add(daysBetweenPayments, "day")
                    : calculatedPayments[j - 1].rentPaymentDate)
                    .add(daysBetweenPayments, "day")
                    .toISOString()
            }

            calculatedPayments.push(rentRow);
        }
    }

    calculatedPayments.forEach(e => console.log(dayjs(e.rentPaymentDate).format()))
    return calculatedPayments;
}

// export const calculatePaymentDates = (previosPayments: Dayjs[], rentPaymentsPerYear: number): Dayjs[] => {
//     const daysInYear = isLeapYear(dayjs(previosPayments[0]).year()) ? 366 : 365;
//     const daysBetweenPayments = daysInYear / rentPaymentsPerYear;
//
//     // return dayjs(previousRentPaymentDate)
//     //     .add(Math.floor(daysBetweenPayments), "day");
//
//
// }
