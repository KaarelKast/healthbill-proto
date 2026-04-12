import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import AppShell from "./components/layout/AppShell";
import CaseDetail from "./pages/CaseDetail";
import InvoiceReview from "./pages/InvoiceReview";
import InvoiceList from "./pages/InvoiceList";
import PartnerInvoices from "./pages/PartnerInvoices";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<AppShell />}>
          <Route index element={<Navigate to="/invoices" replace />} />
          <Route path="cases/:id" element={<CaseDetail />} />
          <Route path="invoices" element={<InvoiceList />} />
          <Route path="invoices/:id" element={<InvoiceReview />} />
          <Route path="partner-invoices" element={<PartnerInvoices />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
