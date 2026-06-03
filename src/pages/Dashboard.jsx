import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import {
    UserGroupIcon,
    FireIcon,
    TrophyIcon,
    ClockIcon,
} from '@heroicons/react/24/outline';

const Dashboard = () => {
    const { entrenador } = useAuth();
    const [stats, setStats] = useState({
        totalRutinas: 0,
        rutinasPrincipiante: 0,
        rutinasIntermedio: 0,
        rutinasAvanzado: 0,
        tiempoTotal: 0,
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchStats();
    }, []);

    const fetchStats = async () => {
        try {
            const response = await api.get('/rutinas/');
            const rutinas = response.data.results || response.data;

            setStats({
                totalRutinas: rutinas.length,
                rutinasPrincipiante: rutinas.filter(r => r.nivel === 'principiante').length,
                rutinasIntermedio: rutinas.filter(r => r.nivel === 'intermedio').length,
                rutinasAvanzado: rutinas.filter(r => r.nivel === 'avanzado').length,
                tiempoTotal: rutinas.reduce((acc, r) => acc + parseInt(r.duracion || 0), 0),
            });
        } catch (error) {
            console.error('Error fetching stats:', error);
        } finally {
            setLoading(false);
        }
    };

    const statCards = [
        {
            title: 'Total Rutinas',
            value: stats.totalRutinas,
            icon: FireIcon,
            color: 'bg-blue-500',
            link: '/rutinas',
        },
        {
            title: 'Principiante',
            value: stats.rutinasPrincipiante,
            icon: TrophyIcon,
            color: 'bg-green-500',
        },
        {
            title: 'Intermedio',
            value: stats.rutinasIntermedio,
            icon: TrophyIcon,
            color: 'bg-yellow-500',
        },
        {
            title: 'Avanzado',
            value: stats.rutinasAvanzado,
            icon: TrophyIcon,
            color: 'bg-red-500',
        },
        {
            title: 'Tiempo Total',
            value: `${stats.tiempoTotal} min`,
            icon: ClockIcon,
            color: 'bg-purple-500',
        },
    ];

    if (loading) {
        return (
            <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-800">
                    Bienvenido, {entrenador?.first_name} {entrenador?.last_name} 👋
                </h1>
                <p className="text-gray-600 mt-2">
                    Especialidad: <span className="font-semibold">{entrenador?.especialidad}</span>
                </p>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6 mb-8">
                {statCards.map((stat, index) => {
                    const Icon = stat.icon;
                    const Card = stat.link ? Link : 'div';
                    return (
                        <Card
                            key={index}
                            to={stat.link}
                            className={`${stat.link ? 'cursor-pointer hover:scale-105' : ''} bg-white rounded-xl shadow-lg p-6 transition`}
                        >
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-gray-600 text-sm">{stat.title}</p>
                                    <p className="text-3xl font-bold text-gray-800 mt-2">{stat.value}</p>
                                </div>
                                <div className={`${stat.color} p-3 rounded-lg`}>
                                    <Icon className="w-6 h-6 text-white" />
                                </div>
                            </div>
                        </Card>
                    );
                })}
            </div>

            {/* Quick Actions */}
            <div className="bg-white rounded-xl shadow-lg p-8">
                <h2 className="text-2xl font-bold text-gray-800 mb-6">Acciones Rápidas</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Link
                        to="/rutinas"
                        className="bg-gradient-to-r from-blue-500 to-blue-600 text-white p-6 rounded-xl hover:shadow-lg transition flex items-center justify-between"
                    >
                        <div>
                            <h3 className="text-xl font-bold">Gestionar Rutinas</h3>
                            <p className="text-blue-100 mt-1">Crear, editar y eliminar rutinas</p>
                        </div>
                        <FireIcon className="w-12 h-12 text-white opacity-80" />
                    </Link>

                    <Link
                        to="/entrenadores"
                        className="bg-gradient-to-r from-green-500 to-green-600 text-white p-6 rounded-xl hover:shadow-lg transition flex items-center justify-between"
                    >
                        <div>
                            <h3 className="text-xl font-bold">Ver Entrenadores</h3>
                            <p className="text-green-100 mt-1">Listado de entrenadores</p>
                        </div>
                        <UserGroupIcon className="w-12 h-12 text-white opacity-80" />
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;