import { useState, useEffect } from 'react';
import { getInvoices, deleteInvoice } from '../utils/storage';
import { exportInvoiceToPDF } from '../utils/pdfExport';

const InvoiceHistory = () => {
  const [invoices, setInvoices] = useState([]);
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [message, setMessage] = useState('');

  useEffect(() => {
    loadInvoices();
  }, []);

  const loadInvoices = () => {
    const loadedInvoices = getInvoices();
    // Sort by date descending
    const sorted = loadedInvoices.sort((a, b) => new Date(b.date) - new Date(a.date));
    setInvoices(sorted);
  };

  const handleView = (invoice) => {
    setSelectedInvoice(invoice);
  };

  const handleDownload = async (invoice) => {
    try {
      await exportInvoiceToPDF(invoice);
    } catch (error) {
      console.error('Error generating PDF:', error);
      setMessage('Error generating PDF. Please try again.');
      setTimeout(() => setMessage(''), 3000);
    }
  };

  const handleDelete = (id) => {
    if (window.confirm('Are you sure you want to delete this invoice?')) {
      deleteInvoice(id);
      loadInvoices();
      setSelectedInvoice(null);
      setMessage('Invoice deleted successfully!');
      setTimeout(() => setMessage(''), 3000);
    }
  };

  const handleClose = () => {
    setSelectedInvoice(null);
  };

  const calculateTotal = () => {
    return invoices.reduce((sum, invoice) => {
      // Support both old (amount) and new (total) invoice formats
      const invoiceTotal = invoice.total || invoice.amount || 0;
      return sum + parseFloat(invoiceTotal);
    }, 0);
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <h1>Invoice History</h1>
        <p>View and manage all your invoices</p>
      </div>

      {message && (
        <div className="alert alert-success">
          {message}
        </div>
      )}

      {!selectedInvoice ? (
        <>
          <div className="stats-grid">
            <div className="stat-card">
              <div className="stat-label">Total Invoices</div>
              <div className="stat-value">{invoices.length}</div>
            </div>
            <div className="stat-card success">
              <div className="stat-label">Total Amount Invoiced</div>
              <div className="stat-value" style={{ color: '#27ae60' }}>
                ${calculateTotal().toFixed(2)}
              </div>
            </div>
          </div>

          <div className="card">
            <h2 style={{ marginBottom: '20px' }}>All Invoices</h2>

            {invoices.length === 0 ? (
              <div className="empty-state">
                <div className="empty-state-icon">📄</div>
                <div className="empty-state-text">No invoices yet</div>
                <p>Create your first invoice to get started</p>
              </div>
            ) : (
              <div className="table-container">
                <table>
                  <thead>
                    <tr>
                      <th>Invoice #</th>
                      <th>Date</th>
                      <th>Client</th>
                      <th>Amount</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {invoices.map((invoice) => (
                      <tr key={invoice.id}>
                        <td style={{ fontWeight: '600' }}>{invoice.invoiceNumber}</td>
                        <td>{invoice.date}</td>
                        <td>{invoice.client}</td>
                        <td style={{ fontWeight: '600', color: '#27ae60' }}>
                          {invoice.currencySymbol || '$'}{parseFloat(invoice.total || invoice.amount || 0).toFixed(2)}
                        </td>
                        <td>
                          <div style={{ display: 'flex', gap: '8px' }}>
                            <button
                              onClick={() => handleView(invoice)}
                              className="btn btn-primary"
                              style={{ padding: '8px 16px', fontSize: '0.85rem' }}
                            >
                              👁️ View
                            </button>
                            <button
                              onClick={() => handleDownload(invoice)}
                              className="btn btn-success"
                              style={{ padding: '8px 16px', fontSize: '0.85rem' }}
                            >
                              📥 PDF
                            </button>
                            <button
                              onClick={() => handleDelete(invoice.id)}
                              className="btn btn-danger"
                              style={{ padding: '8px 16px', fontSize: '0.85rem' }}
                            >
                              🗑️
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </>
      ) : (
        <>
          <div style={{ marginBottom: '20px' }}>
            <button onClick={handleClose} className="btn btn-secondary">
              ← Back to List
            </button>
          </div>

          <div className="invoice-preview">
            {/* Invoice Header with Logo and Company Info */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '30px', paddingBottom: '20px', borderBottom: '2px solid #2c3e50' }}>
              <div style={{ flex: 1 }}>
                {selectedInvoice.companyLogo && (
                  <img 
                    src={selectedInvoice.companyLogo} 
                    alt="Company Logo" 
                    style={{ maxWidth: '150px', maxHeight: '80px', marginBottom: '10px' }}
                    onError={(e) => { e.target.style.display = 'none'; }}
                  />
                )}
                {selectedInvoice.companyName && (
                  <h2 style={{ color: '#2c3e50', marginBottom: '5px' }}>{selectedInvoice.companyName}</h2>
                )}
                {selectedInvoice.companyDescription && (
                  <p style={{ color: '#7f8c8d', fontSize: '0.9rem' }}>{selectedInvoice.companyDescription}</p>
                )}
              </div>
              <div style={{ textAlign: 'right' }}>
                <div className="invoice-title" style={{ fontSize: '2.5rem', fontWeight: '700', color: '#2c3e50' }}>INVOICE</div>
              </div>
            </div>

            {/* Top Sections */}
            {(selectedInvoice.topLeft || selectedInvoice.topRight) && (
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '30px', marginBottom: '30px' }}>
                <div>
                  {selectedInvoice.topLeft && (
                    <div style={{ fontSize: '0.9rem', color: '#2c3e50', whiteSpace: 'pre-line' }}>
                      {selectedInvoice.topLeft}
                    </div>
                  )}
                </div>
                <div style={{ textAlign: 'right' }}>
                  {selectedInvoice.topRight && (
                    <div style={{ fontSize: '0.9rem', color: '#2c3e50', whiteSpace: 'pre-line' }}>
                      {selectedInvoice.topRight}
                    </div>
                  )}
                </div>
              </div>
            )}

            <div className="invoice-details">
              <div className="invoice-section">
                <h3>Invoice Number</h3>
                <p>{selectedInvoice.invoiceNumber}</p>
              </div>
              <div className="invoice-section">
                <h3>Date</h3>
                <p>{selectedInvoice.date}</p>
              </div>
            </div>

            <div className="invoice-section">
              <h3>Bill To</h3>
              <p style={{ fontSize: '1.2rem', fontWeight: '600' }}>{selectedInvoice.client}</p>
            </div>

            {/* Check if invoice has line items (new format) or items (old format) */}
            {selectedInvoice.lineItems ? (
              <>
                {/* New format with line items table */}
                <div style={{ marginTop: '30px', marginBottom: '30px' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                      <tr style={{ backgroundColor: '#f8f9fa' }}>
                        <th style={{ textAlign: 'left', padding: '12px', borderBottom: '2px solid #2c3e50' }}>Description</th>
                        <th style={{ textAlign: 'center', padding: '12px', borderBottom: '2px solid #2c3e50' }}>Quantity</th>
                        <th style={{ textAlign: 'right', padding: '12px', borderBottom: '2px solid #2c3e50' }}>Rate</th>
                        <th style={{ textAlign: 'right', padding: '12px', borderBottom: '2px solid #2c3e50' }}>Amount</th>
                      </tr>
                    </thead>
                    <tbody>
                      {selectedInvoice.lineItems.map((item, index) => (
                        <tr key={index}>
                          <td style={{ padding: '12px', borderBottom: '1px solid #ecf0f1' }}>{item.description}</td>
                          <td style={{ padding: '12px', borderBottom: '1px solid #ecf0f1', textAlign: 'center' }}>{item.quantity}</td>
                          <td style={{ padding: '12px', borderBottom: '1px solid #ecf0f1', textAlign: 'right' }}>{selectedInvoice.currencySymbol}{parseFloat(item.rate).toFixed(2)}</td>
                          <td style={{ padding: '12px', borderBottom: '1px solid #ecf0f1', textAlign: 'right' }}>{selectedInvoice.currencySymbol}{parseFloat(item.amount).toFixed(2)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Totals */}
                <div style={{ textAlign: 'right', marginTop: '30px' }}>
                  <div style={{ display: 'inline-block', textAlign: 'right', minWidth: '300px' }}>
                    <div style={{ padding: '10px 0', borderBottom: '1px solid #ecf0f1', display: 'flex', justifyContent: 'space-between', gap: '40px' }}>
                      <span style={{ fontWeight: '600' }}>Subtotal:</span>
                      <span>{selectedInvoice.currencySymbol}{parseFloat(selectedInvoice.subtotal).toFixed(2)}</span>
                    </div>
                    {selectedInvoice.taxPercentage > 0 && (
                      <div style={{ padding: '10px 0', borderBottom: '1px solid #ecf0f1', display: 'flex', justifyContent: 'space-between', gap: '40px', color: '#7f8c8d' }}>
                        <span style={{ fontWeight: '600' }}>{selectedInvoice.taxName} ({selectedInvoice.taxPercentage}%):</span>
                        <span>{selectedInvoice.currencySymbol}{parseFloat(selectedInvoice.taxAmount).toFixed(2)}</span>
                      </div>
                    )}
                    <div style={{ padding: '15px 0', borderTop: '2px solid #2c3e50', display: 'flex', justifyContent: 'space-between', gap: '40px', fontSize: '1.3rem', fontWeight: '700', color: '#27ae60' }}>
                      <span>Total:</span>
                      <span>{selectedInvoice.currencySymbol}{parseFloat(selectedInvoice.total).toFixed(2)}</span>
                    </div>
                  </div>
                </div>
              </>
            ) : (
              <>
                {/* Old format with simple items text */}
                <div className="invoice-items">
                  <div className="invoice-section">
                    <h3>Description</h3>
                    <p style={{ whiteSpace: 'pre-line' }}>{selectedInvoice.items}</p>
                  </div>
                </div>

                <div className="invoice-total">
                  <div className="invoice-total-label">Total Amount</div>
                  <div className="invoice-total-amount">{selectedInvoice.currencySymbol || '$'}{parseFloat(selectedInvoice.amount).toFixed(2)}</div>
                </div>
              </>
            )}

            {/* Bottom Sections */}
            {(selectedInvoice.bottomLeft || selectedInvoice.bottomRight) && (
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '30px', marginTop: '40px', paddingTop: '30px', borderTop: '1px solid #ecf0f1' }}>
                <div>
                  {selectedInvoice.bottomLeft && (
                    <div style={{ fontSize: '0.85rem', color: '#7f8c8d', whiteSpace: 'pre-line' }}>
                      {selectedInvoice.bottomLeft}
                    </div>
                  )}
                </div>
                <div style={{ textAlign: 'right' }}>
                  {selectedInvoice.bottomRight && (
                    <div style={{ fontSize: '0.85rem', color: '#7f8c8d', whiteSpace: 'pre-line' }}>
                      {selectedInvoice.bottomRight}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Bottom Center Message */}
            <div style={{ textAlign: 'center', marginTop: '30px', fontStyle: 'italic', color: '#7f8c8d', fontSize: '1.1rem' }}>
              {selectedInvoice.bottomCenter || 'Thank you for your business!'}
            </div>
          </div>

          <div className="action-buttons" style={{ justifyContent: 'center', marginTop: '30px' }}>
            <button onClick={() => handleDownload(selectedInvoice)} className="btn btn-success">
              📥 Download PDF
            </button>
            <button onClick={() => handleDelete(selectedInvoice.id)} className="btn btn-danger">
              🗑️ Delete Invoice
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default InvoiceHistory;

