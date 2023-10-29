import {Textarea} from "@mantine/core"
import {DatePickerInput} from "@mantine/dates"
import React from "react"
import {useEdit, useEditDate} from "@/app/utils/editComponentsHandlers"

export function EditTextArea(props: any) {
    const {value, handleOnChange, handleBlur} = useEdit(props)

    return (
        <Textarea
            placeholder={props.column.columnDef.header}
            value={value || ""}
            onBlur={handleBlur}
            onChange={(e) => handleOnChange(e.currentTarget.value)}
        />
    )
}

export function EditDateRange(props: any) {
    const {value, handleOnChange, handleBlur} = useEditDate(props)

    return (
        <DatePickerInput
            dropdownType="modal"
            placeholder={props.column.columnDef.header}
            locale="ru"
            valueFormat="DD.MM.YYYY"
            value={value}
            onBlur={handleBlur}
            onChange={(newValue) => handleOnChange(newValue)}
            clearable
        />
    )
}
