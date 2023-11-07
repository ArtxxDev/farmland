import isValidDate from "@/app/utils/isValidDate"
import dayjs from "dayjs"
import {useState} from "react"
import dateToLocalFormat from "./dateToLocalFormat"

export function useEditDate(props: any) {
    const {
        cell,
        column,
        row,
        table
    } = props
    const {
        getState,
        setEditingCell,
        setEditingRow,
        setCreatingRow
    } = table
    const {
        editingRow,
        creatingRow
    } = getState()

    const isCreating = creatingRow?.id === row.id
    const isEditing = editingRow?.id === row.id

    const initialValue = isValidDate(cell.getValue()) ? dayjs(cell.getValue(), "DD.MM.YYYY").toDate() : cell.getValue()

    const [value, setValue] = useState(() => initialValue || null)

    const handleOnChange = (newValue: any) => {
        row._valuesCache[column.id] = dateToLocalFormat(newValue)

        if (isCreating) {
            setCreatingRow(row)
        } else if (isEditing) {
            setEditingRow(row)
        }

        setValue(newValue)
    }

    const handleBlur = () => {
        setEditingCell(null)
    }

    return {value, handleOnChange, handleBlur}
}


export function useEditText(props: any) {
    const {
        cell,
        column,
        row,
        table
    } = props
    const {
        getState,
        setEditingCell,
        setEditingRow,
        setCreatingRow
    } = table
    const {
        editingRow,
        creatingRow
    } = getState()

    const [value, setValue] = useState(() => cell.getValue())
    const isCreating = creatingRow?.id === row.id
    const isEditing = editingRow?.id === row.id

    const handleOnChange = (newValue: any) => {
        //@ts-ignore
        row._valuesCache[column.id] = newValue
        if (isCreating) setCreatingRow(row)
        else if (isEditing) setEditingRow(row)
        setValue(newValue)
    }

    const handleBlur = () => {
        setEditingCell(null)
    }

    return {value, handleOnChange, handleBlur}
}

export function useEditNumber(props: any) {
    const {
        cell,
        column,
        row,
        table
    } = props
    const {
        getState,
        setEditingCell,
        setEditingRow,
        setCreatingRow
    } = table
    const {
        editingRow,
        creatingRow
    } = getState()

    const [value, setValue] = useState(() => Number(cell.getValue()))
    const isCreating = creatingRow?.id === row.id
    const isEditing = editingRow?.id === row.id

    const handleOnChange = (newValue: any) => {
        //@ts-ignore
        row._valuesCache[column.id] = newValue
        if (isCreating) setCreatingRow(row)
        else if (isEditing) setEditingRow(row)
        
        setValue(newValue)
    }

    const handleBlur = () => {
        setEditingCell(null)
    }

    return {value, handleOnChange, handleBlur}
}
