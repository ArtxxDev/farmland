import toast from "react-hot-toast"

export const notifySuccess = (message: string) => toast.success(message, {style:{fontWeight: "600"}})
export const notifyError = (message: string) => toast.error(message, {style:{fontWeight: "600"}})
