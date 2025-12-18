import React, { useEffect } from 'react';
import ReactDOM from 'react-dom';
import '../styles/Drawer.css';
import { createContext } from 'react';
import { useContext } from 'react';

const DrawerContext = createContext();

// 2. Hook para facilitar o uso
export const useDrawer = () => useContext(DrawerContext);

const Drawer = ({ isOpen, close, children }) => {
  
  // Efeito para bloquear o scroll do body quando aberto
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    // Limpeza ao desmontar
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  // Se o documento não existir (ex: SSR), não renderiza nada
  if (typeof document === 'undefined') return null;

  // O JSX que será "teletransportado" para o final do <body>
  const drawerContent = (
    <>
      {/* O Overlay clica-para-fechar */}
      <div 
        className={`drawer-overlay ${isOpen ? 'open' : ''}`} 
        onClick={close}
        aria-hidden="true"
      />

      {/* O Painel */}
      <div className={`drawer-panel ${isOpen ? 'open' : ''}`}>
        <div className="drawer-content">
            <DrawerContext.Provider value={{ close }}>
                {children}   
            </DrawerContext.Provider>
        </div>
      </div>
    </>
  );

  // A Mágica do Portal: Renderiza o 'drawerContent' dentro do document.body
  return ReactDOM.createPortal(drawerContent, document.body);
};

export default Drawer;