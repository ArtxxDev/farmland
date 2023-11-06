export const calculateRentValuePaid = (row: any) => {
    if (!row.rent_payments) return null;

    return row.rent_payments
        .filter((payment: any) => payment && !isNaN(payment.rentValuePaid))
        .reduce((total: any, payment: any) => total + Number(payment.rentValuePaid), 0)
        .toFixed(2);
}

export const calculateRentValueNotPaid = (row: any) => {
    if (!row.rent_payments) return 0;

    return row.rent_payments
        .filter((payment: any) => payment && !isNaN(payment.rentValue))
        .reduce((total: any, payment: any) => total + Number(payment.rentValue), 0)
        .toFixed(2);
};

