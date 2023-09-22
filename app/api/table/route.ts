import prisma from "@/prisma/client"
import {NextRequest, NextResponse} from "next/server"
import {Table} from "@prisma/client"
import dayjs from "dayjs"
import customParseFormat from "dayjs/plugin/customParseFormat"

dayjs.extend(customParseFormat)

const isValidDate = (dateString: string) => {
    const date = dayjs(dateString, "DD.MM.YYYY")
    return date.isValid()
}

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

        const formattedContractSaleDate = isValidDate(data.contract_sale_date)
            ? dayjs(data.contract_sale_date, "DD.MM.YYYY").format() : null

        const formattedExtractDate = isValidDate(data.extract_land_date)
            ? dayjs(data.extract_land_date, "DD.MM.YYYY").format() : null

        const formattedContractLeaseDate = isValidDate(data.contract_lease_date)
            ? dayjs(data.contract_lease_date, "DD.MM.YYYY").format() : null

        if (data.id) {
            return NextResponse.json(
                {error: "You cannot specify the ID when creating a new record."},
                {status: 400}
            )
        }

        const newData = await prisma.table.create({
            data: {
                ...data,
                contract_sale_date: formattedContractSaleDate,
                extract_land_date: formattedExtractDate,
                contract_lease_date: formattedContractLeaseDate,
            }
        })

        return NextResponse.json(newData, {status: 201})
    } catch (error) {
        console.log(error)
        return NextResponse.json(
            {error: "Failed to create table data!"},
            {status: 500}
        )
    }
}

export async function PUT(req: NextRequest) {
    try {
        const data = await req.json()

        const formattedContractSaleDate = isValidDate(data.contract_sale_date)
            ? dayjs(data.contract_sale_date, "DD.MM.YYYY").format() : null

        const formattedExtractDate = isValidDate(data.extract_land_date)
            ? dayjs(data.extract_land_date, "DD.MM.YYYY").format() : null

        const formattedContractLeaseDate = isValidDate(data.contract_lease_date)
            ? dayjs(data.contract_lease_date, "DD.MM.YYYY").format() : null

        await prisma.table.update({
            where: {id: data.id},
            data: {
                ...data,
                contract_sale_date: formattedContractSaleDate,
                extract_land_date: formattedExtractDate,
                contract_lease_date: formattedContractLeaseDate,
            }
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
