import { useState } from 'react';
import {
    createTheme,
    TextField,
    Button,
    Container,
    Typography,
    Alert,
    Box,
} from '@mui/material';
import { ThemeProvider } from '@emotion/react';

import type { ChangeEvent, FormEvent } from 'react';
import type IData from '../types/IData';

export default function GenerateData() {
    const [successMessage, setSuccessMessage] = useState<string | null>(null);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const [data, setData] = useState<IData>({
        temperature: 0,
        pressure: 0,
        humidity: 0,
        deviceId: 0,
    });

    const darkTheme = createTheme({
        palette: {
            mode: 'dark',
        },
    });

    const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        const response = await fetch(
            `http://localhost:3100/api/data/${data.deviceId}`,
            {
                method: 'POST',
                headers: {
                    Accept: 'application/json',
                    'Content-Type': ' application/json',
                    'x-access-token': `Bearer ${
                        localStorage.getItem('token') ?? ''
                    }`,
                },
                body: JSON.stringify({
                    air: [
                        {
                            id: 1,
                            value: data.temperature,
                        },
                        {
                            id: 2,
                            value: data.pressure,
                        },
                        {
                            id: 3,
                            value: data.humidity,
                        },
                    ],
                }),
            }
        );
        if (!response.ok) {
            setErrorMessage('Generating data failed.');
            setSuccessMessage(null);
            return;
        }
        const result = await response.json();
        if (result.temperature) {
            setSuccessMessage(`Data added successfully.`);
            setErrorMessage(null);
        } else {
            setErrorMessage('Generating data failed.');
            setSuccessMessage(null);
        }
    };

    const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
        const { name, value } = event.target;
        setData((prevData) => ({
            ...prevData,
            [name]: value,
        }));
    };

    return (
        <ThemeProvider theme={darkTheme}>
            <Container maxWidth="sm">
                <Typography variant="h4" component="h1" gutterBottom>
                    Generate Data
                </Typography>
                {errorMessage && (
                    <Box mb={2}>
                        <Alert severity="error">{errorMessage}</Alert>
                    </Box>
                )}
                {successMessage && (
                    <Box mb={2}>
                        <Alert severity="success">{successMessage}</Alert>
                    </Box>
                )}
                <form onSubmit={handleSubmit}>
                    <Box mb={2}>
                        <TextField
                            label="Temperature"
                            value={data.temperature}
                            name="temperature"
                            onChange={handleChange}
                            type="number"
                            fullWidth
                            variant="outlined"
                        />
                    </Box>
                    <Box mb={2}>
                        <TextField
                            label="Pressure"
                            value={data.pressure}
                            name="pressure"
                            onChange={handleChange}
                            type="number"
                            fullWidth
                            variant="outlined"
                        />
                    </Box>
                    <Box mb={2}>
                        <TextField
                            label="Humididy"
                            value={data.humidity}
                            name="humidity"
                            onChange={handleChange}
                            type="number"
                            fullWidth
                            variant="outlined"
                        />
                    </Box>
                    <Box mb={2}>
                        <TextField
                            label="Device Id"
                            value={data.deviceId}
                            name="deviceId"
                            onChange={handleChange}
                            type="number"
                            inputProps={{ min: 0, max: 16 }}
                            fullWidth
                            variant="outlined"
                        />
                    </Box>
                    <Button
                        type="submit"
                        variant="contained"
                        color="primary"
                        fullWidth
                    >
                        Generate Data
                    </Button>
                </form>
            </Container>
        </ThemeProvider>
    );
}
