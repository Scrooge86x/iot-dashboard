import { useState, useEffect } from 'react';
import { LineChart } from '@mui/x-charts/LineChart';

import type IData from '../types/IData';

export default function LatestReadingsChart() {
    const [loading, setLoading] = useState(true);
    const [readings, setReadings] = useState<IData[]>([]);

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            const response = await fetch(
                'http://localhost:3100/api/data/lasthour',
                {
                    method: 'GET',
                    headers: {
                        Accept: 'application/json',
                        'Content-Type': ' application/json',
                        'x-access-token': `Bearer ${
                            localStorage.getItem('token') ?? ''
                        }`,
                    },
                }
            );
            if (!response.ok) {
                setLoading(false);
                return;
            }

            const data = await response.json();
            const filteredData: Array<IData & { readingDate: Date }> =
                data.filter((reading: IData) => reading.readingDate);

            setReadings(
                filteredData.sort(
                    (a, b) =>
                        new Date(a.readingDate).getTime() -
                        new Date(b.readingDate).getTime()
                )
            );
            setLoading(false);
        };
        fetchData();
    }, []);

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
                    scaleType: 'band',
                    data: readings.map((reading: IData) => {
                        const date = new Date(reading.readingDate ?? 0);
                        const timeStr = date.toLocaleTimeString('pl-PL', {
                            hour: '2-digit',
                            minute: '2-digit',
                            second: '2-digit',
                        });
                        return `${timeStr} (device: ${reading.deviceId})`;
                    }),
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
            margin={{ right: 24 }}
            sx={{ backgroundColor: '#000' }}
            slotProps={{
                legend: {
                    labelStyle: { fill: '#fff' },
                },
            }}
        />
    );
}
