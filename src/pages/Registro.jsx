import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../services/api';

const Registro = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        username: '',
        first_name: '',
        last_name: '',
        email: '',
        especialidad: '',
        telefono: '',
        password: '',
        password2: '',
    });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        if (formData.password !== formData.password2) {
            setError('Las contraseñas no coinciden');
            setLoading(false);
            return;
        }

        try {
            console.log('🚀 Enviando datos al backend...');
            console.log('URL:', `${api.defaults.baseURL}/entrenadores/register/`);
            console.log('Data:', formData);

            const response = await api.post('/entrenadores/register/', formData);

            console.log('✅ Respuesta recibida:', response.data);

            // Guardar tokens automáticamente
            localStorage.setItem('access_token', response.data.access);
            localStorage.setItem('refresh_token', response.data.refresh);
            localStorage.setItem('entrenador', JSON.stringify(response.data.entrenador));

            navigate('/dashboard');
        } catch (err) {
            console.error('❌ Error completo:', err);
            console.error('📦 Response:', err.response);
            console.error('📄 Data:', err.response?.data);
            console.error('🔢 Status:', err.response?.status);

            if (err.response) {
                const errors = err.response.data;

                if (typeof errors === 'object') {
                    const errorMsg = Object.entries(errors)
                        .map(([key, value]) => {
                            if (Array.isArray(value)) {
                                return `${key}: ${value.join(', ')}`;
                            }
                            return `${key}: ${value}`;
                        })
                        .join(' | ');
                    setError(errorMsg);
                } else if (typeof errors === 'string') {
                    setError(errors);
                } else {
                    setError('Error en el registro. Verifica los datos.');
                }
            } else if (err.request) {
                setError('No se pudo conectar al servidor. Verifica que el backend esté corriendo.');
            } else {
                setError('Error al registrar. Intenta nuevamente.');
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-green-500 to-teal-600 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl p-8">
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-bold text-gray-800">Crear Cuenta</h1>
                    <p className="text-gray-600 mt-2">Registro de Entrenador</p>
                </div>

                {error && (
                    <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                        <strong>Error:</strong> {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Usuario *
                            </label>
                            <input
                                type="text"
                                name="username"
                                value={formData.username}
                                onChange={handleChange}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Email *
                            </label>
                            <input
                                type="email"
                                name="email"
                                value={formData.email}
                                onChange={handleChange}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Nombre *
                            </label>
                            <input
                                type="text"
                                name="first_name"
                                value={formData.first_name}
                                onChange={handleChange}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Apellido *
                            </label>
                            <input
                                type="text"
                                name="last_name"
                                value={formData.last_name}
                                onChange={handleChange}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Especialidad *
                            </label>
                            <input
                                type="text"
                                name="especialidad"
                                value={formData.especialidad}
                                onChange={handleChange}
                                placeholder="Ej: Musculación, Cardio, Yoga"
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Teléfono *
                            </label>
                            <input
                                type="tel"
                                name="telefono"
                                value={formData.telefono}
                                onChange={handleChange}
                                placeholder="957713180"
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Contraseña *
                            </label>
                            <input
                                type="password"
                                name="password"
                                value={formData.password}
                                onChange={handleChange}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                                required
                                minLength="8"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Confirmar Contraseña *
                            </label>
                            <input
                                type="password"
                                name="password2"
                                value={formData.password2}
                                onChange={handleChange}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                                required
                                minLength="8"
                            />
                        </div>
                    </div>

                    <div className="flex gap-4 mt-6">
                        <Link
                            to="/login"
                            className="flex-1 bg-gray-300 text-gray-800 py-3 rounded-lg text-center font-semibold hover:bg-gray-400 transition"
                        >
                            Cancelar
                        </Link>
                        <button
                            type="submit"
                            disabled={loading}
                            className="flex-1 bg-green-600 text-white py-3 rounded-lg font-semibold hover:bg-green-700 transition disabled:bg-gray-400"
                        >
                            {loading ? 'Registrando...' : 'Registrarse'}
                        </button>
                    </div>
                </form>

                <div className="mt-6 text-center">
                    <Link to="/login" className="text-green-600 hover:text-green-800 text-sm">
                        ¿Ya tienes cuenta? Inicia sesión
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default Registro;