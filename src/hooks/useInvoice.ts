import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "../api/client";
import type { InvoiceListParams, AddLineBody } from "../types";

// Single invoice with lines + audit events
export function useInvoice(id: string) {
  return useQuery({
    queryKey: ["invoice", id],
    queryFn: () => api.getInvoice(id),
    enabled: !!id,
  });
}

// List invoices with filters
export function useInvoices(params?: InvoiceListParams) {
  return useQuery({
    queryKey: ["invoices", params],
    queryFn: () => api.getInvoices(params),
  });
}

// Confirm invoice
export function useConfirmInvoice() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.confirmInvoice(id),
    onSuccess: (data) => {
      qc.setQueryData(["invoice", data.id], data);
      qc.invalidateQueries({ queryKey: ["invoices"] });
      qc.invalidateQueries({ queryKey: ["stats"] });
    },
  });
}

// Send invoice to Tervisekassa
export function useSendInvoice() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.sendInvoice(id),
    onSuccess: (data) => {
      qc.setQueryData(["invoice", data.id], data);
      qc.invalidateQueries({ queryKey: ["invoices"] });
      qc.invalidateQueries({ queryKey: ["stats"] });
    },
  });
}

// Add a line to an invoice
export function useAddLine(invoiceId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: AddLineBody) => api.addLine(invoiceId, body),
    onSuccess: (data) => {
      qc.setQueryData(["invoice", data.id], data);
    },
  });
}

// Remove a line from an invoice
export function useRemoveLine(invoiceId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (lineId: string) => api.removeLine(invoiceId, lineId),
    onSuccess: (data) => {
      qc.setQueryData(["invoice", data.id], data);
    },
  });
}
