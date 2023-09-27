import {RingProgress} from "@mantine/core"

export default function PieChart({values}: {values: number[]}) {
    return (
        <div className="flex justify-center items-center -mt-4">
            <RingProgress
                size={120}
                thickness={36}
                sections={[
                    {
                        value: values[0],
                        color: 'green',
                        tooltip: (
                            <span>
                                Здано <strong>{values[0]}%</strong>
                            </span>
                        ),
                    },
                    {
                        value: values[1],
                        color: 'red',
                        tooltip: (
                            <span>
                                Не здано <strong>{values[1]}%</strong>
                            </span>
                        ),
                    },
                ]}
            />
        </div>
    )
}
