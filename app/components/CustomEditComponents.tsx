import {NumberInput, Textarea} from "@mantine/core"
import {DatePickerInput} from "@mantine/dates"
import React from "react"
import {useEditText, useEditDate, useEditNumber} from "@/app/utils/editComponentsHandlers"

export function EditTextArea(props: any) {
    const {value, handleOnChange, handleBlur} = useEditText(props);

    return (
        <Textarea
            value={value || ""}
            onChange={(e) => handleOnChange(e.currentTarget.value)}
            onBlur={handleBlur}
            placeholder={props.column.columnDef.header}
        />
    )
}

export function EditDateRange(props: any) {
    const {value, handleOnChange, handleBlur} = useEditDate(props);

    return (
        <DatePickerInput
            value={value}
            valueFormat="DD.MM.YYYY"
            onChange={(newValue) => {
                const rentDetailsCreatingEffect = props.rentDetailsCreatingEffect;

                handleOnChange({newValue, rentDetailsCreatingEffect});
            }}
            onBlur={handleBlur}
            dropdownType="modal"
            locale="ru"
            placeholder={props.column.columnDef.header}
            clearable
        />
    )
}

export function EditNumberInput(props: any) {
    const {value, handleOnChange, handleBlur} = useEditNumber(props)

    return (
        <NumberInput
            value={value || ""}
            onChange={(newValue) => handleOnChange(newValue)}
            onBlur={handleBlur}
            placeholder={props.column.columnDef.header}
            min={0}
            precision={props.precision}
            hideControls
        />
    )
}