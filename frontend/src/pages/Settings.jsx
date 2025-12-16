import React, { useState /* useEffect */ } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiChevronLeft, FiSettings } from 'react-icons/fi';
import '../styles/Settings.css';

const Settings = () => {
  const navigate = useNavigate();

  // aimulação
  const [maxCapacity, setMaxCapacity] = useState(4);
  const [timeToAlert, setTimeToAlert] = useState(10);
  const [timeBetweenAlerts, setTimeBetweenAlerts] = useState(30);

  const handleBack = () => {
    navigate(-1);
  };

  const handleSave = () => {
    console.log('Config simuladas:', {
      maxCapacity,
      timeToAlert,
      timeBetweenAlerts
    });

    handleBack();
  };

  return (
    <div className="settings-overlay">
      <div className="settings-content">

        <div className="settings-header">
          <button className="back-button" onClick={handleBack}>
            <FiChevronLeft size={24} />
          </button>

          <div className="header-title">
            <FiSettings size={20} />
            <h2>Configurações</h2>
          </div>
        </div>

        <hr className="divider" />


<div className="settings-body">

    <div className="setting-group">
        <h3>Alterar Lotação Máxima Permitida</h3>
        
        <div className="input-black-box">
            <span>Lotação Máxima:</span>
            <input
                type="number"
                value={maxCapacity}
                onChange={(e) => setMaxCapacity(Number(e.target.value))}
            />
        </div>
    </div>

    <div className="setting-group">
        <h3>Tempo para gerar alerta a partir da 1ª detecção</h3>
        <p className="description">O alerta só será enviado após o tempo adicionado</p>
        
        <div className="input-black-box">
            <span>Tempo:</span>
            <input
                type="number"
                value={timeToAlert}
                onChange={(e) => setTimeToAlert(Number(e.target.value))}
            />
            <span>segundos</span>
        </div>
    </div>

    <div className="setting-group">
        <h3>Tempo de espera entre alertas</h3>
        <p className="description">Um novo alerta só será enviado após esse tempo</p>
        
        <div className="input-black-box">
            <span>Tempo:</span>
            <input
                type="number"
                value={timeBetweenAlerts}
                onChange={(e) => setTimeBetweenAlerts(Number(e.target.value))}
            />
            <span>segundos</span>
        </div>
    </div>

</div>

        <div className="settings-footer">
          <button className="save-button" onClick={handleSave}>
            Salvar
          </button>
        </div>

      </div>
    </div>
  );
};

export default Settings;
