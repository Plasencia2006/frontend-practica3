import { useState, useEffect } from 'react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import {
    PlusIcon,
    PencilSquareIcon,
    TrashIcon,
    XMarkIcon,
} from '@heroicons/react/24/outline';

const Rutinas = () => {
    const { entrenador } = useAuth();
    const [rutinas, setRutinas] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editingRutina, setEditingRutina] = useState(null);
    const [formData, setFormData] = useState({
        nombre: '',
        duracion: '',
        nivel: 'principiante',
        descripcion: '',
    });
    const [error, setError] = useState('');

    useEffect(() => {
        fetchRutinas();
    }, []);

    const fetchRutinas = async () => {
        try {
            setLoading(true);
            const response = await api.get('/rutinas/');

            console.log('Rutinas response:', response.data);

            const rutinasData = Array.isArray(response.data)
                ? response.data
                : response.data.results || [];

            setRutinas(rutinasData);
        } catch (error) {
            console.error('Error fetching rutinas:', error);
            setError('Error al cargar las rutinas');
        } finally {
            setLoading(false);
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        try {
            if (editingRutina) {
                console.log('Actualizando rutina ID:', editingRutina.id);

                // ✅ ACTUALIZAR - Usar PUT con JSON
                const response = await api.put(
                    `/rutinas/${editingRutina.id}/`,
                    {
                        nombre: formData.nombre,
                        duracion: formData.duracion,
                        nivel: formData.nivel,
                        descripcion: formData.descripcion,
                    }
                );

                console.log('Rutina actualizada:', response.data);
            } else {
                // ✅ CREAR - Usar POST con JSON
                await api.post('/rutinas/', {
                    nombre: formData.nombre,
                    duracion: formData.duracion,
                    nivel: formData.nivel,
                    descripcion: formData.descripcion,
                });
            }

            handleCloseModal();
            fetchRutinas();
        } catch (error) {
            console.error('❌ Error saving rutina:', error);
            console.error('Response:', error.response?.data);

            // Mostrar error detallado
            if (error.response?.data) {
                const errors = error.response.data;
                const errorMsg = typeof errors === 'object'
                    ? Object.entries(errors)
                        .map(([key, value]) => `${key}: ${Array.isArray(value) ? value.join(', ') : value}`)
                        .join(' | ')
                    : errors.detail || 'Error al guardar';
                setError(errorMsg);
            } else {
                setError('Error al guardar la rutina');
            }
        }
    };

    const handleEdit = (rutina) => {
        setEditingRutina(rutina);
        setFormData({
            nombre: rutina.nombre,
            duracion: rutina.duracion,
            nivel: rutina.nivel,
            descripcion: rutina.descripcion || '',
        });

        setShowModal(true);
    };

    const handleDelete = async (id) => {
        if (window.confirm('¿Estás seguro de eliminar esta rutina?')) {
            try {
                await api.delete(`/rutinas/${id}/`);
                fetchRutinas();
            } catch (error) {
                console.error('Error deleting rutina:', error);
                alert('Error al eliminar la rutina');
            }
        }
    };

    const handleCloseModal = () => {
        setShowModal(false);
        setEditingRutina(null);
        setFormData({
            nombre: '',
            duracion: '',
            nivel: 'principiante',
            descripcion: '',
        });
        setError('');
    };

    const getNivelColor = (nivel) => {
        const colors = {
            principiante: 'bg-green-100 text-green-800',
            intermedio: 'bg-yellow-100 text-yellow-800',
            avanzado: 'bg-red-100 text-red-800',
        };
        return colors[nivel] || 'bg-gray-100 text-gray-800';
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="flex justify-between items-center mb-8">
                <h1 className="text-3xl font-bold text-gray-800">Rutinas</h1>
                <button
                    onClick={() => setShowModal(true)}
                    className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition flex items-center gap-2"
                >
                    <PlusIcon className="w-5 h-5" />
                    Nueva Rutina
                </button>
            </div>

            {error && (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                    {error}
                </div>
            )}

            {rutinas.length === 0 ? (
                <div className="text-center py-12 bg-white rounded-xl shadow">
                    <p className="text-gray-500 text-lg">No hay rutinas registradas</p>
                    <button
                        onClick={() => setShowModal(true)}
                        className="mt-4 text-blue-600 hover:text-blue-800 font-semibold"
                    >
                        Crear la primera rutina
                    </button>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {rutinas.map((rutina) => {
                        return (
                            <div
                                key={rutina.id}
                                className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition"
                            >
                                {/* ✅ HEADER CON COLOR SEGÚN NIVEL */}
                                <div className={`w-full h-32 ${rutina.nivel === 'principiante' ? 'bg-gradient-to-br from-green-400 to-green-600' :
                                        rutina.nivel === 'intermedio' ? 'bg-gradient-to-br from-yellow-400 to-yellow-600' :
                                            'bg-gradient-to-br from-red-400 to-red-600'
                                    } flex items-center justify-center`}>
                                    <h3 className="text-2xl font-bold text-white">{rutina.nombre}</h3>
                                </div>

                                <div className="p-6">
                                    <div className="flex justify-between items-start mb-3">
                                        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getNivelColor(rutina.nivel)}`}>
                                            {rutina.nivel}
                                        </span>
                                    </div>

                                    <p className="text-gray-600 text-sm mb-3">
                                        {rutina.descripcion || 'Sin descripción'}
                                    </p>

                                    <div className="flex items-center text-gray-600 text-sm mb-4">
                                        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                        {rutina.duracion} minutos
                                    </div>

                                    <div className="flex justify-between items-center pt-4 border-t border-gray-200">
                                        <span className="text-sm text-gray-600">
                                            Por: {rutina.entrenador_nombre || `${entrenador?.first_name || ''} ${entrenador?.last_name || ''}`}
                                        </span>
                                        <div className="flex gap-2">
                                            <button
                                                onClick={() => handleEdit(rutina)}
                                                className="text-blue-600 hover:text-blue-800 p-2 hover:bg-blue-50 rounded transition"
                                            >
                                                <PencilSquareIcon className="w-5 h-5" />
                                            </button>
                                            <button
                                                onClick={() => handleDelete(rutina.id)}
                                                className="text-red-600 hover:text-red-800 p-2 hover:bg-red-50 rounded transition"
                                            >
                                                <TrashIcon className="w-5 h-5" />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            {/* Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                        <div className="p-6 border-b border-gray-200 flex justify-between items-center">
                            <h2 className="text-2xl font-bold text-gray-800">
                                {editingRutina ? 'Editar Rutina' : 'Nueva Rutina'}
                            </h2>
                            <button
                                onClick={handleCloseModal}
                                className="text-gray-600 hover:text-gray-800 p-2 hover:bg-gray-100 rounded transition"
                            >
                                <XMarkIcon className="w-6 h-6" />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="p-6 space-y-4">
                            {error && (
                                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
                                    {error}
                                </div>
                            )}

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Nombre de la Rutina *
                                </label>
                                <input
                                    type="text"
                                    name="nombre"
                                    value={formData.nombre}
                                    onChange={handleInputChange}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                    required
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Duración (minutos) *
                                    </label>
                                    <input
                                        type="number"
                                        name="duracion"
                                        value={formData.duracion}
                                        onChange={handleInputChange}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                        required
                                        min="1"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Nivel *
                                    </label>
                                    <select
                                        name="nivel"
                                        value={formData.nivel}
                                        onChange={handleInputChange}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                        required
                                    >
                                        <option value="principiante">Principiante</option>
                                        <option value="intermedio">Intermedio</option>
                                        <option value="avanzado">Avanzado</option>
                                    </select>
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Descripción
                                </label>
                                <textarea
                                    name="descripcion"
                                    value={formData.descripcion}
                                    onChange={handleInputChange}
                                    rows="3"
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                />
                            </div>

                            <div className="flex gap-4 pt-4">
                                <button
                                    type="button"
                                    onClick={handleCloseModal}
                                    className="flex-1 bg-gray-300 text-gray-800 py-3 rounded-lg font-semibold hover:bg-gray-400 transition"
                                >
                                    Cancelar
                                </button>
                                <button
                                    type="submit"
                                    className="flex-1 bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition"
                                >
                                    {editingRutina ? 'Actualizar' : 'Crear'} Rutina
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Rutinas;