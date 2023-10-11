import {IconAlertTriangle} from '@tabler/icons-react';

function ExclamationIcon({width, height, style}: { width: number, height: number, style?: React.CSSProperties }) {
    const defaultStyle = {
        width,
        height,
        color: "red",
    }

    const iconStyle = {...defaultStyle, ...style}

    return <IconAlertTriangle style={iconStyle}/>
}

export default ExclamationIcon
