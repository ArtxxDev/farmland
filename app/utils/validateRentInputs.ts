export const isValidRentInputs = (
    rentAdvanceInput: string,
    rentPeriodInput: string,
    rentPriceInput: string
) => {
    const rentAdvance = Number(rentAdvanceInput)
    const rentPeriod = Number(rentPeriodInput)
    const rentPrice = Number(rentPriceInput)

    return (!(isNaN(rentPeriod) || rentPeriod < 1) && !isNaN(rentAdvance) && !isNaN(rentPrice))
}
