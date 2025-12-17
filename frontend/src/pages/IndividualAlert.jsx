import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import Navbar from '../components/Navbar';
import '../styles/IndividualAlert.css';
import api from '../services/api';

const IndividualAlert = () => {
  const { id } = useParams();
  const [alert, setAlert] = useState();

  useEffect(()=> {
    async function getAlert() {
      try {
        const response = await api.get(`/alert/${id}`);
        setAlert(response.data);
        console.log(response.data)
      } catch (err) {
        console.error('Erro no getAlert(): ', err);
      }
      
    }
    getAlert();
  }, [id])

  if (!alert) {
    return (
      <div className="loading-screen">
        <div className="spinner"></div>
        <p>Sincronizando com servidor SIDEL...</p>
      </div>
    );
  }

  const dataEvento = new Date(alert.timestamp).toLocaleString('pt-BR');

  return (
    <>
      <Navbar />
      <div className='individual-alert-container'>
        <div className='alert-card'>
          <header className='alert-header'>
            <div className="header-left">
              <span className="badge">DETECÇÃO EM TEMPO REAL</span>
              <h1>Relatório de Incidente</h1>
            </div>
            <div className='alert-id-tag'>ALERT_ID: {alert._id}</div>
          </header>

          <div className='alert-content'>
            {/* Dados Técnicos */}
            <div className='alert-info-panel'>
              <div className='data-row'>
                <label>Status</label>
                <p className={alert.detected ? 'status-critical' : 'status-ok'}>
                  {alert.detected ? '● ALTA DENSIDADE DETECTADA' : '● NORMAL'}
                </p>
              </div>

              <div className='data-row'>
                <label>Data e Horário</label>
                <p>{dataEvento}</p>
              </div>

              <div className='data-row'>
                <label>Contagem de Cabeças</label>
                <div className='big-number'>
                  {alert.countHeads}
                  <span>pessoas</span>
                </div>
              </div>

              <div className='data-row'>
                <label>Metadados (Objetos)</label>
                <div className="object-tags">
                  {alert.objects?.map((obj, i) => (
                    <span key={i} className="obj-tag">{obj}</span>
                  ))}
                </div>
              </div>
            </div>

            {/* Visualização da Câmera */}
            <div className='alert-image-panel'>
              <label>Captura do Sensor (Frame)</label>
              <div className="monitor-frame">
                {/* Prefixo necessário para ler a string Base64 do MongoDB */}
                <img 
                  src={`data:image/jpeg;base64,${alert.image}`} 
                  alt="Snapshot SIDEL" 
                />
                <div className="scanline"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default IndividualAlert;