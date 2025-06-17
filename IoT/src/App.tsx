import './App.css';
import { isExpired } from 'react-jwt';
import { BrowserRouter, Route, Routes, Navigate } from 'react-router-dom';
import { useState } from 'react';

import Dashboard from './pages/Dashboard';
import LoginForm from './pages/Login';
import Navbar from './components/Navbar';
import SignUpForm from './pages/SignUpForm';
import GenerateData from './pages/GenerateData';

function App() {
    const [token, setToken] = useState(localStorage.getItem('token') ?? '');

    const updateToken = (token: string) => {
        localStorage.setItem('token', token);
        setToken(token);
    };

    return (
        <BrowserRouter>
            <Routes>
                <Route element={<Navbar updateToken={updateToken} />}>
                    <Route
                        index
                        element={
                            isExpired(token) ? (
                                <LoginForm updateToken={updateToken} />
                            ) : (
                                <Navigate replace to="/dashboard" />
                            )
                        }
                    ></Route>
                    <Route
                        path="dashboard"
                        element={
                            isExpired(token) ? (
                                <Navigate replace to="/" />
                            ) : (
                                <Dashboard />
                            )
                        }
                    ></Route>
                    <Route
                        path="signup"
                        element={
                            isExpired(token) ? (
                                <SignUpForm />
                            ) : (
                                <Navigate replace to="/dashboard" />
                            )
                        }
                    ></Route>
                    <Route
                        path="generate"
                        element={
                            isExpired(token) ? (
                                <Navigate replace to="/" />
                            ) : (
                                <GenerateData />
                            )
                        }
                    ></Route>
                    <Route
                        path="*"
                        element={<p>404 Page not found.</p>}
                    ></Route>
                </Route>
            </Routes>
        </BrowserRouter>
    );
}

export default App;
