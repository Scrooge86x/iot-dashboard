import { useState } from 'react';
import {
    Modal,
    Box,
    Typography,
    Button,
    MenuItem,
    Select,
    FormControl,
    InputLabel,
    Stack,
} from '@mui/material';
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { createTheme } from '@mui/material';
import { ThemeProvider } from '@emotion/react';
import type { SelectChangeEvent } from '@mui/material';

export interface DateRangeSelection {
    deviceId: number;
    fromDate: Date;
    toDate: Date;
}

interface DateRangePickerModalProps {
    open: boolean;
    onClose: () => void;
    onSubmit: (selection: DateRangeSelection) => void;
}

const darkTheme = createTheme({
    palette: {
        mode: 'dark',
    },
});

export default function DateRangePickerModal({
    open,
    onClose,
    onSubmit,
}: DateRangePickerModalProps) {
    const [deviceId, setDeviceId] = useState<number>(0);
    const [fromDate, setFromDate] = useState<Date | null>(null);
    const [toDate, setToDate] = useState<Date | null>(null);

    const handleDeviceChange = (event: SelectChangeEvent<number>) => {
        setDeviceId(Number(event.target.value));
    };

    const handleSubmit = () => {
        if (!fromDate || !toDate) {
            return onClose();
        }

        onSubmit({
            deviceId,
            fromDate,
            toDate,
        });
        onClose();
    };

    return (
        <ThemeProvider theme={darkTheme}>
            <Modal open={open} onClose={onClose}>
                <Box
                    sx={{
                        position: 'absolute',
                        top: '50%',
                        left: '50%',
                        transform: 'translate(-50%, -50%)',
                        width: 400,
                        bgcolor: 'background.paper',
                        boxShadow: 24,
                        p: 3,
                        borderRadius: 1,
                    }}
                >
                    <Typography variant="h6" component="h2" mb={2}>
                        Select Date Range
                    </Typography>
                    <Stack spacing={2}>
                        <FormControl fullWidth>
                            <InputLabel>Device ID</InputLabel>
                            <Select
                                value={deviceId}
                                label="Device ID"
                                onChange={handleDeviceChange}
                            >
                                {[...Array(17).keys()].map((id) => (
                                    <MenuItem key={id} value={id}>
                                        Device {id}
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                        <LocalizationProvider dateAdapter={AdapterDateFns}>
                            <DateTimePicker
                                label="From Date"
                                value={fromDate}
                                onChange={setFromDate}
                                maxDateTime={toDate || undefined}
                            />
                            <DateTimePicker
                                label="To Date"
                                value={toDate}
                                onChange={setToDate}
                                minDateTime={fromDate || undefined}
                            />
                        </LocalizationProvider>
                        <Stack
                            direction="row"
                            spacing={1}
                            justifyContent="flex-end"
                            mt={1}
                        >
                            <Button variant="outlined" onClick={onClose}>
                                Cancel
                            </Button>
                            <Button
                                variant="contained"
                                onClick={handleSubmit}
                                disabled={!fromDate || !toDate}
                            >
                                Apply
                            </Button>
                        </Stack>
                    </Stack>
                </Box>
            </Modal>
        </ThemeProvider>
    );
}
