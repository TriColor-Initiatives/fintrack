import { useState, useEffect } from 'react';
import { saveInvoice, getClients, saveClient, getOrganizationSettings } from '../utils/storage';
import { exportInvoiceToPDF } from '../utils/pdfExport';

const CreateInvoice = () => {
  const [formData, setFormData] = useState({
    client: '',
    date: new Date().toISOString().split('T')[0],
    topLeft: '',
    topRight: '',
    bottomLeft: '',
    bottomRight: '',
    bottomCenter: 'Thank you for your business',
  });

  const [lineItems, setLineItems] = useState([
    { description: '', quantity: 1, rate: 0, amount: 0 }
  ]);

  const [clients, setClients] = useState([]);
  const [newClient, setNewClient] = useState('');
  const [showNewClientInput, setShowNewClientInput] = useState(false);
  const [message, setMessage] = useState('');
  const [previewInvoice, setPreviewInvoice] = useState(null);
  const [orgSettings, setOrgSettings] = useState(null);

  useEffect(() => {
    loadClients();
    loadOrgSettings();
  }, []);

  const loadClients = () => {
    const loadedClients = getClients();
    setClients(loadedClients);
  };

  const loadOrgSettings = () => {
    const settings = getOrganizationSettings();
    setOrgSettings(settings);
    // Pre-fill default positions from org settings
    setFormData(prev => ({
      ...prev,
      topLeft: settings.defaultTopLeft || '',
      topRight: settings.defaultTopRight || '',
      bottomLeft: settings.defaultBottomLeft || '',
      bottomRight: settings.defaultBottomRight || '',
      bottomCenter: settings.defaultBottomCenter || 'Thank you for your business',
    }));
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleLineItemChange = (index, field, value) => {
    const newLineItems = [...lineItems];
    newLineItems[index][field] = value;
    
    // Auto-calculate amount when quantity or rate changes
    if (field === 'quantity' || field === 'rate') {
      const quantity = parseFloat(newLineItems[index].quantity) || 0;
      const rate = parseFloat(newLineItems[index].rate) || 0;
      newLineItems[index].amount = quantity * rate;
    }
    
    setLineItems(newLineItems);
  };

  const addLineItem = () => {
    setLineItems([...lineItems, { description: '', quantity: 1, rate: 0, amount: 0 }]);
  };

  const removeLineItem = (index) => {
    if (lineItems.length > 1) {
      const newLineItems = lineItems.filter((_, i) => i !== index);
      setLineItems(newLineItems);
    }
  };

  const calculateSubtotal = () => {
    return lineItems.reduce((sum, item) => sum + (parseFloat(item.amount) || 0), 0);
  };

  const calculateTax = (subtotal) => {
    if (!orgSettings) return 0;
    return (subtotal * parseFloat(orgSettings.taxPercentage || 0)) / 100;
  };

  const calculateTotal = () => {
    const subtotal = calculateSubtotal();
    const tax = calculateTax(subtotal);
    return subtotal + tax;
  };

  const handleAddClient = () => {
    if (newClient.trim()) {
      saveClient(newClient.trim());
      loadClients();
      setFormData(prev => ({ ...prev, client: newClient.trim() }));
      setNewClient('');
      setShowNewClientInput(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!formData.client) {
      setMessage('Please select a client');
      setTimeout(() => setMessage(''), 3000);
      return;
    }

    // Validate line items
    const validLineItems = lineItems.filter(item => item.description.trim() && item.amount > 0);
    if (validLineItems.length === 0) {
      setMessage('Please add at least one valid line item');
      setTimeout(() => setMessage(''), 3000);
      return;
    }

    try {
      const subtotal = calculateSubtotal();
      const taxAmount = calculateTax(subtotal);
      const total = calculateTotal();

      const invoiceData = {
        ...formData,
        lineItems: validLineItems,
        subtotal,
        taxAmount,
        taxPercentage: orgSettings?.taxPercentage || 0,
        taxName: orgSettings?.taxName || 'Tax',
        total,
        currency: orgSettings?.currency || 'USD',
        currencySymbol: orgSettings?.currencySymbol || '$',
        // Include organization info snapshot
        companyName: orgSettings?.companyName || '',
        companyLogo: orgSettings?.companyLogo || '',
        companyDescription: orgSettings?.companyDescription || '',
      };

      const invoice = saveInvoice(invoiceData);
      setMessage('Invoice created successfully!');
      setPreviewInvoice(invoice);
      
      // Reset form
      setFormData({
        client: '',
        date: new Date().toISOString().split('T')[0],
        topLeft: orgSettings?.defaultTopLeft || '',
        topRight: orgSettings?.defaultTopRight || '',
        bottomLeft: orgSettings?.defaultBottomLeft || '',
        bottomRight: orgSettings?.defaultBottomRight || '',
        bottomCenter: orgSettings?.defaultBottomCenter || 'Thank you for your business',
      });
      setLineItems([{ description: '', quantity: 1, rate: 0, amount: 0 }]);
      
      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      setMessage('Error creating invoice');
      setTimeout(() => setMessage(''), 3000);
    }
  };

  const handleDownloadPDF = async () => {
    if (previewInvoice) {
      try {
        await exportInvoiceToPDF(previewInvoice);
      } catch (error) {
        console.error('Error generating PDF:', error);
        setMessage('Error generating PDF. Please try again.');
        setTimeout(() => setMessage(''), 3000);
      }
    }
  };

  const handleCreateNew = () => {
    setPreviewInvoice(null);
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <h1>Create Invoice</h1>
        <p>Generate professional invoices for your clients</p>
      </div>

      {message && (
        <div className={`alert ${message.includes('Error') ? 'alert-error' : 'alert-success'}`}>
          {message}
        </div>
      )}

      {!previewInvoice ? (
        <div className="card">
          <form onSubmit={handleSubmit}>
            <h2 style={{ marginBottom: '20px', color: '#2c3e50' }}>Client Information</h2>
            
            <div className="form-group">
              <label htmlFor="client">Client *</label>
              <div style={{ display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
                <select
                  id="client"
                  name="client"
                  value={formData.client}
                  onChange={handleChange}
                  required
                  style={{ flex: 1 }}
                  disabled={showNewClientInput}
                >
                  <option value="">Select a client</option>
                  {clients.map((client) => (
                    <option key={client} value={client}>
                      {client}
                    </option>
                  ))}
                </select>
                <button
                  type="button"
                  onClick={() => setShowNewClientInput(!showNewClientInput)}
                  className="btn btn-secondary"
                >
                  {showNewClientInput ? 'Cancel' : '+ New Client'}
                </button>
              </div>
            </div>

            {showNewClientInput && (
              <div className="form-group">
                <label htmlFor="newClient">New Client Name</label>
                <div style={{ display: 'flex', gap: '10px' }}>
                  <input
                    type="text"
                    id="newClient"
                    value={newClient}
                    onChange={(e) => setNewClient(e.target.value)}
                    placeholder="Enter client name"
                    style={{ flex: 1 }}
                  />
                  <button
                    type="button"
                    onClick={handleAddClient}
                    className="btn btn-primary"
                  >
                    Add
                  </button>
                </div>
              </div>
            )}

            <div className="form-group">
              <label htmlFor="date">Invoice Date *</label>
              <input
                type="date"
                id="date"
                name="date"
                value={formData.date}
                onChange={handleChange}
                required
              />
            </div>

            <h2 style={{ marginTop: '30px', marginBottom: '20px', color: '#2c3e50' }}>Line Items</h2>

            <div style={{ overflowX: 'auto', marginBottom: '20px' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr>
                    <th style={{ textAlign: 'left', padding: '10px', borderBottom: '2px solid #dce1e7' }}>Description</th>
                    <th style={{ textAlign: 'center', padding: '10px', borderBottom: '2px solid #dce1e7', width: '100px' }}>Quantity</th>
                    <th style={{ textAlign: 'right', padding: '10px', borderBottom: '2px solid #dce1e7', width: '120px' }}>Rate ({orgSettings?.currencySymbol || '$'})</th>
                    <th style={{ textAlign: 'right', padding: '10px', borderBottom: '2px solid #dce1e7', width: '120px' }}>Amount ({orgSettings?.currencySymbol || '$'})</th>
                    <th style={{ textAlign: 'center', padding: '10px', borderBottom: '2px solid #dce1e7', width: '80px' }}>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {lineItems.map((item, index) => (
                    <tr key={index}>
                      <td style={{ padding: '10px', borderBottom: '1px solid #ecf0f1' }}>
                        <input
                          type="text"
                          value={item.description}
                          onChange={(e) => handleLineItemChange(index, 'description', e.target.value)}
                          placeholder="Item description"
                          style={{ width: '100%', padding: '8px', border: '1px solid #dce1e7', borderRadius: '4px' }}
                        />
                      </td>
                      <td style={{ padding: '10px', borderBottom: '1px solid #ecf0f1' }}>
                        <input
                          type="number"
                          value={item.quantity}
                          onChange={(e) => handleLineItemChange(index, 'quantity', e.target.value)}
                          min="0"
                          step="1"
                          style={{ width: '100%', padding: '8px', border: '1px solid #dce1e7', borderRadius: '4px', textAlign: 'center' }}
                        />
                      </td>
                      <td style={{ padding: '10px', borderBottom: '1px solid #ecf0f1' }}>
                        <input
                          type="number"
                          value={item.rate}
                          onChange={(e) => handleLineItemChange(index, 'rate', e.target.value)}
                          min="0"
                          step="0.01"
                          style={{ width: '100%', padding: '8px', border: '1px solid #dce1e7', borderRadius: '4px', textAlign: 'right' }}
                        />
                      </td>
                      <td style={{ padding: '10px', borderBottom: '1px solid #ecf0f1', textAlign: 'right', fontWeight: '600' }}>
                        {orgSettings?.currencySymbol || '$'}{parseFloat(item.amount || 0).toFixed(2)}
                      </td>
                      <td style={{ padding: '10px', borderBottom: '1px solid #ecf0f1', textAlign: 'center' }}>
                        <button
                          type="button"
                          onClick={() => removeLineItem(index)}
                          className="btn btn-danger"
                          disabled={lineItems.length === 1}
                          style={{ padding: '6px 12px', fontSize: '0.85rem' }}
                        >
                          ✕
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <button
              type="button"
              onClick={addLineItem}
              className="btn btn-secondary"
              style={{ marginBottom: '20px' }}
            >
              + Add Line Item
            </button>

            <div style={{ textAlign: 'right', padding: '20px', backgroundColor: '#f8f9fa', borderRadius: '6px', marginBottom: '20px' }}>
              <div style={{ marginBottom: '10px', fontSize: '1.1rem' }}>
                <span style={{ fontWeight: '600' }}>Subtotal:</span> {orgSettings?.currencySymbol || '$'}{calculateSubtotal().toFixed(2)}
              </div>
              {orgSettings && orgSettings.taxPercentage > 0 && (
                <div style={{ marginBottom: '10px', fontSize: '1.1rem', color: '#7f8c8d' }}>
                  <span style={{ fontWeight: '600' }}>{orgSettings.taxName} ({orgSettings.taxPercentage}%):</span> {orgSettings?.currencySymbol || '$'}{calculateTax(calculateSubtotal()).toFixed(2)}
                </div>
              )}
              <div style={{ fontSize: '1.3rem', fontWeight: '700', color: '#27ae60' }}>
                <span>Total:</span> {orgSettings?.currencySymbol || '$'}{calculateTotal().toFixed(2)}
              </div>
            </div>

            <h2 style={{ marginTop: '30px', marginBottom: '20px', color: '#2c3e50' }}>Invoice Customization</h2>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px' }}>
              <div className="form-group">
                <label htmlFor="topLeft">Top Left</label>
                <textarea
                  id="topLeft"
                  name="topLeft"
                  value={formData.topLeft}
                  onChange={handleChange}
                  placeholder="Company address..."
                  style={{ minHeight: '80px' }}
                />
              </div>

              <div className="form-group">
                <label htmlFor="topRight">Top Right</label>
                <textarea
                  id="topRight"
                  name="topRight"
                  value={formData.topRight}
                  onChange={handleChange}
                  placeholder="Contact information..."
                  style={{ minHeight: '80px' }}
                />
              </div>

              <div className="form-group">
                <label htmlFor="bottomLeft">Bottom Left</label>
                <textarea
                  id="bottomLeft"
                  name="bottomLeft"
                  value={formData.bottomLeft}
                  onChange={handleChange}
                  placeholder="Payment terms..."
                  style={{ minHeight: '80px' }}
                />
              </div>

              <div className="form-group">
                <label htmlFor="bottomRight">Bottom Right</label>
                <textarea
                  id="bottomRight"
                  name="bottomRight"
                  value={formData.bottomRight}
                  onChange={handleChange}
                  placeholder="Bank details..."
                  style={{ minHeight: '80px' }}
                />
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="bottomCenter">Bottom Center Message</label>
              <input
                type="text"
                id="bottomCenter"
                name="bottomCenter"
                value={formData.bottomCenter}
                onChange={handleChange}
                placeholder="Thank you for your business"
              />
            </div>

            <button type="submit" className="btn btn-primary">
              📄 Create Invoice
            </button>
          </form>
        </div>
      ) : (
        <>
          <div className="invoice-preview">
            {/* Invoice Header with Logo and Company Info */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '30px', paddingBottom: '20px', borderBottom: '2px solid #2c3e50' }}>
              <div style={{ flex: 1 }}>
                {previewInvoice.companyLogo && (
                  <img 
                    src={previewInvoice.companyLogo} 
                    alt="Company Logo" 
                    style={{ maxWidth: '150px', maxHeight: '80px', marginBottom: '10px' }}
                    onError={(e) => { e.target.style.display = 'none'; }}
                  />
                )}
                {previewInvoice.companyName && (
                  <h2 style={{ color: '#2c3e50', marginBottom: '5px' }}>{previewInvoice.companyName}</h2>
                )}
                {previewInvoice.companyDescription && (
                  <p style={{ color: '#7f8c8d', fontSize: '0.9rem' }}>{previewInvoice.companyDescription}</p>
                )}
              </div>
              <div style={{ textAlign: 'right' }}>
                <div className="invoice-title" style={{ fontSize: '2.5rem', fontWeight: '700', color: '#2c3e50' }}>INVOICE</div>
              </div>
            </div>

            {/* Top Sections */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '30px', marginBottom: '30px' }}>
              <div>
                {previewInvoice.topLeft && (
                  <div style={{ fontSize: '0.9rem', color: '#2c3e50', whiteSpace: 'pre-line' }}>
                    {previewInvoice.topLeft}
                  </div>
                )}
              </div>
              <div style={{ textAlign: 'right' }}>
                {previewInvoice.topRight && (
                  <div style={{ fontSize: '0.9rem', color: '#2c3e50', whiteSpace: 'pre-line' }}>
                    {previewInvoice.topRight}
                  </div>
                )}
              </div>
            </div>

            {/* Invoice Details */}
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '30px' }}>
              <div className="invoice-section">
                <h3>Invoice Number</h3>
                <p>{previewInvoice.invoiceNumber}</p>
              </div>
              <div className="invoice-section">
                <h3>Date</h3>
                <p>{previewInvoice.date}</p>
              </div>
            </div>

            {/* Bill To */}
            <div className="invoice-section">
              <h3>Bill To</h3>
              <p style={{ fontSize: '1.2rem', fontWeight: '600' }}>{previewInvoice.client}</p>
            </div>

            {/* Line Items Table */}
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
                  {previewInvoice.lineItems.map((item, index) => (
                    <tr key={index}>
                      <td style={{ padding: '12px', borderBottom: '1px solid #ecf0f1' }}>{item.description}</td>
                      <td style={{ padding: '12px', borderBottom: '1px solid #ecf0f1', textAlign: 'center' }}>{item.quantity}</td>
                      <td style={{ padding: '12px', borderBottom: '1px solid #ecf0f1', textAlign: 'right' }}>{previewInvoice.currencySymbol}{parseFloat(item.rate).toFixed(2)}</td>
                      <td style={{ padding: '12px', borderBottom: '1px solid #ecf0f1', textAlign: 'right' }}>{previewInvoice.currencySymbol}{parseFloat(item.amount).toFixed(2)}</td>
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
                  <span>{previewInvoice.currencySymbol}{parseFloat(previewInvoice.subtotal).toFixed(2)}</span>
                </div>
                {previewInvoice.taxPercentage > 0 && (
                  <div style={{ padding: '10px 0', borderBottom: '1px solid #ecf0f1', display: 'flex', justifyContent: 'space-between', gap: '40px', color: '#7f8c8d' }}>
                    <span style={{ fontWeight: '600' }}>{previewInvoice.taxName} ({previewInvoice.taxPercentage}%):</span>
                    <span>{previewInvoice.currencySymbol}{parseFloat(previewInvoice.taxAmount).toFixed(2)}</span>
                  </div>
                )}
                <div style={{ padding: '15px 0', borderTop: '2px solid #2c3e50', display: 'flex', justifyContent: 'space-between', gap: '40px', fontSize: '1.3rem', fontWeight: '700', color: '#27ae60' }}>
                  <span>Total:</span>
                  <span>{previewInvoice.currencySymbol}{parseFloat(previewInvoice.total).toFixed(2)}</span>
                </div>
              </div>
            </div>

            {/* Bottom Sections */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '30px', marginTop: '40px', paddingTop: '30px', borderTop: '1px solid #ecf0f1' }}>
              <div>
                {previewInvoice.bottomLeft && (
                  <div style={{ fontSize: '0.85rem', color: '#7f8c8d', whiteSpace: 'pre-line' }}>
                    {previewInvoice.bottomLeft}
                  </div>
                )}
              </div>
              <div style={{ textAlign: 'right' }}>
                {previewInvoice.bottomRight && (
                  <div style={{ fontSize: '0.85rem', color: '#7f8c8d', whiteSpace: 'pre-line' }}>
                    {previewInvoice.bottomRight}
                  </div>
                )}
              </div>
            </div>

            {/* Bottom Center Message */}
            {previewInvoice.bottomCenter && (
              <div style={{ textAlign: 'center', marginTop: '30px', fontStyle: 'italic', color: '#7f8c8d', fontSize: '1.1rem' }}>
                {previewInvoice.bottomCenter}
              </div>
            )}
          </div>

          <div className="action-buttons" style={{ justifyContent: 'center', marginTop: '30px' }}>
            <button onClick={handleDownloadPDF} className="btn btn-success">
              📥 Download PDF
            </button>
            <button onClick={handleCreateNew} className="btn btn-secondary">
              Create Another Invoice
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default CreateInvoice;
