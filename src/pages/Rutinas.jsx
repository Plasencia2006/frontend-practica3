import { useState, useEffect } from 'react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import {
    PlusIcon,
    PencilSquareIcon,
    TrashIcon,
    PhotoIcon,
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
        imagen: null,
    });
    const [previewImage, setPreviewImage] = useState(null);
    const [error, setError] = useState('');

    // ✅ URL base para imágenes
    const API_BASE_URL = import.meta.env.VITE_API_URL
        ? import.meta.env.VITE_API_URL.replace('/api', '')
        : 'http://localhost:8000';

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

            // ✅ Debug: Verificar imágenes
            rutinasData.forEach(r => {
                console.log(`Rutina: ${r.nombre}, Imagen: ${r.imagen}`);
            });

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

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setFormData(prev => ({
                ...prev,
                imagen: file
            }));

            // Crear preview
            const reader = new FileReader();
            reader.onloadend = () => {
                setPreviewImage(reader.result);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        try {
            const data = new FormData();
            data.append('nombre', formData.nombre);
            data.append('duracion', formData.duracion);
            data.append('nivel', formData.nivel);
            data.append('descripcion', formData.descripcion);

            // ✅ IMPORTANTE: Solo agregar imagen si hay una nueva
            if (formData.imagen && formData.imagen instanceof File) {
                data.append('imagen', formData.imagen);
                console.log('Agregando nueva imagen:', formData.imagen.name);
            } else if (editingRutina && editingRutina.imagen) {
                // Si no hay nueva imagen pero existe una anterior, NO la agregamos
                // El backend mantendrá la imagen existente
                console.log('Manteniendo imagen existente');
            }

            if (editingRutina) {
                console.log('Actualizando rutina ID:', editingRutina.id);
                console.log('Data a enviar:', Object.fromEntries(data));

                // ✅ ACTUALIZAR - Usar PUT con FormData
                const response = await api.put(
                    `/rutinas/${editingRutina.id}/`,
                    data,
                    {
                        headers: {
                            'Content-Type': 'multipart/form-data',
                        },
                    }
                );

                console.log('Rutina actualizada:', response.data);
            } else {
                // Crear nueva rutina
                await api.post('/rutinas/', data, {
                    headers: {
                        'Content-Type': 'multipart/form-data',
                    },
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
            imagen: null,
        });

        // ✅ CORREGIDO: Manejo seguro de URL de imagen
        if (rutina.imagen) {
            const imageUrl = rutina.imagen.startsWith('http')
                ? rutina.imagen
                : `${API_BASE_URL}${rutina.imagen}`;
            setPreviewImage(imageUrl);
        } else {
            setPreviewImage(null);
        }

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
            imagen: null,
        });
        setPreviewImage(null);
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

    // ✅ Función para obtener URL de imagen
    const getImageUrl = (imagenPath) => {
        if (!imagenPath) return null;

        // Si ya es URL completa, retornarla
        if (imagenPath.startsWith('http')) {
            return imagenPath;
        }

        // Si comienza con /media/, agregar el base URL
        if (imagenPath.startsWith('/media/')) {
            return `${API_BASE_URL}${imagenPath}`;
        }

        // Si no, asumir que es una ruta relativa
        return `${API_BASE_URL}${imagenPath}`;
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
                    <PhotoIcon className="w-24 h-24 text-gray-300 mx-auto mb-4" />
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
                        const imageUrl = getImageUrl(rutina.imagen);

                        return (
                            <div
                                key={rutina.id}
                                className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition"
                            >
                                {/* ✅ CORREGIDO: Manejo de imagen con fallback */}
                                <div className="w-full h-48 bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center relative overflow-hidden">
                                    {imageUrl ? (
                                        <>
                                            <img
                                                src={imageUrl}
                                                alt={rutina.nombre}
                                                className="w-full h-full object-cover"
                                                onError={(e) => {
                                                    console.error('Error cargando imagen:', imageUrl);
                                                    e.target.style.display = 'none';
                                                    const placeholder = e.target.parentElement.querySelector('.placeholder-img');
                                                    if (placeholder) {
                                                        placeholder.classList.remove('hidden');
                                                        placeholder.classList.add('flex');
                                                    }
                                                }}
                                            />
                                            <div className="placeholder-img hidden absolute inset-0 items-center justify-center bg-gradient-to-br from-blue-400 to-purple-500">
                                                <PhotoIcon className="w-16 h-16 text-white opacity-50" />
                                            </div>
                                        </>
                                    ) : (
                                        <div className="flex flex-col items-center justify-center">
                                            <PhotoIcon className="w-16 h-16 text-white opacity-50" />
                                            <p className="text-white text-sm mt-2 opacity-75">Sin imagen</p>
                                        </div>
                                    )}
                                </div>

                                <div className="p-6">
                                    <div className="flex justify-between items-start mb-3">
                                        <h3 className="text-xl font-bold text-gray-800">{rutina.nombre}</h3>
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

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Imagen
                                </label>
                                <div className="mt-1 flex items-center gap-4">
                                    {previewImage && (
                                        <div className="relative">
                                            <img
                                                src={previewImage}
                                                alt="Preview"
                                                className="w-32 h-32 object-cover rounded-lg"
                                            />
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    setPreviewImage(null);
                                                    setFormData(prev => ({ ...prev, imagen: null }));
                                                }}
                                                className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                                            >
                                                <XMarkIcon className="w-4 h-4" />
                                            </button>
                                        </div>
                                    )}
                                    <label className="flex-1 cursor-pointer">
                                        <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-blue-500 transition">
                                            <PhotoIcon className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                                            <span className="text-sm text-gray-600">
                                                {previewImage ? 'Cambiar imagen' : 'Seleccionar imagen'}
                                            </span>
                                        </div>
                                        <input
                                            type="file"
                                            accept="image/*"
                                            onChange={handleImageChange}
                                            className="hidden"
                                        />
                                    </label>
                                </div>
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