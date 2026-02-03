import { Routes, Route } from 'react-router-dom';
import InvoiceList from './InvoiceList';
import CreateInvoice from './CreateInvoice';

const Invoices = () => {
    return (
        <Routes>
            <Route path="/" element={<InvoiceList />} />
            <Route path="/create" element={<CreateInvoice />} />
            <Route path="/edit/:id" element={<CreateInvoice />} />
        </Routes>
    );
};

export default Invoices;
