import {Input, NumberInput, Textarea, Autocomplete} from "@mantine/core";
import {DatePickerInput} from "@mantine/dates";
import React from "react";
import {useEditText, useEditDate, useEditNumber} from "@/app/utils/editComponentsHandlers";
import {IMaskInput} from "react-imask";

export function EditTextArea(props: any) {
    const {value, handleOnChange, handleBlur} = useEditText(props);

    return (
        <Textarea
            value={value || ""}
            onChange={(e) => handleOnChange(e.currentTarget.value)}
            onBlur={handleBlur}
            placeholder={props.column.columnDef.header}
        />
    );
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
    );
}

export function EditNumberInput(props: any) {
    const {value, handleOnChange, handleBlur} = useEditNumber(props);

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
    );
}

export function EditCadastralInput(props: any) {
    const {value, handleOnChange, handleBlur} = useEditText(props);

    return (
        <Input
            component={IMaskInput}
            mask="0000000000:00:000:0000"
            value={value || ""}
            onChange={(e) => handleOnChange(e.currentTarget.value)}
            onBlur={handleBlur}
            placeholder={props.column.columnDef.header}
        />
    );
}

export function EditAutocompleteInput(props: any) {
    const {value, handleOnChange, handleBlur} = useEditText(props);
    const data = props.data.filter((e: any) => e !== null && e !== "" && e !== undefined)

    return (
        <Autocomplete
            value={value || ""}
            onChange={handleOnChange}
            onBlur={handleBlur}
            placeholder={props.column.columnDef.header}
            data={data}
        />
    );
}
