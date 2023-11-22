import dayjs, {Dayjs} from "dayjs";

const isLeapYear = (year: number): boolean => (year % 4 === 0 && year % 100 !== 0) || (year % 400 === 0);

export const calculateNextPaymentDate = (previousRentPaymentDate: Dayjs | null, rentPaymentPerYear: number): Dayjs => {
    const daysInYear = isLeapYear(dayjs(previousRentPaymentDate).year()) ? 366 : 365;
    const daysBetweenPayments = daysInYear / rentPaymentPerYear;
    return dayjs(previousRentPaymentDate)
        .add(Math.floor(daysBetweenPayments), "day");
}
