// LocalStorage utility functions for FinTrack Pro

const STORAGE_KEYS = {
  ENTRIES: 'fintrack_entries',
  INVOICES: 'fintrack_invoices',
  CLIENTS: 'fintrack_clients',
  ORGANIZATION_SETTINGS: 'fintrack_organization_settings',
};

// Expense/Credit Entry Functions
export const getEntries = () => {
  const entries = localStorage.getItem(STORAGE_KEYS.ENTRIES);
  return entries ? JSON.parse(entries) : [];
};

export const saveEntry = (entry) => {
  const entries = getEntries();
  const newEntry = {
    ...entry,
    id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
    timestamp: Date.now(),
  };
  entries.push(newEntry);
  localStorage.setItem(STORAGE_KEYS.ENTRIES, JSON.stringify(entries));
  return newEntry;
};

export const deleteEntry = (id) => {
  const entries = getEntries();
  const filtered = entries.filter(entry => entry.id !== id);
  localStorage.setItem(STORAGE_KEYS.ENTRIES, JSON.stringify(filtered));
};

export const updateEntry = (id, updatedEntry) => {
  const entries = getEntries();
  const index = entries.findIndex(entry => entry.id === id);
  if (index !== -1) {
    entries[index] = { ...entries[index], ...updatedEntry };
    localStorage.setItem(STORAGE_KEYS.ENTRIES, JSON.stringify(entries));
  }
};

// Invoice Functions
export const getInvoices = () => {
  const invoices = localStorage.getItem(STORAGE_KEYS.INVOICES);
  return invoices ? JSON.parse(invoices) : [];
};

export const saveInvoice = (invoice) => {
  const invoices = getInvoices();
  const invoiceNumber = `INV-${String(invoices.length + 1).padStart(5, '0')}`;
  const newInvoice = {
    ...invoice,
    id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
    invoiceNumber,
    timestamp: Date.now(),
  };
  invoices.push(newInvoice);
  localStorage.setItem(STORAGE_KEYS.INVOICES, JSON.stringify(invoices));
  return newInvoice;
};

export const deleteInvoice = (id) => {
  const invoices = getInvoices();
  const filtered = invoices.filter(invoice => invoice.id !== id);
  localStorage.setItem(STORAGE_KEYS.INVOICES, JSON.stringify(filtered));
};

// Client Functions
export const getClients = () => {
  const clients = localStorage.getItem(STORAGE_KEYS.CLIENTS);
  return clients ? JSON.parse(clients) : [];
};

export const saveClient = (clientName) => {
  const clients = getClients();
  if (!clients.includes(clientName)) {
    clients.push(clientName);
    localStorage.setItem(STORAGE_KEYS.CLIENTS, JSON.stringify(clients));
  }
  return clients;
};

export const deleteClient = (clientName) => {
  const clients = getClients();
  const filtered = clients.filter(client => client !== clientName);
  localStorage.setItem(STORAGE_KEYS.CLIENTS, JSON.stringify(filtered));
};

// Organization Settings Functions
export const getOrganizationSettings = () => {
  const settings = localStorage.getItem(STORAGE_KEYS.ORGANIZATION_SETTINGS);
  if (settings) {
    return JSON.parse(settings);
  }
  // Return default settings if none exist
  return {
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
  };
};

export const saveOrganizationSettings = (settings) => {
  localStorage.setItem(STORAGE_KEYS.ORGANIZATION_SETTINGS, JSON.stringify(settings));
  return settings;
};

// Batch Export/Import Functions for Backup
export const getAllData = () => {
  return {
    entries: getEntries(),
    invoices: getInvoices(),
    clients: getClients(),
    settings: getOrganizationSettings(),
  };
};

export const restoreAllData = (data) => {
  if (data.entries) {
    localStorage.setItem(STORAGE_KEYS.ENTRIES, JSON.stringify(data.entries));
  }
  if (data.invoices) {
    localStorage.setItem(STORAGE_KEYS.INVOICES, JSON.stringify(data.invoices));
  }
  if (data.clients) {
    localStorage.setItem(STORAGE_KEYS.CLIENTS, JSON.stringify(data.clients));
  }
  if (data.settings) {
    localStorage.setItem(STORAGE_KEYS.ORGANIZATION_SETTINGS, JSON.stringify(data.settings));
  }
};

export const clearAllData = () => {
  localStorage.removeItem(STORAGE_KEYS.ENTRIES);
  localStorage.removeItem(STORAGE_KEYS.INVOICES);
  localStorage.removeItem(STORAGE_KEYS.CLIENTS);
  localStorage.removeItem(STORAGE_KEYS.ORGANIZATION_SETTINGS);
};

