import * as React from 'react';
import AppBar from '@mui/material/AppBar';
import Box from '@mui/material/Box';
import Toolbar from '@mui/material/Toolbar';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import Menu from '@mui/material/Menu';
import MenuIcon from '@mui/icons-material/Menu';
import Container from '@mui/material/Container';
import Button from '@mui/material/Button';
import MenuItem from '@mui/material/MenuItem';
import LanguageIcon from '@mui/icons-material/Language';
import { Outlet, Link } from 'react-router-dom';
import { isExpired } from 'react-jwt';
import { useNavigate } from 'react-router-dom';

const pages = [
    { label: 'Devices state', route: '/dashboard' },
    { label: 'Generate Data', route: '/generate' },
];

interface Props {
    updateToken: (token: string) => void;
}

function Navbar({ updateToken }: Props) {
    const navigate = useNavigate();

    const [anchorElNav, setAnchorElNav] = React.useState<null | HTMLElement>(
        null
    );

    const handleOpenNavMenu = (event: React.MouseEvent<HTMLElement>) => {
        setAnchorElNav(event.currentTarget);
    };

    const handleCloseNavMenu = () => {
        setAnchorElNav(null);
    };

    return (
        <>
            <AppBar position="static">
                <Container maxWidth={false} sx={{ backgroundColor: 'black' }}>
                    <Toolbar disableGutters>
                        <Link to="/">
                            <Typography
                                variant="h6"
                                noWrap
                                sx={{
                                    mr: 2,
                                    display: { xs: 'none', md: 'flex' },
                                    alignItems: 'center',
                                    fontFamily: 'monospace',
                                    fontWeight: 700,
                                    letterSpacing: '.3rem',
                                    color: 'inherit',
                                    textDecoration: 'none',
                                }}
                            >
                                <LanguageIcon
                                    sx={{
                                        display: { xs: 'none', md: 'flex' },
                                        mr: 1,
                                    }}
                                />
                                IoT Dashboard
                            </Typography>
                        </Link>

                        <Box
                            sx={{
                                flexGrow: 1,
                                display: { xs: 'flex', md: 'none' },
                            }}
                        >
                            <IconButton
                                size="large"
                                aria-label="account of current user"
                                aria-controls="menu-appbar"
                                aria-haspopup="true"
                                onClick={handleOpenNavMenu}
                                color="inherit"
                            >
                                <MenuIcon />
                            </IconButton>
                            <Menu
                                id="menu-appbar"
                                anchorEl={anchorElNav}
                                anchorOrigin={{
                                    vertical: 'bottom',
                                    horizontal: 'left',
                                }}
                                keepMounted
                                transformOrigin={{
                                    vertical: 'top',
                                    horizontal: 'left',
                                }}
                                open={Boolean(anchorElNav)}
                                onClose={handleCloseNavMenu}
                                sx={{
                                    display: { xs: 'block', md: 'none' },
                                }}
                            >
                                {pages.map((page) => (
                                    <MenuItem
                                        key={page.label}
                                        onClick={handleCloseNavMenu}
                                    >
                                        <Typography textAlign="center">
                                            {page.label}
                                        </Typography>
                                    </MenuItem>
                                ))}
                            </Menu>
                        </Box>
                        <Box
                            sx={{
                                flexGrow: 1,
                                display: { xs: 'none', md: 'flex' },
                            }}
                        >
                            {pages.map((page) => (
                                <Link key={page.label} to={page.route}>
                                    <Button
                                        key={page.label}
                                        onClick={handleCloseNavMenu}
                                        sx={{
                                            my: 2,
                                            color: 'white',
                                            display: 'block',
                                        }}
                                    >
                                        {page.label}
                                    </Button>
                                </Link>
                            ))}
                        </Box>
                        {isExpired(localStorage.getItem('token') ?? '') ? (
                            <>
                                <Link to="/">
                                    <Button
                                        sx={{
                                            my: 2,
                                            color: 'white',
                                            display: 'block',
                                        }}
                                    >
                                        Login
                                    </Button>
                                </Link>
                                <Link to="/signup">
                                    <Button
                                        sx={{
                                            my: 2,
                                            color: 'white',
                                            display: 'block',
                                        }}
                                    >
                                        Sign Up
                                    </Button>
                                </Link>
                            </>
                        ) : (
                            <Button
                                sx={{
                                    my: 2,
                                    color: 'white',
                                    display: 'block',
                                }}
                                onClick={() => {
                                    updateToken('');
                                    navigate('/');
                                }}
                            >
                                Logout
                            </Button>
                        )}
                        <div className="logo"></div>
                    </Toolbar>
                </Container>
            </AppBar>
            <Outlet />
        </>
    );
}

export default Navbar;
