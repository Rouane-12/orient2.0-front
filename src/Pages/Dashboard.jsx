import { useState } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  LayoutDashboard, 
  BarChart3, 
  Award, 
  MessageSquare, 
  GraduationCap,
  LogOut,
  Menu,
  X,
  User
} from 'lucide-react';
import './Dashboard.scss';

const Dashboard = () => {
  const { user, logout } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const menuItems = [
    { path: '/dashboard', icon: LayoutDashboard, label: 'Vue d\'ensemble' },
    { path: '/dashboard/steps', icon: Award, label: 'Nouvelle orientation' },
    { path: '/dashboard/results', icon: Award, label: 'Mes résultats' },
    { path: '/dashboard/sectors', icon: GraduationCap, label: 'Secteurs & Filières' },
    { path: '/dashboard/reviews', icon: MessageSquare, label: 'Avis' },
    { path: '/dashboard/stats', icon: BarChart3, label: 'Statistiques' },
  ];

  return (
    <div className="dashboard">
      <button 
        className="dashboard__mobile-toggle"
        onClick={() => setSidebarOpen(!sidebarOpen)}
      >
        {sidebarOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      <aside className={`dashboard__sidebar ${sidebarOpen ? 'dashboard__sidebar--open' : ''}`}>
        <div className="dashboard__brand">
          <h2>Orient<span style={{ color: '#ffb37a' }}>+</span></h2>
          <span className="dashboard__brand-subtitle">Dashboard</span>
        </div>

        <nav className="dashboard__nav">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`dashboard__nav-item ${isActive ? 'dashboard__nav-item--active' : ''}`}
                onClick={() => setSidebarOpen(false)}
              >
                <Icon size={20} />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        <div className="dashboard__user">
          <div className="dashboard__user-info">
            <div className="dashboard__user-avatar">
              {user?.firstname?.[0]?.toUpperCase()}{user?.lastname?.[0]?.toUpperCase()}
            </div>
            <div>
              <p className="dashboard__user-name">{user?.firstname} {user?.lastname}</p>
              <p className="dashboard__user-email">{user?.email}</p>
            </div>
          </div>
          <button 
            className="dashboard__logout"
            onClick={handleLogout}
          >
            Déconnexion
          </button>
        </div>
      </aside>

      <main className="dashboard__content">
        <Outlet />
      </main>

      {sidebarOpen && (
        <div 
          className="dashboard__overlay"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </div>
  );
};

export default Dashboard;
