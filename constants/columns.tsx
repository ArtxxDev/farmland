export const columnsData = [
        {
            header: "Область",
            accessorKey: "oblast",
            filterVariant: 'multi-select',
        },
        {
            header: "Район",
            accessorKey: "region",
            filterVariant: 'multi-select',
        },
        {
            header: "Кадастровий номер",
            accessorKey: "cadastral",
            size: 200,
        },
        {
            header: "Склад узгідь",
            accessorKey: "composition",
            filterVariant: 'multi-select',
        },
        {
            accessorKey: 'area',
            header: 'Площа ділянки',
            filterVariant: 'range-slider',
            filterFn: 'betweenInclusive',
            mantineFilterRangeSliderProps: {
                step: 0.1,
                minRange: 0.1
            }
        },
        {
            header: "НГО",
            accessorKey: "ngo",
            filterVariant: 'range-slider',
            filterFn: 'betweenInclusive',
            mantineFilterRangeSliderProps: {
                minRange: 10
            }
        },
        {
            header: "Власник / Орендодавець",
            accessorKey: "owner",
            filterVariant: 'multi-select',
        },
        {
            header: "Договір купівлі-продажу",
            accessorKey: "contract",
        },
        {
            accessorFn: (originalRow: any) => new Date(originalRow.extract_date),
            id: 'contract_date',
            header: 'Дата договору купівлі-продажу',
            filterVariant: 'date-range',
            size: 300,
            // @ts-ignore
            Cell: ({cell}: any) => Date.parse(cell.getValue<Date>()) ? cell.getValue<Date>().toLocaleDateString() : null,
        },
        {
            header: "Витяг (номер запису в реєстрі)",
            accessorKey: "extract",
        },
        {
            accessorFn: (originalRow: any) => new Date(originalRow.extract_date),
            id: 'extract_date',
            header: 'Дата витягу',
            filterVariant: 'date-range',
            size: 300,
            // @ts-ignore
            Cell: ({cell}: any) => Date.parse(cell.getValue<Date>()) ? cell.getValue<Date>().toLocaleDateString() : null,
        },
        {
            header: "Наявність відсканованих документів",
            accessorKey: "document",
            size: 500
        },
        {
            header: "Витрати на оформлення земельної ділянки",
            accessorKey: "expenses",
            filterVariant: 'range-slider',
            filterFn: 'between',
        }
    ]
