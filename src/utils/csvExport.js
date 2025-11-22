// CSV Export utility using PapaParse
import Papa from 'papaparse';

export const exportLedgerToCSV = (entries) => {
  // Sort entries by date
  const sortedEntries = [...entries].sort((a, b) => 
    new Date(a.date) - new Date(b.date)
  );

  // Calculate running balance
  let balance = 0;
  const dataWithBalance = sortedEntries.map(entry => {
    if (entry.type === 'credit') {
      balance += parseFloat(entry.amount);
    } else {
      balance -= parseFloat(entry.amount);
    }

    return {
      Date: entry.date,
      Description: entry.description,
      Category: entry.category || '',
      Type: entry.type.charAt(0).toUpperCase() + entry.type.slice(1),
      Amount: parseFloat(entry.amount).toFixed(2),
      Balance: balance.toFixed(2),
    };
  });

  // Convert to CSV
  const csv = Papa.unparse(dataWithBalance);

  // Create blob and download
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  
  const timestamp = new Date().toISOString().split('T')[0];
  link.setAttribute('href', url);
  link.setAttribute('download', `ledger_${timestamp}.csv`);
  link.style.visibility = 'hidden';
  
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

