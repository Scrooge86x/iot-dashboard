import { useEffect, useState } from 'react';
import reactLogo from './assets/react.svg';
import viteLogo from '/vite.svg';
import Navbar from './components/Navbar';
import DeviceCard from './components/DeviceCard';
import Charts from './components/Charts';
import './App.css';

import type IData from './types/IData';

function App() {
    const [count, setCount] = useState(0);
    const [readings, setReadings] = useState<IData[]>([]);
    const [selectedDeviceId, setSelectedDeviceId] = useState(0);

    useEffect(() => {
        (async () => {
            const response = await fetch(
                'http://localhost:3100/api/data/latest'
            );
            if (!response.ok) {
                return;
            }

            const data = await response.json();
            setReadings(
                data.sort((a: IData, b: IData) => a.deviceId - b.deviceId)
            );
        })();
    }, [readings]);

    return (
        <>
            <Navbar />
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
                {readings[selectedDeviceId]?.temperature && (
                    <DeviceCard data={readings[selectedDeviceId]} />
                )}
                {readings[selectedDeviceId]?.temperature && (
                    <Charts deviceId={selectedDeviceId} />
                )}
            </div>
            <div id="readings-list">
                {readings.map(
                    (reading: IData, index) =>
                        reading.temperature && (
                            <DeviceCard
                                key={index}
                                data={reading}
                                isActive={index == selectedDeviceId}
                                onClick={() => setSelectedDeviceId(index)}
                            />
                        )
                )}
            </div>
        </>
    );
}

export default App;
