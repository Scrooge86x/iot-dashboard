# iot-dashboard
Uni exercises archive.

## Repo Structure:
- Separate branch for each weekly lab (`lab-06`, `lab-07`, etc.)
- Branches represent final states, not development history (using file transfer)

## Environment Configuration
The MongoDB connection requires setting the `DB_PASSWORD` environment variable.

### Windows (PowerShell):
```powershell
$env:DB_PASSWORD="password"
```

### Windows (Cmd):
```bat
set DB_PASSWORD=password
```

### Linux/MacOS:
```bash
export DB_PASSWORD=password
```

## Development Scripts:
- `npm run build` - builds the project
- `npm run watch` - run with live reload using [nodemon](https://www.npmjs.com/package/nodemon)
- `npm run dev`, `npm run start` - uses [ts-node](https://www.npmjs.com/package/ts-node) to run the project without precompiling it
