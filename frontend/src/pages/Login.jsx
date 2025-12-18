import React, { use, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/Login.css';
import { FiEye, FiEyeOff } from 'react-icons/fi';
import { useAuth } from '../context/AuthContext';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  const navigate = useNavigate();

  const {login} = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoggingIn(true);

    try{
      await login(email, password);
      navigate('/RealTime');
    } catch (err) {
      console.error("Erro no login: ", err);
      if (err.response) {
        setError(err.response.data.error || 'E-mail ou senha inválidos.');
      } else if (err.request) {
        setError('Não foi possível conectar ao servidor.');
      } else {
        setError('Ocorreu um erro inesperado. Tente novamente.');
      }
    } finally {
      setIsLoggingIn(false);
    }
  };
return (
  <div className="login-container">
  <div className="login-card">
  <div className="login-logo">
      <img 
          src="/images/SIDEL.svg"
          alt="Logo SIDEL"
          className="logo-image"
            />
  </div>

          <form className="login-form" onSubmit={handleSubmit}>
      {error && <p className="error-message">{error}</p>}
            <div className="input-group">
              <label htmlFor="email">E-mail</label>
              <input
                type="email"
                id="email"
                placeholder="Digite seu e-mail..."
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
            />
          </div>

            <div className="input-group">
              <label htmlFor="password">Senha</label>
            <div className="password-input-wrapper">
              <input
                  type={showPassword ? 'text' : 'password'}
                  id="password"
                  placeholder="Digite sua senha..."
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
              />
                <span 
                  className="toggle-password" 
                    onClick={() => setShowPassword(!showPassword)}
                    title={showPassword ? 'Ocultar senha' : 'Mostrar senha'}
              >
              {showPassword ? <FiEyeOff /> : <FiEye />} 
                </span>
              </div>
          </div>

              <button type="submit" className="login-button">
                Entrar 
              <span className="arrow-icon">➔</span> 
                  </button>
                </form>
              </div>
        </div>
  );
};
export default Login;