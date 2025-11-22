import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getEntries, getInvoices } from '../utils/storage';

const Dashboard = () => {
  const [stats, setStats] = useState({
    totalExpenses: 0,
    totalCredits: 0,
    netBalance: 0,
    totalInvoices: 0,
    totalInvoiced: 0,
    recentEntries: [],
    recentInvoices: [],
  });

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = () => {
    const entries = getEntries();
    const invoices = getInvoices();

    const totalExpenses = entries
      .filter(e => e.type === 'expense')
      .reduce((sum, e) => sum + parseFloat(e.amount), 0);

    const totalCredits = entries
      .filter(e => e.type === 'credit')
      .reduce((sum, e) => sum + parseFloat(e.amount), 0);

    const netBalance = totalCredits - totalExpenses;

    const totalInvoiced = invoices.reduce((sum, inv) => {
      // Support both old (amount) and new (total) invoice formats
      const invoiceTotal = inv.total || inv.amount || 0;
      return sum + parseFloat(invoiceTotal);
    }, 0);

    // Get recent entries (last 5)
    const recentEntries = [...entries]
      .sort((a, b) => new Date(b.date) - new Date(a.date))
      .slice(0, 5);

    // Get recent invoices (last 5)
    const recentInvoices = [...invoices]
      .sort((a, b) => new Date(b.date) - new Date(a.date))
      .slice(0, 5);

    setStats({
      totalExpenses,
      totalCredits,
      netBalance,
      totalInvoices: invoices.length,
      totalInvoiced,
      recentEntries,
      recentInvoices,
    });
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <h1>Dashboard</h1>
        <p>Welcome to FinTrack Pro - Your financial management hub</p>
      </div>

      <div className="stats-grid">
        <div className="stat-card success">
          <div className="stat-label">Total Credits</div>
          <div className="stat-value" style={{ color: '#27ae60' }}>
            ${stats.totalCredits.toFixed(2)}
          </div>
        </div>
        <div className="stat-card danger">
          <div className="stat-label">Total Expenses</div>
          <div className="stat-value" style={{ color: '#e74c3c' }}>
            ${stats.totalExpenses.toFixed(2)}
          </div>
        </div>
        <div className="stat-card warning">
          <div className="stat-label">Net Balance</div>
          <div className="stat-value" style={{ color: stats.netBalance >= 0 ? '#27ae60' : '#e74c3c' }}>
            ${stats.netBalance.toFixed(2)}
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Total Invoiced</div>
          <div className="stat-value" style={{ color: '#3498db' }}>
            ${stats.totalInvoiced.toFixed(2)}
          </div>
          <p style={{ fontSize: '0.85rem', color: '#7f8c8d', marginTop: '8px' }}>
            {stats.totalInvoices} invoice{stats.totalInvoices !== 1 ? 's' : ''}
          </p>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px', marginBottom: '30px' }}>
        <Link to="/add-expense" style={{ textDecoration: 'none' }}>
          <div className="card" style={{ cursor: 'pointer', transition: 'transform 0.3s ease', height: '100%' }}
            onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-5px)'}
            onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
          >
            <div style={{ fontSize: '2.5rem', marginBottom: '15px' }}>➕</div>
            <h3 style={{ color: '#2c3e50', marginBottom: '10px' }}>Add Entry</h3>
            <p style={{ color: '#7f8c8d' }}>Record a new expense or credit</p>
          </div>
        </Link>

        <Link to="/ledger" style={{ textDecoration: 'none' }}>
          <div className="card" style={{ cursor: 'pointer', transition: 'transform 0.3s ease', height: '100%' }}
            onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-5px)'}
            onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
          >
            <div style={{ fontSize: '2.5rem', marginBottom: '15px' }}>📒</div>
            <h3 style={{ color: '#2c3e50', marginBottom: '10px' }}>View Ledger</h3>
            <p style={{ color: '#7f8c8d' }}>See all transactions and export</p>
          </div>
        </Link>

        <Link to="/create-invoice" style={{ textDecoration: 'none' }}>
          <div className="card" style={{ cursor: 'pointer', transition: 'transform 0.3s ease', height: '100%' }}
            onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-5px)'}
            onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
          >
            <div style={{ fontSize: '2.5rem', marginBottom: '15px' }}>📄</div>
            <h3 style={{ color: '#2c3e50', marginBottom: '10px' }}>Create Invoice</h3>
            <p style={{ color: '#7f8c8d' }}>Generate a new invoice</p>
          </div>
        </Link>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(450px, 1fr))', gap: '20px' }}>
        <div className="card">
          <h2 style={{ marginBottom: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span>Recent Transactions</span>
            <Link to="/add-expense" style={{ fontSize: '0.9rem', color: '#3498db', textDecoration: 'none' }}>
              View All →
            </Link>
          </h2>
          {stats.recentEntries.length === 0 ? (
            <div className="empty-state" style={{ padding: '40px 20px' }}>
              <div className="empty-state-icon" style={{ fontSize: '3rem' }}>📝</div>
              <div className="empty-state-text" style={{ fontSize: '1rem' }}>No transactions yet</div>
            </div>
          ) : (
            <div>
              {stats.recentEntries.map((entry) => (
                <div key={entry.id} style={{ 
                  padding: '15px',
                  borderBottom: '1px solid #ecf0f1',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}>
                  <div>
                    <div style={{ fontWeight: '600', color: '#2c3e50', marginBottom: '5px' }}>
                      {entry.description}
                    </div>
                    <div style={{ fontSize: '0.85rem', color: '#7f8c8d' }}>
                      {entry.date} • {entry.category || 'Uncategorized'}
                    </div>
                  </div>
                  <div style={{ 
                    fontWeight: '700',
                    fontSize: '1.1rem',
                    color: entry.type === 'credit' ? '#27ae60' : '#e74c3c'
                  }}>
                    {entry.type === 'credit' ? '+' : '-'}${parseFloat(entry.amount).toFixed(2)}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="card">
          <h2 style={{ marginBottom: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span>Recent Invoices</span>
            <Link to="/invoice-history" style={{ fontSize: '0.9rem', color: '#3498db', textDecoration: 'none' }}>
              View All →
            </Link>
          </h2>
          {stats.recentInvoices.length === 0 ? (
            <div className="empty-state" style={{ padding: '40px 20px' }}>
              <div className="empty-state-icon" style={{ fontSize: '3rem' }}>📄</div>
              <div className="empty-state-text" style={{ fontSize: '1rem' }}>No invoices yet</div>
            </div>
          ) : (
            <div>
              {stats.recentInvoices.map((invoice) => (
                <div key={invoice.id} style={{ 
                  padding: '15px',
                  borderBottom: '1px solid #ecf0f1',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}>
                  <div>
                    <div style={{ fontWeight: '600', color: '#2c3e50', marginBottom: '5px' }}>
                      {invoice.invoiceNumber}
                    </div>
                    <div style={{ fontSize: '0.85rem', color: '#7f8c8d' }}>
                      {invoice.date} • {invoice.client}
                    </div>
                  </div>
                  <div style={{ 
                    fontWeight: '700',
                    fontSize: '1.1rem',
                    color: '#27ae60'
                  }}>
                    {invoice.currencySymbol || '$'}{parseFloat(invoice.total || invoice.amount || 0).toFixed(2)}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;

