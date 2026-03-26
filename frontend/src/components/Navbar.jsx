import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export function Navbar() {
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = async () => {
        await logout();
        navigate('/login');
    };

    if (!user) return null;

    return (
        <nav className="navbar">
            <div className="container navbar-content">
                <Link to="/dashboard" className="navbar-brand">
                    💰 Ledger
                </Link>
                <div className="navbar-menu">
                    <Link to="/dashboard" className="navbar-link">
                        Dashboard
                    </Link>
                    <Link to="/accounts" className="navbar-link">
                        Accounts
                    </Link>
                    <Link to="/transactions" className="navbar-link">
                        Send Money
                    </Link>
                    <button onClick={handleLogout} className="btn btn-secondary" style={{ padding: '0.5rem 1rem' }}>
                        Logout
                    </button>
                </div>
            </div>
        </nav>
    );
}
