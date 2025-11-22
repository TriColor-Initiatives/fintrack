import { Link, useLocation } from 'react-router-dom';
import './Sidebar.css';

const Sidebar = () => {
  const location = useLocation();

  const menuItems = [
    { path: '/', label: 'Dashboard', icon: '📊' },
    { path: '/add-expense', label: 'Add Expense/Credit', icon: '➕' },
    { path: '/ledger', label: 'View Ledger', icon: '📒' },
    { path: '/create-invoice', label: 'Create Invoice', icon: '📄' },
    { path: '/invoice-history', label: 'Invoice History', icon: '📑' },
    { path: '/settings', label: 'Settings', icon: '⚙️' },
  ];

  return (
    <div className="sidebar">
      <div className="sidebar-header">
        <h2>💰 FinTrack Pro</h2>
      </div>
      <nav className="sidebar-nav">
        {menuItems.map((item) => (
          <Link
            key={item.path}
            to={item.path}
            className={`nav-item ${location.pathname === item.path ? 'active' : ''}`}
          >
            <span className="nav-icon">{item.icon}</span>
            <span className="nav-label">{item.label}</span>
          </Link>
        ))}
      </nav>
    </div>
  );
};

export default Sidebar;

