import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useState } from 'react';
import {
    HomeIcon,
    FireIcon,
    UserGroupIcon,
    ArrowRightOnRectangleIcon,
    Bars3Icon,
    XMarkIcon,
} from '@heroicons/react/24/outline';

const Layout = () => {
    const { entrenador, logout } = useAuth();
    const location = useLocation();
    const navigate = useNavigate();
    const [sidebarOpen, setSidebarOpen] = useState(false);

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const menuItems = [
        { name: 'Dashboard', path: '/dashboard', icon: HomeIcon },
        { name: 'Rutinas', path: '/rutinas', icon: FireIcon },
        { name: 'Entrenadores', path: '/entrenadores', icon: UserGroupIcon },
    ];

    const isActive = (path) => location.pathname === path;

    return (
        <div className="min-h-screen bg-gray-50 flex">
            {/* Sidebar Desktop */}
            <aside className="hidden lg:flex lg:flex-col lg:w-64 bg-white shadow-lg">
                <div className="p-6 border-b border-gray-200">
                    <h1 className="text-2xl font-bold text-blue-600">💪 Gym Manager</h1>
                </div>

                <nav className="flex-1 p-4 space-y-2">
                    {menuItems.map((item) => {
                        const Icon = item.icon;
                        return (
                            <Link
                                key={item.path}
                                to={item.path}
                                className={`flex items-center gap-3 px-4 py-3 rounded-lg transition ${isActive(item.path)
                                        ? 'bg-blue-600 text-white'
                                        : 'text-gray-700 hover:bg-gray-100'
                                    }`}
                            >
                                <Icon className="w-5 h-5" />
                                <span className="font-medium">{item.name}</span>
                            </Link>
                        );
                    })}
                </nav>

                <div className="p-4 border-t border-gray-200">
                    <div className="bg-gray-50 rounded-lg p-4 mb-3">
                        <p className="font-semibold text-gray-800 text-sm">
                            {entrenador?.first_name} {entrenador?.last_name}
                        </p>
                        <p className="text-xs text-gray-600">@{entrenador?.username}</p>
                        <p className="text-xs text-blue-600 mt-1">{entrenador?.especialidad}</p>
                    </div>
                    <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-red-600 hover:bg-red-50 transition"
                    >
                        <ArrowRightOnRectangleIcon className="w-5 h-5" />
                        <span className="font-medium">Cerrar Sesión</span>
                    </button>
                </div>
            </aside>

            {/* Sidebar Mobile */}
            {sidebarOpen && (
                <div className="fixed inset-0 z-50 lg:hidden">
                    <div
                        className="fixed inset-0 bg-black bg-opacity-50"
                        onClick={() => setSidebarOpen(false)}
                    ></div>
                    <aside className="fixed inset-y-0 left-0 w-64 bg-white shadow-lg flex flex-col">
                        <div className="p-6 border-b border-gray-200 flex justify-between items-center">
                            <h1 className="text-2xl font-bold text-blue-600">💪 Gym Manager</h1>
                            <button onClick={() => setSidebarOpen(false)}>
                                <XMarkIcon className="w-6 h-6 text-gray-600" />
                            </button>
                        </div>

                        <nav className="flex-1 p-4 space-y-2">
                            {menuItems.map((item) => {
                                const Icon = item.icon;
                                return (
                                    <Link
                                        key={item.path}
                                        to={item.path}
                                        onClick={() => setSidebarOpen(false)}
                                        className={`flex items-center gap-3 px-4 py-3 rounded-lg transition ${isActive(item.path)
                                                ? 'bg-blue-600 text-white'
                                                : 'text-gray-700 hover:bg-gray-100'
                                            }`}
                                    >
                                        <Icon className="w-5 h-5" />
                                        <span className="font-medium">{item.name}</span>
                                    </Link>
                                );
                            })}
                        </nav>

                        <div className="p-4 border-t border-gray-200">
                            <button
                                onClick={handleLogout}
                                className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-red-600 hover:bg-red-50 transition"
                            >
                                <ArrowRightOnRectangleIcon className="w-5 h-5" />
                                <span className="font-medium">Cerrar Sesión</span>
                            </button>
                        </div>
                    </aside>
                </div>
            )}

            {/* Main Content */}
            <div className="flex-1 flex flex-col">
                {/* Top Bar Mobile */}
                <header className="lg:hidden bg-white shadow-sm p-4 flex items-center justify-between">
                    <button onClick={() => setSidebarOpen(true)}>
                        <Bars3Icon className="w-6 h-6 text-gray-700" />
                    </button>
                    <h1 className="text-xl font-bold text-blue-600">💪 Gym Manager</h1>
                    <div className="w-6"></div>
                </header>

                <main className="flex-1 overflow-y-auto">
                    <Outlet />
                </main>
            </div>
        </div>
    );
};

export default Layout;