import { useState, useEffect } from 'react';
import { LineChart } from '@mui/x-charts/LineChart';

import type IData from '../types/IData';

const margin = { right: 24 };

interface Props {
    deviceId: number;
}

export default function Charts({ deviceId }: Props) {
    const [loading, setLoading] = useState(true);
    const [readings, setReadings] = useState<IData[]>([]);

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            const response = await fetch(
                `http://localhost:3100/api/data/${deviceId}`
            );
            if (!response.ok) {
                setLoading(false);
                return;
            }

            const data = await response.json();
            setReadings(data.filter((reading: IData) => reading.readingDate));
            setLoading(false);
        };
        fetchData();
    }, [deviceId]);

    if (loading) {
        return (
            <div
                style={{
                    height: 400,
                }}
            ></div>
        );
    }

    return (
        <LineChart
            height={400}
            series={[
                {
                    data: readings.map(
                        (reading: IData) => reading.pressure / 10
                    ),
                    label: 'Pressure x10 [hPa]',
                    color: '#059593',
                },
                {
                    data: readings.map((reading: IData) => reading.humidity),
                    label: 'Humidity [%]',
                    color: '#5395bb',
                },
                {
                    data: readings.map((reading: IData) => reading.temperature),
                    label: 'Temperature [°C]',
                    color: '#d300f5',
                },
            ]}
            xAxis={[
                {
                    scaleType: 'time',
                    data: readings.map(
                        (reading: IData) => new Date(reading.readingDate ?? 0)
                    ),
                    tickLabelStyle: { fill: '#fff' },
                },
            ]}
            yAxis={[
                {
                    min: 0,
                    max: 120,
                    tickLabelStyle: { fill: '#fff' },
                },
            ]}
            margin={margin}
            sx={{ backgroundColor: '#000' }}
            slotProps={{
                legend: {
                    labelStyle: { fill: '#fff' },
                },
            }}
        />
    );
}
