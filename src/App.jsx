import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import AddExpense from './components/AddExpense';
import Ledger from './components/Ledger';
import CreateInvoice from './components/CreateInvoice';
import InvoiceHistory from './components/InvoiceHistory';
import Settings from './components/Settings';
import './App.css';

function App() {
  return (
    <Router>
      <div className="app">
        <Sidebar />
        <div className="main-content">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/add-expense" element={<AddExpense />} />
            <Route path="/ledger" element={<Ledger />} />
            <Route path="/create-invoice" element={<CreateInvoice />} />
            <Route path="/invoice-history" element={<InvoiceHistory />} />
            <Route path="/settings" element={<Settings />} />
          </Routes>
        </div>
      </div>
    </Router>
  );
}

export default App;
