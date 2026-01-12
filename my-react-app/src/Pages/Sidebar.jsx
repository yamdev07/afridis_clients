import React from "react";
import { useNavigate, useLocation } from "react-router-dom";

function Sidebar() {
    const navigate = useNavigate();
    const location = useLocation();

    const isActive = (path) => location.pathname === path;

    return (
        <aside className="bg-dark text-white p-3" style={{ height: '100vh', width: '220px', position: 'sticky', top: 0 }}>
            <h2 className="text-center mb-4">CRM</h2>
            <ul className="list-unstyled">
                <li 
                    className={`p-3 mb-2 rounded ${isActive('/dashboard') ? 'bg-secondary' : 'hover-bg-secondary'}`}
                    style={{ cursor: 'pointer', transition: 'background-color 0.2s' }}
                    onClick={() => navigate('/dashboard')}
                >
                    Dashboard
                </li>
                <li 
                    className={`p-3 mb-2 rounded ${isActive('/clients') ? 'bg-secondary' : 'hover-bg-secondary'}`}
                    style={{ cursor: 'pointer', transition: 'background-color 0.2s' }}
                    onClick={() => navigate('/clients')}
                >
                    Clients
                </li>
                <li 
                    className={`p-3 mb-2 rounded ${isActive('/services') ? 'bg-secondary' : 'hover-bg-secondary'}`}
                    style={{ cursor: 'pointer', transition: 'background-color 0.2s' }}
                    onClick={() => navigate('/services')}
                >
                    Services
                </li>
                <li 
                    className={`p-3 mb-2 rounded ${isActive('/reports') ? 'bg-secondary' : 'hover-bg-secondary'}`}
                    style={{ cursor: 'pointer', transition: 'background-color 0.2s' }}
                    onClick={() => navigate('/reports')}
                >
                    Rapports
                </li>
            </ul>
        </aside>
    );
}

export default Sidebar;