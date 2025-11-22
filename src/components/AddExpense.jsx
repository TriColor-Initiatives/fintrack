import { useState, useEffect } from 'react';
import { saveEntry, getEntries, deleteEntry } from '../utils/storage';

const AddExpense = () => {
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    description: '',
    amount: '',
    type: 'expense',
    category: '',
  });

  const [entries, setEntries] = useState([]);
  const [message, setMessage] = useState('');

  useEffect(() => {
    loadEntries();
  }, []);

  const loadEntries = () => {
    const loadedEntries = getEntries();
    // Sort by date descending
    const sorted = loadedEntries.sort((a, b) => new Date(b.date) - new Date(a.date));
    setEntries(sorted);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!formData.description || !formData.amount) {
      setMessage('Please fill in all required fields');
      setTimeout(() => setMessage(''), 3000);
      return;
    }

    try {
      saveEntry(formData);
      setMessage('Entry added successfully!');
      setFormData({
        date: new Date().toISOString().split('T')[0],
        description: '',
        amount: '',
        type: 'expense',
        category: '',
      });
      loadEntries();
      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      setMessage('Error adding entry');
      setTimeout(() => setMessage(''), 3000);
    }
  };

  const handleDelete = (id) => {
    if (window.confirm('Are you sure you want to delete this entry?')) {
      deleteEntry(id);
      loadEntries();
      setMessage('Entry deleted successfully!');
      setTimeout(() => setMessage(''), 3000);
    }
  };

  const calculateBalance = () => {
    return entries.reduce((acc, entry) => {
      return entry.type === 'credit' 
        ? acc + parseFloat(entry.amount)
        : acc - parseFloat(entry.amount);
    }, 0);
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <h1>Add Expense / Credit</h1>
        <p>Track your daily expenses and income</p>
      </div>

      {message && (
        <div className={`alert ${message.includes('Error') ? 'alert-error' : 'alert-success'}`}>
          {message}
        </div>
      )}

      <div className="card">
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="date">Date *</label>
            <input
              type="date"
              id="date"
              name="date"
              value={formData.date}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="type">Type *</label>
            <select
              id="type"
              name="type"
              value={formData.type}
              onChange={handleChange}
              required
            >
              <option value="expense">Expense</option>
              <option value="credit">Credit</option>
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="description">Description *</label>
            <input
              type="text"
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Enter description"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="category">Category</label>
            <input
              type="text"
              id="category"
              name="category"
              value={formData.category}
              onChange={handleChange}
              placeholder="e.g., Food, Salary, Utilities"
            />
          </div>

          <div className="form-group">
            <label htmlFor="amount">Amount ($) *</label>
            <input
              type="number"
              id="amount"
              name="amount"
              value={formData.amount}
              onChange={handleChange}
              placeholder="0.00"
              step="0.01"
              min="0"
              required
            />
          </div>

          <button type="submit" className="btn btn-primary">
            ➕ Add Entry
          </button>
        </form>
      </div>

      <div className="card" style={{ marginTop: '30px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <h2>Recent Entries</h2>
          <div className="stat-value" style={{ fontSize: '1.5rem', color: calculateBalance() >= 0 ? '#27ae60' : '#e74c3c' }}>
            Balance: ${calculateBalance().toFixed(2)}
          </div>
        </div>

        {entries.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">📝</div>
            <div className="empty-state-text">No entries yet</div>
            <p>Add your first expense or credit above</p>
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
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {entries.map((entry) => (
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
                    <td>
                      <button
                        onClick={() => handleDelete(entry.id)}
                        className="btn btn-danger"
                        style={{ padding: '8px 16px', fontSize: '0.85rem' }}
                      >
                        🗑️ Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default AddExpense;

