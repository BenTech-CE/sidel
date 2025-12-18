import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ProtectedRoute = ({ children }) => {
    const { logged, loading } = useAuth();

    if (loading) {
        return <div>Carregando...</div>;
    }

    if (!logged) {
        return <Navigate to="/" replace />;
    }

    return children ? children : <Outlet />;
};

export default ProtectedRoute;