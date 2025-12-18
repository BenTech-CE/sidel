import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FiSettings, FiUser } from 'react-icons/fi';
import '../styles/Navbar.css';

import { useAuth } from '../context/AuthContext';
import Drawer from './Drawer';
import Settings from '../pages/Settings';

const Navbar = () => {
    const navigate = useNavigate();
    const [showLogoutCard, setShowLogoutCard] = useState(false);
    const profileRef = useRef(null);

    const [settingsOpen, setSettingsOpen] = useState(false);

    const toggleSettings = () => {
        setSettingsOpen(!settingsOpen);
    };

    const {logout} = useAuth();

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (
                profileRef.current &&
                !profileRef.current.contains(event.target)
            ) {
                setShowLogoutCard(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    return (
        <header className="navbar-container">
            <div className="navbar-left">
                <Link to="/realtime" className="navbar-logo-link">
                    <img
                        src="/images/SIDELb.svg"
                        alt="SIDEL Logo"
                        className="navbar-logo-img"
                    />
                </Link>
            </div>

            <div className="navbar-right" ref={profileRef}>
                <button
                    className="nav-icon-button"
                    onClick={toggleSettings}
                    title="Configurações"
                >
                    <FiSettings className="nav-icon" />
                </button>

                <button
                    className="nav-icon-button nav-profile-icon"
                    onClick={() => setShowLogoutCard((prev) => !prev)}
                    title="Perfil"
                >
                    <FiUser className="nav-icon" />
                </button>

                {showLogoutCard && (
                    <div className="profile-dropdown-card-logout">
                        <button
                            className="logout-button-card-only"
                            onClick={logout}
                        >
                            Sair
                        </button>
                    </div>
                )}
            </div>

            <Drawer isOpen={settingsOpen} close={toggleSettings}>
                <Settings />
            </Drawer>
        </header>
    );
};

export default Navbar;
