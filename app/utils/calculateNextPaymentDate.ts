import dayjs, {Dayjs} from "dayjs";
import {RentPayment} from "@/types/interfaces";

const isLeapYear = (year: number): boolean => (year % 4 === 0 && year % 100 !== 0) || (year % 400 === 0);

export const calculateNextPaymentDate = (previousRentPaymentDate: Dayjs | null, rentPaymentPerYear: number): Dayjs => {
    // const daysInYear = isLeapYear(dayjs(previousRentPaymentDate).year()) ? 366 : 365;
    const daysBetweenPayments = Math.floor(365 / rentPaymentPerYear);
    return dayjs(previousRentPaymentDate)
        .add(Math.floor(daysBetweenPayments), "day");
}

export const updatePaymentsDate = (payments: any, rentPaymentPerYear: number): RentPayment[] => {
    const calculatedPayments = [];

    const daysBetweenPayments = 365 / rentPaymentPerYear;
    const groups: number[] = Array.from(new Set(payments.map((payment: {
        rentPaymentsGroup: any;
    }) => payment.rentPaymentsGroup)));

    for (let i = 0; i < groups.length; i++) {
        const paymentsInGroup = payments.filter((e: { rentPaymentsGroup: number; }) => e.rentPaymentsGroup === i);

        const startDate = paymentsInGroup[0].rentIsPaid
            ? dayjs(paymentsInGroup[0].rentPaymentDate)
            : dayjs(paymentsInGroup[0].rentPaymentDate).startOf("year");

        for (let j = 0; j < rentPaymentPerYear; j++) {
            if (i > 0) {
                const rentRow: any = {
                    ...paymentsInGroup[j],
                    rentPaymentDate: calculatedPayments.filter(e => e.rentPaymentsGroup === i - 1)[j].rentPaymentDate
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

export const calculatePaymentDatesInitial = (contractLeaseDate: Dayjs, rentPeriod: number, rentPaymentsPerYear: number) => {
    const calculatedPayments: any = [];

    const daysDiff = 365 - contractLeaseDate.diff(dayjs(contractLeaseDate).startOf("year"), "day");
    const daysBetweenPayments = Math.floor(daysDiff / rentPaymentsPerYear);

    for (let i = 0; i < rentPeriod; i++) {
        for (let j = 0; j < rentPaymentsPerYear; j++) {
            if (i > 0) {
                calculatedPayments.push({
                    rentPaymentsGroup: i,
                    rentPaymentDate: dayjs(
                        calculatedPayments.filter((e: {
                            rentPaymentsGroup: number
                        }) => e.rentPaymentsGroup === i - 1)[j].rentPaymentDate
                    ).add(1, "year").toISOString()
                });

                continue;
            }
            if (j === 0) {
                calculatedPayments.push({
                    rentPaymentsGroup: i,
                    rentPaymentDate: contractLeaseDate.toISOString()
                });
            } else {
                calculatedPayments.push({
                    rentPaymentsGroup: i,
                    rentPaymentDate: dayjs(calculatedPayments[j - 1].rentPaymentDate)
                        .add(daysBetweenPayments, "day")
                        .toISOString()
                });
            }
        }
    }

    return calculatedPayments;
}
