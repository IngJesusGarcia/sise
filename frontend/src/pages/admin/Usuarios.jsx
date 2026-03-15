import React, { useState, useEffect } from 'react';
import { usuariosService } from '../../services/usuariosService';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { 
    Users, Shield, Key, Power, Activity, 
    Search, Loader2, RefreshCw, AlertCircle,
    UserCheck, UserX, Clock
} from 'lucide-react';
const toast = { success: (m) => alert(m), error: (m) => alert(m) };

const Usuarios = () => {
    const [actividad, setActividad] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            setLoading(true);
            const data = await usuariosService.getActivity();
            setActividad(data);
        } catch (error) {
            toast.error('Error al cargar actividad de usuarios');
        } finally {
            setLoading(false);
        }
    };

    const handleResetPassword = async (userId) => {
        if (!window.confirm('¿Estás seguro de resetear la contraseña de este usuario?')) return;
        try {
            const res = await usuariosService.resetPassword(userId);
            toast.success(`Contraseña reseteada. Nueva contraseña: ${res.new_password}`);
        } catch (error) {
            toast.error('Error al resetear contraseña');
        }
    };

    const handleToggleActive = async (userId) => {
        try {
            const res = await usuariosService.toggleActive(userId);
            toast.success(res.message);
            fetchData();
        } catch (error) {
            toast.error('Error al actualizar estatus');
        }
    };

    return (
        <div className="p-6 space-y-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                        <Shield className="w-8 h-8 text-unich-magenta" />
                        Administración de Usuarios
                    </h1>
                    <p className="text-gray-500">Gestión de cuentas, seguridad y monitoreo de actividad</p>
                </div>
                <button 
                    onClick={fetchData}
                    className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                >
                    <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card className="md:col-span-2">
                    <CardHeader>
                        <CardTitle className="text-lg flex items-center gap-2">
                            <Activity className="w-5 h-5 text-blue-500" />
                            Actividad Reciente y Sesiones
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm text-left">
                                <thead className="bg-gray-50 text-gray-600 uppercase text-[10px] font-bold tracking-wider">
                                    <tr>
                                        <th className="px-4 py-3">Usuario</th>
                                        <th className="px-4 py-3">Estatus</th>
                                        <th className="px-4 py-3">Última Actividad</th>
                                        <th className="px-4 py-3 text-right">Acciones</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {loading ? (
                                        <tr><td colSpan="4" className="text-center py-8"><Loader2 className="w-8 h-8 animate-spin mx-auto text-unich-magenta" /></td></tr>
                                    ) : actividad.length > 0 ? (
                                        actividad.map((as) => (
                                            <tr key={as.id} className="hover:bg-gray-50 transition-colors">
                                                <td className="px-4 py-3">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-8 h-8 rounded-full bg-unich-purple/10 flex items-center justify-center text-unich-purple font-bold">
                                                            {as.user?.name.charAt(0)}
                                                        </div>
                                                        <div>
                                                            <div className="font-medium text-gray-900">{as.user?.name}</div>
                                                            <div className="text-[10px] text-gray-500">{as.user?.email}</div>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-4 py-3">
                                                    {as.user?.activo ? (
                                                        <Badge variant="success" className="flex items-center gap-1 w-fit">
                                                            <UserCheck className="w-3 h-3" /> Activo
                                                        </Badge>
                                                    ) : (
                                                        <Badge variant="danger" className="flex items-center gap-1 w-fit">
                                                            <UserX className="w-3 h-3" /> Inactivo
                                                        </Badge>
                                                    )}
                                                </td>
                                                <td className="px-4 py-3">
                                                    <div className="flex items-center gap-1 text-gray-500">
                                                        <Clock className="w-3 h-3" />
                                                        {new Date(as.ultima_actividad).toLocaleString()}
                                                    </div>
                                                </td>
                                                <td className="px-4 py-3 text-right">
                                                    <div className="flex justify-end gap-2">
                                                        <button 
                                                            onClick={() => handleResetPassword(as.user_id)}
                                                            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                                            title="Resetear Contraseña"
                                                        >
                                                            <Key className="w-4 h-4" />
                                                        </button>
                                                        <button 
                                                            onClick={() => handleToggleActive(as.user_id)}
                                                            className={`p-2 rounded-lg transition-colors ${as.user?.activo ? 'text-red-600 hover:bg-red-50' : 'text-green-600 hover:bg-green-50'}`}
                                                            title={as.user?.activo ? 'Desactivar Usuario' : 'Activar Usuario'}
                                                        >
                                                            <Power className="w-4 h-4" />
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr><td colSpan="4" className="text-center py-12 text-gray-400 italic">No hay actividad registrada</td></tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </CardContent>
                </Card>

                <div className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-lg">Información de Roles</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {[
                                { name: 'Admin', color: 'red' },
                                { name: 'Escolares', color: 'blue' },
                                { name: 'Docente', color: 'green' },
                                { name: 'Estudiante', color: 'purple' }
                            ].map(r => (
                                <div key={r.name} className="flex justify-between items-center text-sm">
                                    <span className="text-gray-600 font-medium">{r.name}</span>
                                    <Badge variant="outline">{r.name.toUpperCase()}</Badge>
                                </div>
                            ))}
                        </CardContent>
                    </Card>

                    <Card className="bg-unich-magenta/5 border-unich-magenta/20">
                        <CardContent className="p-4 flex gap-3">
                            <AlertCircle className="w-5 h-5 text-unich-magenta shrink-0" />
                            <div className="text-xs text-gray-600">
                                <p className="font-bold text-unich-magenta mb-1">Nota de Seguridad</p>
                                El reseteo de contraseña forzará al usuario a cambiarla en su siguiente inicio de sesión.
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
};

export default Usuarios;
