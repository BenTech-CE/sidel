import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/Login.css';
import { FiEye, FiEyeOff } from 'react-icons/fi';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');

  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    //SIMULAÇAO sem a APII
    await new Promise(resolve => setTimeout(resolve, 200));

    if (email === 'teste@sidel.com' && password === '123456') {
        
        
        console.log('Login Simulado ok');
        localStorage.setItem('userToken', 'mock-token-sidel-123'); 
        
        navigate('/RealTime'); 
        
    } else if (email === 'api-erro@sidel.com') {
        
        setError('Não foi possível conectar ao servidor. Verifique sua conexão.');

    } else {
        setError('E-mail ou senha inválidos. Tente novamente.');
    }
    
    return; 
    
   // FIM DA SIMULAÇAO de login

    
   // APII
 
   const loginData = {
      email,
      password,
    };

    try {
     const response = await fetch('http://localhost:3000/api', { 
         method: 'POST',
         headers: {
         'Content-Type': 'application/json',
          },
        body: JSON.stringify(loginData),
       });

    if (response.ok) {
       
        const data = await response.json();
        localStorage.setItem('userToken', data.token); 
        navigate('/RealTime'); 

     } else {
        const errorData = await response.json();
        setError(errorData.message || 'E-mail ou senha inválidos. Tente novamente');
    }
} catch (apiError) {
      console.error('Erro de conexão com a API:', apiError);
       setError('ERRO NA CONEXÃO COM O SERVIDOR');
    }
}; 
// apii

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