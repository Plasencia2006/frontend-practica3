import { useState, useEffect } from 'react';
import api from '../services/api';
import { UserCircleIcon } from '@heroicons/react/24/outline';

const Entrenadores = () => {
    const [entrenadores, setEntrenadores] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchEntrenadores();
    }, []);

    const fetchEntrenadores = async () => {
        try {
            const response = await api.get('/entrenadores/');
            setEntrenadores(response.data.results || response.data);
        } catch (error) {
            console.error('Error fetching entrenadores:', error);
        } finally {
            setLoading(false);
        }
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
            <h1 className="text-3xl font-bold text-gray-800 mb-8">Entrenadores</h1>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {entrenadores.map((ent) => (
                    <div
                        key={ent.id}
                        className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition"
                    >
                        <div className="bg-gradient-to-r from-blue-500 to-purple-600 h-24"></div>
                        <div className="p-6 -mt-12">
                            {ent.foto ? (
                                <img
                                    src={`${import.meta.env.VITE_API_URL.replace('/api', '')}${ent.foto}`}
                                    alt={ent.first_name}
                                    className="w-24 h-24 rounded-full border-4 border-white object-cover mx-auto"
                                />
                            ) : (
                                <div className="w-24 h-24 rounded-full border-4 border-white bg-gray-300 flex items-center justify-center mx-auto">
                                    <UserCircleIcon className="w-16 h-16 text-gray-500" />
                                </div>
                            )}

                            <div className="text-center mt-4">
                                <h3 className="text-xl font-bold text-gray-800">
                                    {ent.first_name} {ent.last_name}
                                </h3>
                                <p className="text-blue-600 font-semibold mt-1">{ent.especialidad}</p>
                                <p className="text-gray-600 text-sm mt-2">{ent.email}</p>
                                <p className="text-gray-600 text-sm">📞 {ent.telefono}</p>

                                <div className="mt-4 pt-4 border-t border-gray-200">
                                    <div className="flex justify-between text-sm">
                                        <span className="text-gray-600">Rutinas creadas:</span>
                                        <span className="font-bold text-blue-600">{ent.rutinas_count || 0}</span>
                                    </div>
                                    <div className="flex justify-between text-sm mt-2">
                                        <span className="text-gray-600">Usuario:</span>
                                        <span className="font-semibold">@{ent.username}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {entrenadores.length === 0 && (
                <div className="text-center py-12">
                    <UserCircleIcon className="w-24 h-24 text-gray-300 mx-auto" />
                    <p className="text-gray-500 mt-4 text-lg">No hay entrenadores registrados</p>
                </div>
            )}
        </div>
    );
};

export default Entrenadores;