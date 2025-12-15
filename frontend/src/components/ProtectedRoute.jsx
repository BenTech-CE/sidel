import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';

const ProtectedRoute = ({ children }) => {
    const token = localStorage.getItem('userToken');
    if (!token) {
        return <Navigate to="/" replace />;
    }
    return children ? children : <Outlet />;
};

export default ProtectedRoute;