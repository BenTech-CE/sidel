import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar'; 
import '../styles/RealTime.css'; 
import { FiAlertTriangle, FiChevronRight } from 'react-icons/fi'; 


//PRIORIDADE DOS ALERTAS
const getAlertLevel = (alertTimestamp) => {
    const now = new Date();
    const diffHours = (now - new Date(alertTimestamp)) / (1000 * 60 * 60);
    if (diffHours < 1) return 'ALTO';
    if (diffHours < 24) return 'MEDIO';
    return 'BAIXO';
};

const getDayLabel = (alertTimestamp) => {
    const today = new Date(new Date().setHours(0, 0, 0, 0));
    const alertDate = new Date(new Date(alertTimestamp).setHours(0, 0, 0, 0));
    const diffDays = Math.round((today - alertDate) / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return 'Hoje';
    if (diffDays === 1) return 'Ontem';
    return alertDate.toLocaleDateString('pt-BR');
};


const RealTime = () => {
    const navigate = useNavigate();
    const [alerts, setAlerts] = useState([]);
    const [loading, setLoading] = useState(true);
    
    // ESTADO OBJ
    const [detectionSummary, setDetectionSummary] = useState({});

    // VIDEO
    const [videoFeed, setVideoFeed] = useState('/images/backgroundlogin.png');

const AlertItem = useCallback(({ alert }) => (
    <div 
        className={`alert-item ${getAlertLevel(alert.timestamp)}`}
        onClick={() => navigate(`/individualalert/${alert.id}`)}
        style={{ cursor: 'pointer' }}
    >
        <FiAlertTriangle className="alert-icon" /> 
        <span className="alert-status">
            {alert.status} às {new Date(alert.timestamp).toLocaleTimeString('pt-BR', {
                hour: '2-digit',
                minute: '2-digit'
            })}
        </span>
        <FiChevronRight className="alert-arrow" />
    </div>
), [navigate]);

    useEffect(() => {
        setLoading(true);
        
        // SIMULACAO
        const mock = [
            { id: 1, timestamp: new Date(Date.now() - 5 * 60 * 1000).toISOString(), status: 'Lotação detectada' },     
            { id: 2, timestamp: new Date(Date.now() - 45 * 60 * 1000).toISOString(), status: 'Lotação detectada' },    
            { id: 3, timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), status: 'Lotação detectada' },
            { id: 4, timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(), status: 'Lotação detectada' },
            { id: 5, timestamp: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(), status: 'Lotação detectada' },
            { id: 6, timestamp: new Date(Date.now() - 18 * 60 * 60 * 1000).toISOString(), status: 'Lotação detectada' },
            { id: 7, timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(), status: 'Lotação detectada' },
            { id: 8, timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(), status: 'Lotação detectada' },
            { id: 9, timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(), status: 'Lotação detectada' },
        ];
        
        setTimeout(() => {
            mock.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
            setAlerts(mock);
            setLoading(false);
        }, 500); 
        // FIM SIMU
        
        
    }, []);
    
 
    const groupedAlerts = alerts.reduce((acc, alert) => {
        const key = getDayLabel(alert.timestamp);
        if (!acc[key]) acc[key] = [];
        acc[key].push(alert);
        return acc;
    }, {});
    
    const orderedKeys = Object.keys(groupedAlerts).sort((a, b) => {
        const order = { 'Hoje': 3, 'Ontem': 2 };
        const valA = order[a] || 1;
        const valB = order[b] || 1;
        if (valA !== valB) return valB - valA;
        return 0; 
    });

    const getSummaryString = () => {
        return Object.entries(detectionSummary)  
    };


    return (
       <div> 
          <Navbar />
        <div className="realtime-page">
            
            <div className="realtime-content-container">
                <div className="main-content">
                    <div className="video-monitor-card">
                        <div className="video-header">
                            <span className="camera-info">
                                <h2 className="content-title">Em Tempo Real</h2>
                               CAMERA ELEVADOR BC {getSummaryString()} 
                            </span>
                            <span className="live-indicator">LIVE</span>
                        </div>
                        <img 
                            // live
                            src={videoFeed} 
                            alt="Monitoramento em Tempo Real"
                            className="video-feed-placeholder"
                        />
                        <div className="video-controls"></div>
                    </div>
                </div>

                <aside className="alerts-sidebar">
                    <div className="alerts-card">
                        <h3>Histórico de Alertas</h3>
                        <hr className="header-divider" />
                        
                        {loading && <p style={{ textAlign: 'center', color: '#555' }}>Carregando alertas iniciais...</p>}
                        
                        {!loading && alerts.length > 0 && (
                            <div className="alert-list-scroll"> 
                                {orderedKeys.map((dayLabel, index) => (
                                    <React.Fragment key={dayLabel}>
                                        <p className="alert-group-date">{dayLabel}</p>
                                        <div className="alert-group">
                                            {groupedAlerts[dayLabel].map(alert => (
                                                <AlertItem key={alert.id} alert={alert} />
                                            ))}
                                        </div>
                                    </React.Fragment>
                                ))}
                            </div>
                        )}
                        
                        {!loading && alerts.length === 0 && (
                            <p style={{ textAlign: 'center', color: '#555' }}>Nenhum alerta encontrado.</p>
                        )}
                    
                    </div>
                </aside>
                
            </div>
        </div>
        </div> 
    );
};

export default RealTime;