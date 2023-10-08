import {IconX} from "@tabler/icons-react"

function CrossIcon({width, height, onClick}: { width: number, height: number, onClick?: () => void }) {
    const style = {
        width,
        height,
        color: "red",
        cursor: onClick ? "pointer" : "auto",
    }

    return <IconX style={style} onClick={onClick}/>
}

export default CrossIcon
