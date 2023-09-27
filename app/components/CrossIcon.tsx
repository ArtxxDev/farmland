import {IconX} from '@tabler/icons-react'

function CrossIcon({width, height}: { width: number, height: number }) {
    return (
        <IconX
            style={{
                width,
                height,
                color: 'red',
            }}
        />
    )
}

export default CrossIcon
