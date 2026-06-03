import { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';
import { useNavigate } from 'react-router-dom';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [entrenador, setEntrenador] = useState(null);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        const token = localStorage.getItem('access_token');
        const userData = localStorage.getItem('entrenador');

        if (token && userData) {
            setEntrenador(JSON.parse(userData));
        }
        setLoading(false);
    }, []);

    const login = async (username, password) => {
        try {
            const response = await api.post('/entrenadores/login/', {
                username,
                password,
            });

            const { access, refresh, entrenador } = response.data;

            localStorage.setItem('access_token', access);
            localStorage.setItem('refresh_token', refresh);
            localStorage.setItem('entrenador', JSON.stringify(entrenador));

            setEntrenador(entrenador);
            navigate('/dashboard');
            return { success: true };
        } catch (error) {
            return {
                success: false,
                error: error.response?.data?.error || 'Error al iniciar sesión'
            };
        }
    };

    const logout = () => {
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        localStorage.removeItem('entrenador');
        setEntrenador(null);
        navigate('/login');
    };

    const value = {
        entrenador,
        loading,
        login,
        logout,
        isAuthenticated: !!entrenador,
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth debe usarse dentro de AuthProvider');
    }
    return context;
};