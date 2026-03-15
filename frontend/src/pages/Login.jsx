import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { Lock, Mail } from 'lucide-react';
import Button from '../components/ui/Button';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await api.post('/auth/login', { email, password });
      const { token, user } = response.data;
      
      const rol = user.roles && user.roles.length > 0 ? user.roles[0] : 'admin';

      localStorage.setItem('token', token);
      localStorage.setItem('rol', rol);
      localStorage.setItem('user', JSON.stringify(user));

      navigate('/dashboard');
    } catch (err) {
      if (err.response && err.response.data) {
        setError(err.response.data.message || 'Credenciales incorrectas');
      } else {
        setError('Error de conexión con el servidor.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-unich-light relative overflow-hidden">
      {/* Decorative Elements */}
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-unich-purple via-unich-magenta to-unich-purple"></div>
      <div className="absolute top-[-20%] right-[-10%] w-[500px] h-[500px] bg-unich-magenta/5 rounded-full blur-3xl"></div>
      <div className="absolute bottom-[-20%] left-[-10%] w-[500px] h-[500px] bg-unich-purple/5 rounded-full blur-3xl"></div>

      <div className="w-full max-w-md px-6 relative z-10 flex flex-col items-center">
        
        {/* Header Branding */}
        <div className="flex flex-col items-center mb-8 text-center animate-fade-in">
          <img 
             src="/img/logo-UNICH.png" 
             alt="Universidad Intercultural de Chiapas" 
             className="w-48 object-contain mb-6 drop-shadow-sm"
             onError={(e) => {
               e.target.onerror = null;
               e.target.src = 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200"><rect width="200" height="200" fill="%232E2C7F"/><text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" fill="white" font-size="30" font-weight="bold" font-family="sans-serif">UNICH</text></svg>';
             }}
          />
          <h1 className="text-2xl font-bold text-unich-purple tracking-tight">
            Sistema Integral de Servicios Escolares
          </h1>
          <div className="w-12 h-1 bg-unich-magenta rounded-full mt-4 mb-4"></div>
          <p className="text-sm text-gray-500 leading-relaxed max-w-sm">
            Plataforma oficial para la gestión académica, financiera y administrativa de la Universidad Intercultural de Chiapas.
          </p>
        </div>

        {/* Login Card */}
        <div className="w-full bg-white rounded-2xl shadow-xl shadow-unich-purple/5 border border-gray-100 p-8 animate-fade-in" style={{ animationDelay: '100ms' }}>
          
          {error && (
            <div className="bg-red-50 border-l-4 border-red-500 text-red-700 p-4 mb-6 rounded text-sm flex items-center gap-3">
              <span className="bg-red-100 p-1 rounded-full"><Lock size={14} className="text-red-600"/></span>
              <p>{error}</p>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-6">
            <div className="space-y-2">
              <label className="text-sm font-bold text-gray-700" htmlFor="email">
                Correo Electrónico
              </label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400 group-focus-within:text-unich-purple transition-colors">
                  <Mail size={18} />
                </div>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-11 pr-4 py-3 rounded-xl border border-gray-200 bg-gray-50 text-gray-900 focus:bg-white focus:outline-none focus:border-unich-purple focus:ring-4 focus:ring-unich-purple/10 transition-all font-medium"
                  placeholder="usuario@unich.edu.mx"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-bold text-gray-700" htmlFor="password">
                Contraseña
              </label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400 group-focus-within:text-unich-purple transition-colors">
                  <Lock size={18} />
                </div>
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-11 pr-4 py-3 rounded-xl border border-gray-200 bg-gray-50 text-gray-900 focus:bg-white focus:outline-none focus:border-unich-purple focus:ring-4 focus:ring-unich-purple/10 transition-all font-medium"
                  placeholder="••••••••"
                  required
                />
              </div>
            </div>

            <div className="pt-2">
              <Button 
                type="submit" 
                variant="primary" 
                className="w-full py-3.5 text-base font-bold tracking-wide" 
                isLoading={loading}
              >
                Acceder al Sistema
              </Button>
            </div>
          </form>
        </div>

        {/* Footer */}
        <p className="text-center text-xs text-gray-400 mt-12 font-medium">
          © {new Date().getFullYear()} Universidad Intercultural de Chiapas.<br/> Todos los derechos reservados.
        </p>
      </div>
    </div>
  );
};

export default Login;
