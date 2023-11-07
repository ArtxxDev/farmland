export const validateCadastral = (cadastral: string) => {
    if (cadastral && cadastral.length > 0) {
        return /^\d{10}:\d{2}:\d{3}:\d{4}$/.test(cadastral);
    }

    return true;
}
