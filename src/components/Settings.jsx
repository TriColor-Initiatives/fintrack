import { useState, useEffect } from 'react';
import { getOrganizationSettings, saveOrganizationSettings } from '../utils/storage';
import { exportData, importData, getBackupPreview } from '../utils/backupRestore';

const Settings = () => {
  const [formData, setFormData] = useState({
    companyName: '',
    companyLogo: '',
    companyDescription: '',
    taxName: 'Tax',
    taxPercentage: 0,
    currency: 'USD',
    currencySymbol: '$',
    defaultTopLeft: '',
    defaultTopRight: '',
    defaultBottomLeft: '',
    defaultBottomRight: '',
    defaultBottomCenter: 'Thank you for your business',
  });

  const [message, setMessage] = useState('');
  const [backupPreview, setBackupPreview] = useState({ entries: 0, invoices: 0, clients: 0 });
  const [isExporting, setIsExporting] = useState(false);
  const [isImporting, setIsImporting] = useState(false);

  useEffect(() => {
    loadSettings();
    loadBackupPreview();
  }, []);

  const loadBackupPreview = () => {
    const preview = getBackupPreview();
    setBackupPreview(preview);
  };

  const loadSettings = () => {
    const settings = getOrganizationSettings();
    if (settings) {
      setFormData(settings);
    }
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

    try {
      saveOrganizationSettings(formData);
      setMessage('Settings saved successfully!');
      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      setMessage('Error saving settings');
      setTimeout(() => setMessage(''), 3000);
    }
  };

  const handleExport = async () => {
    setIsExporting(true);
    setMessage('');
    
    try {
      const result = await exportData();
      if (result.success) {
        setMessage(result.message);
      } else {
        setMessage(`Export failed: ${result.message}`);
      }
    } catch (error) {
      setMessage(`Export failed: ${error.message}`);
    } finally {
      setIsExporting(false);
      setTimeout(() => setMessage(''), 5000);
    }
  };

  const handleImport = async () => {
    const confirmed = window.confirm(
      '⚠️ WARNING: Importing will replace ALL existing data!\n\n' +
      'Current data:\n' +
      `- ${backupPreview.entries} entries\n` +
      `- ${backupPreview.invoices} invoices\n` +
      `- ${backupPreview.clients} clients\n\n` +
      'Do you want to continue?'
    );

    if (!confirmed) return;

    setIsImporting(true);
    setMessage('');

    try {
      const result = await importData();
      if (result.success) {
        setMessage(result.message);
        loadBackupPreview();
        loadSettings();
        // Reload the page after 2 seconds to refresh all data
        setTimeout(() => {
          window.location.reload();
        }, 2000);
      } else {
        setMessage(`Import failed: ${result.message}`);
      }
    } catch (error) {
      setMessage(`Import failed: ${error.message}`);
    } finally {
      setIsImporting(false);
    }
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <h1>Organization Settings</h1>
        <p>Configure your company information and invoice defaults</p>
      </div>

      {message && (
        <div className={`alert ${message.includes('Error') || message.includes('failed') ? 'alert-error' : 'alert-success'}`}>
          {message}
        </div>
      )}

      <div className="card" style={{ marginBottom: '20px' }}>
        <h2 style={{ marginBottom: '20px', color: '#2c3e50' }}>Data Management</h2>
        <p style={{ color: '#7f8c8d', marginBottom: '20px' }}>
          Export your data for backup or import previously exported data to restore.
        </p>

        <div style={{ 
          padding: '15px', 
          backgroundColor: '#ecf0f1', 
          borderRadius: '8px',
          marginBottom: '20px'
        }}>
          <h3 style={{ fontSize: '1rem', marginBottom: '10px', color: '#2c3e50' }}>Current Data:</h3>
          <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
            <li style={{ padding: '5px 0', color: '#34495e' }}>📝 {backupPreview.entries} entries (expenses & credits)</li>
            <li style={{ padding: '5px 0', color: '#34495e' }}>📄 {backupPreview.invoices} invoices</li>
            <li style={{ padding: '5px 0', color: '#34495e' }}>👥 {backupPreview.clients} clients</li>
          </ul>
        </div>

        <div style={{ display: 'flex', gap: '15px', flexWrap: 'wrap' }}>
          <button
            type="button"
            className="btn btn-primary"
            onClick={handleExport}
            disabled={isExporting}
            style={{ flex: '1', minWidth: '200px' }}
          >
            {isExporting ? '⏳ Exporting...' : '💾 Export Data'}
          </button>
          <button
            type="button"
            className="btn"
            onClick={handleImport}
            disabled={isImporting}
            style={{ 
              flex: '1', 
              minWidth: '200px',
              backgroundColor: '#e67e22',
              color: 'white'
            }}
          >
            {isImporting ? '⏳ Importing...' : '📥 Import Data'}
          </button>
        </div>

        <div style={{ 
          marginTop: '15px', 
          padding: '12px', 
          backgroundColor: '#fff3cd', 
          border: '1px solid #ffc107',
          borderRadius: '6px',
          fontSize: '0.9rem',
          color: '#856404'
        }}>
          <strong>⚠️ Important:</strong> Importing will replace ALL your current data. Make sure to export your current data first if you want to keep it!
        </div>
      </div>

      <div className="card">
        <form onSubmit={handleSubmit}>
          <h2 style={{ marginBottom: '20px', color: '#2c3e50' }}>Company Information</h2>
          
          <div className="form-group">
            <label htmlFor="companyName">Company Name</label>
            <input
              type="text"
              id="companyName"
              name="companyName"
              value={formData.companyName}
              onChange={handleChange}
              placeholder="Enter your company name"
            />
          </div>

          <div className="form-group">
            <label htmlFor="companyLogo">Company Logo URL</label>
            <input
              type="text"
              id="companyLogo"
              name="companyLogo"
              value={formData.companyLogo}
              onChange={handleChange}
              placeholder="https://example.com/logo.png"
            />
            <small style={{ color: '#7f8c8d', fontSize: '0.85rem' }}>
              Enter a URL to an image file for your company logo
            </small>
          </div>

          <div className="form-group">
            <label htmlFor="companyDescription">Company Description</label>
            <textarea
              id="companyDescription"
              name="companyDescription"
              value={formData.companyDescription}
              onChange={handleChange}
              placeholder="Brief description of your company"
              style={{ minHeight: '80px' }}
            />
          </div>

          <h2 style={{ marginTop: '30px', marginBottom: '20px', color: '#2c3e50' }}>Currency & Tax Configuration</h2>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px' }}>
            <div className="form-group">
              <label htmlFor="currency">Currency Code</label>
              <input
                type="text"
                id="currency"
                name="currency"
                value={formData.currency}
                onChange={handleChange}
                placeholder="USD"
                maxLength="3"
              />
              <small style={{ color: '#7f8c8d', fontSize: '0.85rem' }}>
                e.g., USD, EUR, GBP, INR
              </small>
            </div>

            <div className="form-group">
              <label htmlFor="currencySymbol">Currency Symbol</label>
              <input
                type="text"
                id="currencySymbol"
                name="currencySymbol"
                value={formData.currencySymbol}
                onChange={handleChange}
                placeholder="$"
                maxLength="3"
              />
              <small style={{ color: '#7f8c8d', fontSize: '0.85rem' }}>
                e.g., $, €, £, ₹
              </small>
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="taxName">Tax Name</label>
            <input
              type="text"
              id="taxName"
              name="taxName"
              value={formData.taxName}
              onChange={handleChange}
              placeholder="e.g., VAT, GST, Sales Tax"
            />
          </div>

          <div className="form-group">
            <label htmlFor="taxPercentage">Tax Percentage (%)</label>
            <input
              type="number"
              id="taxPercentage"
              name="taxPercentage"
              value={formData.taxPercentage}
              onChange={handleChange}
              placeholder="0"
              step="0.01"
              min="0"
              max="100"
            />
          </div>

          <h2 style={{ marginTop: '30px', marginBottom: '20px', color: '#2c3e50' }}>Invoice Default Positions</h2>

          <div className="form-group">
            <label htmlFor="defaultTopLeft">Top Left (e.g., Company Address)</label>
            <textarea
              id="defaultTopLeft"
              name="defaultTopLeft"
              value={formData.defaultTopLeft}
              onChange={handleChange}
              placeholder="123 Business St.&#10;City, State 12345&#10;Country"
              style={{ minHeight: '80px' }}
            />
          </div>

          <div className="form-group">
            <label htmlFor="defaultTopRight">Top Right (e.g., Contact Info)</label>
            <textarea
              id="defaultTopRight"
              name="defaultTopRight"
              value={formData.defaultTopRight}
              onChange={handleChange}
              placeholder="Phone: (123) 456-7890&#10;Email: info@company.com&#10;Website: www.company.com"
              style={{ minHeight: '80px' }}
            />
          </div>

          <div className="form-group">
            <label htmlFor="defaultBottomLeft">Bottom Left (e.g., Payment Terms)</label>
            <textarea
              id="defaultBottomLeft"
              name="defaultBottomLeft"
              value={formData.defaultBottomLeft}
              onChange={handleChange}
              placeholder="Payment Terms: Net 30&#10;Payment Methods: Bank Transfer, Check"
              style={{ minHeight: '80px' }}
            />
          </div>

          <div className="form-group">
            <label htmlFor="defaultBottomRight">Bottom Right (e.g., Bank Details)</label>
            <textarea
              id="defaultBottomRight"
              name="defaultBottomRight"
              value={formData.defaultBottomRight}
              onChange={handleChange}
              placeholder="Bank: ABC Bank&#10;Account: 123456789&#10;SWIFT: ABCDEF12"
              style={{ minHeight: '80px' }}
            />
          </div>

          <div className="form-group">
            <label htmlFor="defaultBottomCenter">Bottom Center Message</label>
            <input
              type="text"
              id="defaultBottomCenter"
              name="defaultBottomCenter"
              value={formData.defaultBottomCenter}
              onChange={handleChange}
              placeholder="Thank you for your business"
            />
          </div>

          <button type="submit" className="btn btn-primary">
            💾 Save Settings
          </button>
        </form>
      </div>
    </div>
  );
};

export default Settings;

