import {IconCheck} from '@tabler/icons-react'

function TickIcon({width, height}: { width: number, height: number }) {
    return (
        <IconCheck
            style={{
                width,
                height,
                color: 'green',
            }}
        />
    )
}

export default TickIcon
