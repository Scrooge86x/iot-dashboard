import type DeviceReading from '../types/IData';

import Typography from '@mui/material/Typography';
import DeviceThermostatIcon from '@mui/icons-material/DeviceThermostat';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import OpacityIcon from '@mui/icons-material/Opacity';

interface Props {
    data: DeviceReading;
    isActive?: boolean;
    hasInvalidDate?: boolean;
    onClick?: () => void;
}

function DeviceCard({ data, isActive, hasInvalidDate, onClick }: Props) {
    return (
        <Typography
            style={{
                padding: '10px',
                width: '13rem',
                textAlign: 'left',
                backgroundColor: hasInvalidDate
                    ? '#500'
                    : isActive
                    ? '#0eb4b3'
                    : '#1e1e1e',
                maxHeight: '150px',
                minWidth: '210px',
            }}
            component="div"
            onClick={onClick}
        >
            <span
                style={{
                    fontWeight: 'bold',
                    fontSize: '1.3em',
                }}
            >
                Device No. {data.deviceId}
            </span>
            <hr style={{ border: '2px solid white' }} />
            <Typography variant="h6" component="div">
                <DeviceThermostatIcon></DeviceThermostatIcon>
                <span className="value">{data.temperature}</span>{' '}
                <span>&deg;C</span>
            </Typography>
            <Typography variant="h6" component="div">
                <CloudUploadIcon></CloudUploadIcon>
                <span className="value">{data.pressure}</span> hPa
            </Typography>
            <Typography variant="h6" component="div">
                <OpacityIcon></OpacityIcon>
                <span className="value">{data.humidity}</span>%
            </Typography>
        </Typography>
    );
}

export default DeviceCard;
