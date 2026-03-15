import api from '../api/axios';

export const usuariosService = {
    // Gestión de Usuarios
    resetPassword: async (userId) => {
        const response = await api.post(`/admin/users/${userId}/reset-password`);
        return response.data;
    },
    toggleActive: async (userId) => {
        const response = await api.patch(`/admin/users/${userId}/toggle-active`);
        return response.data;
    },
    getActivity: async () => {
        const response = await api.get('/admin/users/activity');
        return response.data;
    },
};
