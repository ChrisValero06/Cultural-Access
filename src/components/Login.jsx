import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { apiService } from '../apis';

const Login = () => {
  const [usuario, setUsuario] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const navigate = useNavigate();
  const location = useLocation();

  // Limpiar sesión cuando se carga el login (por si llegaron aquí desde atrás o saliendo)
  useEffect(() => {
    const limpiarSesion = () => {
      localStorage.removeItem('authToken');
      localStorage.removeItem('userEmail');
      localStorage.removeItem('userUsuario');
      localStorage.removeItem('perfilId');
      localStorage.removeItem('perfilNombre');
    }

    // Limpiar sesión al cargar la página de login
    limpiarSesion();

    // También limpiar cuando detectan navegación hacia atrás
    const handlePopState = () => {
      if (window.location.pathname === '/login') {
        limpiarSesion();
      }
    }

    window.addEventListener('popstate', handlePopState);

    return () => {
      window.removeEventListener('popstate', handlePopState);
    };
  }, []);

  // Credenciales fijas con perfiles
  const FIXED_CREDENTIALS = [
    { usuario: 'franciscomurga', password: 'francisco2025', perfilId: 'francisco_murga', nombre: 'Francisco Murga' },
    { usuario: 'alejandrolachea', password: 'alejandro2025', perfilId: 'alejandro_olachea', nombre: 'Alejandro Olachea' },
    { usuario: 'raymundoibarra', password: 'raymundo2025', perfilId: 'raymundo_ibarra', nombre: 'Raymundo Ibarra' },
    { usuario: 'karlaacevedo', password: 'karla2025', perfilId: 'karla_acevedo', nombre: 'Karla Acevedo' },
    { usuario: 'pepe', password: 'CNL2025*.', perfilId: 'pepe', nombre: 'Pepe' },
    { usuario: 'labnl', password: 'labnl2025', perfilId: 'labnl', nombre: 'LABNL' },
  ];

  const handleSubmit = async (e) => { 
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (!usuario || !password) {
        setError('Usuario y contraseña requeridos');
        setLoading(false);
        return;
      }

      // Validar contra credenciales fijas
      const match = FIXED_CREDENTIALS.find(c => c.usuario === usuario && c.password === password);
      if (!match) {
        throw new Error('Credenciales inválidas');
      }

      localStorage.setItem('authToken', `${usuario}-token`);
      localStorage.setItem('userUsuario', usuario);
      localStorage.setItem('perfilId', match.perfilId);
      localStorage.setItem('perfilNombre', match.nombre);
      
      // Solo Pepe accede al AdminDashboard, los demás van al Registro
      if (match.perfilId === 'pepe') {
        navigate('/AdminDashboard');
      } else {
        navigate('/Registro');
      }
    } catch (err) {
      setError(err.message === 'Failed to fetch' ? 'No se pudo contactar el servidor' : (err.message || 'Error de autenticación'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded-lg shadow-md w-96">
        <h2 className="text-2xl font-bold text-center mb-6 text-gray-800">
          Iniciar Sesión
        </h2>
        
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <input
              type="text"
              placeholder="Usuario"
              value={usuario}
              onChange={(e) => setUsuario(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 text-black"
              required
            />
          </div>
          
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Contraseña"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full p-3 pr-10 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 text-black"
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 p-1 bg-transparent  outline-transparent"
            >
              {showPassword ? (
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21" />
                </svg>
              ) : (
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
              )}
            </button>
          </div>

          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded text-sm">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-orange-600 text-white p-3 rounded-md hover:bg-orange-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Iniciando...' : 'Acceder'}
          </button>
        </form>

        <div className="text-center mt-4">
          <button
            onClick={() => navigate('/')}
            className="text-orange-600 hover:text-orange-500 text-sm"
          >
            ← Volver al inicio
          </button>
        </div>
      </div>
    </div>
  );
};

export default Login;
