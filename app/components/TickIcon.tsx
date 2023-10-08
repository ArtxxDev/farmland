import {IconCheck} from "@tabler/icons-react"

function TickIcon({width, height, onClick}: { width: number, height: number, onClick?: () => void }) {
    const style = {
        width,
        height,
        color: "green",
        cursor: onClick ? "pointer" : "auto",
    }

    return <IconCheck style={style} onClick={onClick}/>
}

export default TickIcon
