import prisma from "@/prisma/client"
import {NextRequest, NextResponse} from "next/server"
import {Table} from "@prisma/client"
import dayjs from "dayjs"
import isValidDate from "@/app/utils/isValidDate"
import customParseFormat from "dayjs/plugin/customParseFormat"

dayjs.extend(customParseFormat)

export async function GET(req: NextRequest) {
    try {
        const data: Table[] = await prisma.table.findMany({
            orderBy: {
                id: 'asc'
            }
        })

        return NextResponse.json(data, {
            status: 200
        })
    } catch (error) {
        return NextResponse.json(
            {error: "Failed to get table!"},
            {status: 500}
        )
    }
}

export async function POST(req: NextRequest) {
    try {
        const data = await req.json()

        const formattedData = {
            ...data
        }

        if (formattedData.hasOwnProperty("contract_sale_date")) {
            if (isValidDate(data.contract_sale_date)) {
                formattedData.contract_sale_date = dayjs(data.contract_sale_date, "DD.MM.YYYY").format()
            } else {
                formattedData.contract_sale_date = null
            }
        }

        if (formattedData.hasOwnProperty("extract_land_date")) {
            if (isValidDate(data.extract_land_date)) {
                formattedData.extract_land_date = dayjs(data.extract_land_date, "DD.MM.YYYY").format()
            } else {
                formattedData.extract_land_date = null
            }
        }

        if (formattedData.hasOwnProperty("contract_lease_date")) {
            if (isValidDate(data.contract_lease_date)) {
                formattedData.contract_lease_date = dayjs(data.contract_lease_date, "DD.MM.YYYY").format()
            } else {
                formattedData.contract_lease_date = null
            }
        }

        if (data.id) {
            return NextResponse.json(
                {error: "You cannot specify the ID when creating a new record."},
                {status: 400}
            )
        }

        const newData = await prisma.table.create({
            data: formattedData
        })

        return NextResponse.json(newData, {status: 201})
    } catch (error) {
        return NextResponse.json(
            {error: "Failed to create table data!"},
            {status: 500}
        )
    }
}

export async function PUT(req: NextRequest) {
    try {
        const data = await req.json()
        const id = data.id

        const formattedData = {
            ...data
        }

        if (formattedData.id) delete formattedData.id

        if (formattedData.hasOwnProperty("contract_sale_date")) {
            if (isValidDate(data.contract_sale_date)) {
                formattedData.contract_sale_date = dayjs(data.contract_sale_date, "DD.MM.YYYY").format()
            } else {
                formattedData.contract_sale_date = null
            }
        }

        if (formattedData.hasOwnProperty("extract_land_date")) {
            if (isValidDate(data.extract_land_date)) {
                formattedData.extract_land_date = dayjs(data.extract_land_date, "DD.MM.YYYY").format()
            } else {
                formattedData.extract_land_date = null
            }
        }

        if (formattedData.hasOwnProperty("contract_lease_date")) {
            if (isValidDate(data.contract_lease_date)) {
                formattedData.contract_lease_date = dayjs(data.contract_lease_date, "DD.MM.YYYY").format()
            } else {
                formattedData.contract_lease_date = null
            }
        }

        await prisma.table.update({
            where: {id},
            data: formattedData
        })

        return new NextResponse(null, {status: 204})
    } catch (error) {
        console.log(error)
        return NextResponse.json(
            {error: "Failed to update table data!"},
            {status: 500}
        )
    }
}

export async function DELETE(req: NextRequest) {
    try {
        const {id} = await req.json()

        await prisma.table.delete({
            where: {id}
        })

        return new NextResponse(null, {status: 204})
    } catch (error) {
        return NextResponse.json(
            {error: "Failed to delete table data!"},
            {status: 500}
        )
    }
}
