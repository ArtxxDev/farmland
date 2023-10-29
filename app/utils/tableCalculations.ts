export const calculatePaidRentValue = (row: any) => {
    if (!row.rent_payments) {
        return null
    }

    return row.rent_payments
        .filter((payment: any) => payment && !isNaN(payment.rentPrice) && !payment.rentIsPaid)
        .reduce((total: any, payment: any) => total + Number(payment.rentPrice), 0)
        .toFixed(2)
}

export const calculateNotPaidRentValue = (row: any) => {
    if (!row.rent_payments) {
        return 0
    }

    return row.rent_payments
        .filter((payment: any) => payment && !isNaN(payment.rentPrice) && payment.rentIsPaid)
        .reduce((total: any, payment: any) => total + Number(payment.rentPrice), 0)
        .toFixed(2)
}
