import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FiAlertTriangle, FiTrash2, FiBell, FiChevronLeft } from 'react-icons/fi';
import Navbar from '../components/Navbar';
import api from '../services/api'; 
import '../styles/IndividualAlert.css';

const IndividualAlert = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [alert, setAlert] = useState(null);

  useEffect(() => {
    async function getAlert() {
      try {
        const response = await api.get(`/alert/${id}`);
        setAlert(response.data);
      } catch (err) {
        console.error('Erro ao buscar alerta: ', err);
      }
    }
    getAlert();
  }, [id]);

  const date = alert ? new Date(alert.timestamp) : null;

  async function deleteAlert(id) {
    try{
      const response = await api.delete(`/alerts/${id}`);
      console.log(`Alerta ${id} deletado com sucesso: Status ${response.status}, ${response.statusText}`);
    } catch (err) {
      console.error(`Erro ao deletar alerta: ${err}`);
    }
  };

  async function notifyAlert(){
    try {
      await api.post('/send-alert', {
        id : alert._id
      });
      console.log('Alerta enviado por e-mail');
    } catch (err) {
      console.error(`Erro ao enviar alerta: ${err}`);
    }
  }

  return (
    <div className="page-wrapper">
      <Navbar />
      
      {alert ? <main className="alert-container">
        <header className="alert-top-bar">
          <button className="back-btn" onClick={() => navigate(-1)}>
            <FiChevronLeft size={32} />
          </button>
          <FiAlertTriangle size={32} className="warning-icon" />
          <h1>Alerta de Lotação</h1>
        </header>

        <div className="alert-grid">
          {/* Lado Esquerdo: Informações */}
          <div className="info-section">
            <div className="info-card">
              <p><strong>Data:</strong> {date.toLocaleDateString('pt-BR')}</p>
              <p><strong>Horário:</strong> {date.toLocaleTimeString('pt-BR', {hour: '2-digit', minute:'2-digit'})}</p>
              <p className="highlight"><strong>{alert.countHeads} pessoas detectadas</strong></p>
              <p>Lotação máxima permitida: 4 pessoas</p>
            </div>

            <div className="actions">
              <button className="btn-delete" onClick={() => {deleteAlert(id); navigate('/realtime')}}>
                <FiTrash2 /> Apagar alerta
              </button>
              <button className="btn-notify" onClick={notifyAlert}>
                <FiBell /> Notificar Alerta
              </button>
            </div>
          </div>

          {/* Lado Direito: Imagem */}
          <div className="image-section">
            <div className="camera-frame">
              <img 
                src={`data:image/jpeg;base64,${alert.image}`} 
                alt="Capture" 
              />
            </div>
          </div>
        </div>
      </main>
      : 
      <main className='alert-container'>
        <div className="loading">Carregando...</div>
      </main>
      }
    </div>
  );
};

export default IndividualAlert;