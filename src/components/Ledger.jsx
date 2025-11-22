import { useState, useEffect } from 'react';
import { getEntries } from '../utils/storage';
import { exportLedgerToCSV } from '../utils/csvExport';

const Ledger = () => {
  const [entries, setEntries] = useState([]);
  const [filteredEntries, setFilteredEntries] = useState([]);
  const [dateFilter, setDateFilter] = useState({
    startDate: '',
    endDate: '',
  });

  useEffect(() => {
    loadEntries();
  }, []);

  useEffect(() => {
    applyDateFilter();
  }, [entries, dateFilter]);

  const loadEntries = () => {
    const loadedEntries = getEntries();
    setEntries(loadedEntries);
  };

  const applyDateFilter = () => {
    let filtered = [...entries];

    if (dateFilter.startDate) {
      filtered = filtered.filter(entry => entry.date >= dateFilter.startDate);
    }

    if (dateFilter.endDate) {
      filtered = filtered.filter(entry => entry.date <= dateFilter.endDate);
    }

    // Sort by date ascending for ledger view
    filtered.sort((a, b) => new Date(a.date) - new Date(b.date));
    setFilteredEntries(filtered);
  };

  const calculateTotals = () => {
    const totalExpenses = filteredEntries
      .filter(e => e.type === 'expense')
      .reduce((sum, e) => sum + parseFloat(e.amount), 0);

    const totalCredits = filteredEntries
      .filter(e => e.type === 'credit')
      .reduce((sum, e) => sum + parseFloat(e.amount), 0);

    const netBalance = totalCredits - totalExpenses;

    return { totalExpenses, totalCredits, netBalance };
  };

  const calculateRunningBalance = (index) => {
    let balance = 0;
    for (let i = 0; i <= index; i++) {
      const entry = filteredEntries[i];
      if (entry.type === 'credit') {
        balance += parseFloat(entry.amount);
      } else {
        balance -= parseFloat(entry.amount);
      }
    }
    return balance;
  };

  const handleExportCSV = () => {
    if (filteredEntries.length === 0) {
      alert('No entries to export');
      return;
    }
    exportLedgerToCSV(filteredEntries);
  };

  const handleDateChange = (e) => {
    const { name, value } = e.target;
    setDateFilter(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const clearFilters = () => {
    setDateFilter({
      startDate: '',
      endDate: '',
    });
  };

  const totals = calculateTotals();

  return (
    <div className="page-container">
      <div className="page-header">
        <h1>Ledger</h1>
        <p>View your complete transaction history</p>
      </div>

      <div className="stats-grid">
        <div className="stat-card success">
          <div className="stat-label">Total Credits</div>
          <div className="stat-value" style={{ color: '#27ae60' }}>
            ${totals.totalCredits.toFixed(2)}
          </div>
        </div>
        <div className="stat-card danger">
          <div className="stat-label">Total Expenses</div>
          <div className="stat-value" style={{ color: '#e74c3c' }}>
            ${totals.totalExpenses.toFixed(2)}
          </div>
        </div>
        <div className="stat-card warning">
          <div className="stat-label">Net Balance</div>
          <div className="stat-value" style={{ color: totals.netBalance >= 0 ? '#27ae60' : '#e74c3c' }}>
            ${totals.netBalance.toFixed(2)}
          </div>
        </div>
      </div>

      <div className="card">
        <div style={{ marginBottom: '20px' }}>
          <h3 style={{ marginBottom: '15px' }}>Filter by Date Range</h3>
          <div style={{ display: 'flex', gap: '15px', alignItems: 'flex-end', flexWrap: 'wrap' }}>
            <div className="form-group" style={{ marginBottom: 0, flex: '1', minWidth: '200px' }}>
              <label htmlFor="startDate">Start Date</label>
              <input
                type="date"
                id="startDate"
                name="startDate"
                value={dateFilter.startDate}
                onChange={handleDateChange}
              />
            </div>
            <div className="form-group" style={{ marginBottom: 0, flex: '1', minWidth: '200px' }}>
              <label htmlFor="endDate">End Date</label>
              <input
                type="date"
                id="endDate"
                name="endDate"
                value={dateFilter.endDate}
                onChange={handleDateChange}
              />
            </div>
            <button onClick={clearFilters} className="btn btn-secondary">
              Clear Filters
            </button>
            <button onClick={handleExportCSV} className="btn btn-success">
              📥 Download CSV
            </button>
          </div>
        </div>
      </div>

      <div className="card">
        <h2 style={{ marginBottom: '20px' }}>Transaction History</h2>
        
        {filteredEntries.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">📊</div>
            <div className="empty-state-text">No transactions found</div>
            <p>Add some expenses or credits to see them here</p>
          </div>
        ) : (
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Description</th>
                  <th>Category</th>
                  <th>Type</th>
                  <th>Amount</th>
                  <th>Running Balance</th>
                </tr>
              </thead>
              <tbody>
                {filteredEntries.map((entry, index) => {
                  const runningBalance = calculateRunningBalance(index);
                  return (
                    <tr key={entry.id}>
                      <td>{entry.date}</td>
                      <td>{entry.description}</td>
                      <td>{entry.category || '-'}</td>
                      <td>
                        <span className={`badge badge-${entry.type}`}>
                          {entry.type.charAt(0).toUpperCase() + entry.type.slice(1)}
                        </span>
                      </td>
                      <td style={{ fontWeight: '600', color: entry.type === 'credit' ? '#27ae60' : '#e74c3c' }}>
                        {entry.type === 'credit' ? '+' : '-'}${parseFloat(entry.amount).toFixed(2)}
                      </td>
                      <td style={{ fontWeight: '700', color: runningBalance >= 0 ? '#27ae60' : '#e74c3c' }}>
                        ${runningBalance.toFixed(2)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default Ledger;

