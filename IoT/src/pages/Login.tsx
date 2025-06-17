import { Component } from 'react';
import { TextField, Button, Container, Typography, Alert } from '@mui/material';
import { createTheme } from '@mui/material';
import { ThemeProvider } from '@emotion/react';
import { Navigate } from 'react-router-dom';
import { isExpired } from 'react-jwt';

import type { ChangeEvent, FormEvent } from 'react';

interface Account {
    username: string;
    password: string;
}

interface Errors {
    username?: string;
    password?: string;
}

interface State {
    account: Account;
    errors: Errors;
    isAuthenticated: boolean;
}

const darkTheme = createTheme({
    palette: {
        mode: 'dark',
    },
});

class LoginForm extends Component<
    { updateToken: (token: string) => void },
    State
> {
    state: State = {
        account: {
            username: '',
            password: '',
        },
        errors: {},
        isAuthenticated: !isExpired(localStorage.getItem('token') ?? ''),
    };

    validate = (): Errors | null => {
        const errors: Errors = {};

        const { account } = this.state;
        if (account.username.trim() === '') {
            errors.username = 'Username is required!';
        }
        if (account.password.trim() === '') {
            errors.password = 'Password is required!';
        }

        return Object.keys(errors).length === 0 ? null : errors;
    };

    handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        const errors = this.validate();
        this.setState({ errors: errors || {} });
        if (errors) {
            return;
        }

        const { username, password } = this.state.account;
        const response = await fetch('http://localhost:3100/api/user/auth', {
            method: 'POST',
            headers: {
                Accept: 'application/json',
                'Content-Type': ' application/json',
            },
            body: JSON.stringify({
                login: username,
                password,
            }),
        });
        if (!response.ok) {
            this.setState({
                errors: {
                    password: 'Invalid username or password.',
                },
            });
            return;
        }

        const { token } = await response.json();
        if (!token) {
            this.setState({
                errors: {
                    password: 'Something went wrong.',
                },
            });
            return;
        }

        this.props.updateToken(token);
        this.setState({
            isAuthenticated: true,
        });
    };

    handleChange = (event: ChangeEvent<HTMLInputElement>) => {
        const account = { ...this.state.account };
        const targetName = event.currentTarget.name as 'username' | 'password';
        account[targetName] = event.currentTarget.value;
        this.setState({ account });
    };

    render() {
        if (this.state.isAuthenticated) {
            return <Navigate to="/dashboard" replace />;
        }

        return (
            <ThemeProvider theme={darkTheme}>
                <Container maxWidth="sm">
                    <Typography variant="h4" component="h1" gutterBottom>
                        Login
                    </Typography>
                    <form onSubmit={this.handleSubmit}>
                        <div className="form-group">
                            <TextField
                                label="Username"
                                value={this.state.account.username}
                                name="username"
                                onChange={this.handleChange}
                                fullWidth
                                margin="normal"
                                variant="outlined"
                            />
                            {this.state.errors.username && (
                                <Alert severity="error">
                                    {this.state.errors.username}
                                </Alert>
                            )}
                        </div>
                        <div className="form-group">
                            <TextField
                                label="Password"
                                value={this.state.account.password}
                                name="password"
                                onChange={this.handleChange}
                                type="password"
                                fullWidth
                                margin="normal"
                                variant="outlined"
                            />
                            {this.state.errors.password && (
                                <Alert severity="error">
                                    {this.state.errors.password}
                                </Alert>
                            )}
                        </div>
                        <Button
                            type="submit"
                            variant="contained"
                            color="primary"
                            fullWidth
                        >
                            Login
                        </Button>
                    </form>
                </Container>
            </ThemeProvider>
        );
    }
}

export default LoginForm;
