import { useEffect, useState } from 'react';
import reactLogo from '../assets/react.svg';
import viteLogo from '/vite.svg';
import DeviceCard from '../components/DeviceCard';
import Charts from '../components/Charts';
import { Button } from '@mui/material';
import DateRangePickerModal from '../components/DateRangePickerModal';
import LatestReadingsChart from '../components/LatestReadingsChart';

import type IData from '../types/IData';
import type { DateRangeSelection } from '../components/DateRangePickerModal';

export default function Dashboard() {
    const [count, setCount] = useState(0);
    const [latestReadings, setLatestReadings] = useState<IData[]>([]);
    const [selectedDeviceId, setSelectedDeviceId] = useState({ id: 0 });
    const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);
    const [hasInvalidDate, setHasInvalidDate] = useState(false);

    const updateReadings = async () => {
        const response = await fetch('http://localhost:3100/api/data/latest', {
            method: 'GET',
            headers: {
                Accept: 'application/json',
                'Content-Type': ' application/json',
                'x-access-token': `Bearer ${
                    localStorage.getItem('token') ?? ''
                }`,
            },
        });
        if (!response.ok) {
            return;
        }

        const data = await response.json();
        setLatestReadings(
            data.sort((a: IData, b: IData) => a.deviceId - b.deviceId)
        );
    };

    const removeReadingsInRange = async (
        deviceId: number,
        from: Date,
        to: Date
    ) => {
        await fetch(`http://localhost:3100/api/data/${deviceId}`, {
            method: 'DELETE',
            headers: {
                Accept: 'application/json',
                'Content-Type': ' application/json',
                'x-access-token': `Bearer ${
                    localStorage.getItem('token') ?? ''
                }`,
            },
            body: JSON.stringify({
                from,
                to,
            }),
        });
    };

    useEffect(() => {
        updateReadings();
        const interval = setInterval(updateReadings, 5000);
        return () => clearInterval(interval);
    }, []);

    return (
        <>
            <div>
                <a href="https://vite.dev" target="_blank">
                    <img src={viteLogo} className="logo" alt="Vite logo" />
                </a>
                <a href="https://react.dev" target="_blank">
                    <img
                        src={reactLogo}
                        className="logo react"
                        alt="React logo"
                    />
                </a>
            </div>
            <h1>Vite + React</h1>
            <div className="card">
                <button onClick={() => setCount((count) => count + 1)}>
                    count is {count}
                </button>
                <p>
                    Edit <code>src/App.tsx</code> and save to test HMR
                </p>
            </div>
            <p className="read-the-docs">
                Click on the Vite and React logos to learn more
            </p>
            <div
                style={{
                    display: 'flex',
                    flexDirection: 'row',
                    alignItems: 'center',
                }}
            >
                {latestReadings[selectedDeviceId.id]?.temperature && (
                    <DeviceCard
                        data={latestReadings[selectedDeviceId.id]}
                        hasInvalidDate={hasInvalidDate}
                    />
                )}
                {latestReadings[selectedDeviceId.id]?.temperature && (
                    <Charts
                        deviceId={selectedDeviceId}
                        setHasInvalidDate={setHasInvalidDate}
                    />
                )}
            </div>
            <div id="readings-list">
                {latestReadings.map(
                    (reading: IData, index) =>
                        reading.temperature && (
                            <DeviceCard
                                key={index}
                                data={reading}
                                isActive={index == selectedDeviceId.id}
                                onClick={() =>
                                    setSelectedDeviceId({ id: index })
                                }
                            />
                        )
                )}
            </div>
            <Button onClick={() => setIsDatePickerOpen(true)}>
                Remove readings in range
            </Button>
            <DateRangePickerModal
                open={isDatePickerOpen}
                onClose={() => setIsDatePickerOpen(false)}
                onSubmit={async (selection: DateRangeSelection) => {
                    await removeReadingsInRange(
                        selection.deviceId,
                        selection.fromDate,
                        selection.toDate
                    );
                    updateReadings();
                    setSelectedDeviceId({ id: selectedDeviceId.id });
                }}
            />
            <LatestReadingsChart />
        </>
    );
}
