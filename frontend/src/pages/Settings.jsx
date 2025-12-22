import React, { useEffect, useState /* useEffect */ } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiChevronLeft, FiSettings } from 'react-icons/fi';
import '../styles/Settings.css';
import { useDrawer } from '../components/Drawer';
import api from '../services/api';

const Settings = () => {
  const { close } = useDrawer();

  const [maxCapacity, setMaxCapacity] = useState();
  const [timeToAlert, setTimeToAlert] = useState();
  const [timeBetweenAlerts, setTimeBetweenAlerts] = useState();
  const [emailRecipient, setEmailRecipient] = useState("");

  useEffect(() => {
    api.get("/settings").then((response) => {
      const settings = response.data
      setMaxCapacity(settings?.headLimit)
      setTimeToAlert(settings?.durationSeconds)
      setTimeBetweenAlerts(settings?.cooldownSeconds)
      setEmailRecipient(settings?.emailRecipient)
    }).catch((e) => {
      console.log(`Ocorreu um erro ao tentar resgatar as setting: ${e}`)
    })
  }, [])

  const handleSave = async () => {
    const settings = {
      headLimit: maxCapacity,
      durationSeconds: timeToAlert,
      cooldownSeconds: timeBetweenAlerts,
      emailRecipient
    }
    await api.post("/settings", settings).then(() => {
      console.log('Configs atualizadas com sucesso:');
      close();
    }).catch(e => {
      alert(`Ocorreu um erro na aplicação: ${e}`)
      console.log(`Ocorreu um erro na aplicação: ${e}`)
    })
  };

  return (
    <div className="settings-overlay">
      <div className="settings-content">

        <div className="settings-header">
          <button className="back-button" onClick={close}>
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
            <h3>Alterar E-mail do Destinatário</h3>
            <p className="description">Este é o e-mail para o qual a notificação de alerta será enviada.</p>

            <div className="input-black-box">
              <span>E-mail:</span>
              <input
                type="email"
                value={emailRecipient}
                onChange={(e) => setEmailRecipient(e.target.value)}
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
