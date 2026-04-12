import { useState } from "react";
import { useParams, useNavigate, Navigate } from "react-router-dom";
import { Alert, Button, Spinner } from "@tehik-ee/tedi-react/tedi";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useInvoice, useConfirmInvoice, useSendInvoice, useRemoveLine } from "../hooks/useInvoice";
import { InvoiceLineTable } from "../components/invoice/InvoiceLineTable";
import { InvoiceSummaryBar } from "../components/invoice/InvoiceSummaryBar";
import { InvoiceStatusBadge } from "../components/invoice/InvoiceStatusBadge";
import { AiWarningPanel } from "../components/invoice/AiWarningPanel";
import { AuditTrail } from "../components/invoice/AuditTrail";
import { AddLineModal } from "../components/invoice/AddLineModal";
import { ConfidenceBadge } from "../components/invoice/ConfidenceBadge";
import { LoadingSpinner } from "../components/shared/LoadingSpinner";
import { PdfPreviewLink } from "../components/shared/PdfPreviewLink";
import PageHeader from "../components/layout/PageHeader";
import { api } from "../api/client";

export default function InvoiceReview() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: invoice, isLoading } = useInvoice(id ?? '');
  const confirmMutation = useConfirmInvoice();
  const sendMutation = useSendInvoice();
  const removeLine = useRemoveLine(id ?? '');
  const queryClient = useQueryClient();
  const [showAddModal, setShowAddModal] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [confirmAndSend, setConfirmAndSend] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const [mutationError, setMutationError] = useState<string | null>(null);

  const reprocessMutation = useMutation({
    mutationFn: () => api.reprocessSaatekiri(invoice?.saatekirjaId ?? ''),
    onSuccess: (newInvoice) => {
      queryClient.invalidateQueries({ queryKey: ['invoice'] });
      navigate(`/invoices/${newInvoice.id}`);
      showToast('AI töötlemine õnnestus');
    },
    onError: (err) => {
      setMutationError(err instanceof Error ? err.message : 'Uuesti töötlemine ebaõnnestus');
    },
  });

  if (!id) return <Navigate to="/invoices" replace />;
  if (isLoading) return <LoadingSpinner />;
  if (!invoice) {
    return <Alert type="danger">Arvet ei leitud.</Alert>;
  }

  const isEditable = invoice.status === 'PENDING_REVIEW';
  const aiFailed = invoice.aiProcessingFailed === true;

  function showToast(msg: string) {
    setToast(msg);
    setTimeout(() => setToast(null), 4000);
  }

  function handleConfirm() {
    setMutationError(null);
    confirmMutation.mutate(invoice!.id, {
      onSuccess: (confirmed) => {
        setShowConfirmModal(false);
        if (confirmAndSend) {
          sendMutation.mutate(confirmed.id, {
            onSuccess: () => {
              showToast('Arve kinnitatud ja saadetud Tervisekassale ✓');
            },
            onError: (err) => {
              setMutationError(err instanceof Error ? err.message : 'Saatmine ebaõnnestus');
            },
          });
        } else {
          showToast('Arve kinnitatud ✓');
        }
      },
      onError: (err) => {
        setMutationError(err instanceof Error ? err.message : 'Midagi läks valesti');
      },
    });
  }

  function handleSend() {
    setMutationError(null);
    sendMutation.mutate(invoice!.id, {
      onSuccess: () => {
        showToast('Arve saadetud Tervisekassale ✓');
      },
      onError: (err) => {
        setMutationError(err instanceof Error ? err.message : 'Midagi läks valesti');
      },
    });
  }

  function handleOpenConfirmAndSend() {
    setConfirmAndSend(true);
    setShowConfirmModal(true);
  }

  function handleOpenConfirmOnly() {
    setConfirmAndSend(false);
    setShowConfirmModal(true);
  }

  function handleRemoveLine(lineId: string) {
    removeLine.mutate(lineId, {
      onError: (err) => {
        setMutationError(err instanceof Error ? err.message : 'Rea eemaldamine ebaõnnestus');
      },
    });
  }

  return (
    <div>
      {/* Toast */}
      {toast && (
        <div
          style={{
            position: 'fixed',
            top: 'var(--spacing-lg, 24px)',
            right: 'var(--spacing-lg, 24px)',
            background: 'var(--color-success, #2e7d32)',
            color: 'white',
            padding: 'var(--spacing-sm, 8px) var(--spacing-lg, 24px)',
            borderRadius: '8px',
            zIndex: 2000,
            fontWeight: 600,
            boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
          }}
        >
          {toast}
        </div>
      )}

      <PageHeader
        breadcrumb={[{ label: 'Arved', to: '/invoices' }]}
        title={`Arve #${invoice.haigusjuhtumiNr} — ${invoice.patientName}`}
        action={
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-sm, 8px)' }}>
            <InvoiceStatusBadge status={invoice.status} />
            <Button
              visualType="neutral"
              size="small"
              onClick={() => window.open(api.getInvoicePdfUrl(invoice.id), '_blank')}
            >
              Vaata PDF ↗
            </Button>
            <Button visualType="neutral" size="small" onClick={() => navigate('/invoices')}>
              ← Tagasi
            </Button>
          </div>
        }
      />

      {/* Mutation error */}
      {mutationError && (
        <Alert type="danger" style={{ marginBottom: 'var(--spacing-md, 16px)' }}>
          Midagi läks valesti: {mutationError}
        </Alert>
      )}

      {/* Confirmed banner */}
      {(invoice.status === 'SENT' || invoice.status === 'CONFIRMED') && (
        <Alert type="info" style={{ marginBottom: 'var(--spacing-md, 16px)' }}>
          <strong>Arve on kinnitatud ja saadetud Tervisekassale ✓</strong>
          {' '}
          <PdfPreviewLink href={api.getInvoicePdfUrl(invoice.id)} label="Ekspordi PDF ↗" />
        </Alert>
      )}

      {/* REJECTED banner */}
      {invoice.status === 'REJECTED' && (
        <Alert type="danger" style={{ marginBottom: 'var(--spacing-md, 16px)' }}>
          Arve on tagasi lükatud.
        </Alert>
      )}

      {/* Pending referrals banner */}
      {invoice.openSaatekirjadCount != null && invoice.openSaatekirjadCount > 0 && (
        <Alert type="warning" style={{ marginBottom: 'var(--spacing-md, 16px)' }}>
          <strong>Ootame veel {invoice.openSaatekirjadCount} saatekirja vastust{invoice.openSaatekirjadCount > 1 ? 'eid' : ''}.</strong>
          {' '}Tulevased vastused lisatakse uue arvena.
        </Alert>
      )}

      {/* AI Summary */}
      {invoice.aiSummary && (
        <Alert type="info" style={{ marginBottom: 'var(--spacing-md, 16px)' }}>
          <div>{invoice.aiSummary}</div>
          <div style={{ marginTop: '8px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '0.875rem' }}>Automatiseeritavus:</span>
            <ConfidenceBadge confidence={invoice.automatability} />
          </div>
        </Alert>
      )}

      {/* AI Warnings */}
      <AiWarningPanel
        missingData={invoice.aiMissingData}
        warnings={invoice.aiWarnings}
      />

      {/* Reprocess button when AI failed */}
      {aiFailed && (
        <div style={{ marginBottom: 'var(--spacing-md, 16px)' }}>
          <Button
            visualType="primary"
            onClick={() => reprocessMutation.mutate()}
            disabled={reprocessMutation.isPending}
          >
            {reprocessMutation.isPending ? <Spinner label="Töötlen..." /> : 'Töötle uuesti'}
          </Button>
        </div>
      )}

      {/* Lines section */}
      <div style={{ marginBottom: 'var(--spacing-md, 16px)' }}>
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: 'var(--spacing-sm, 8px)',
            paddingBottom: '8px',
            borderBottom: '1px solid var(--color-border, #e0e0e0)',
          }}
        >
          <h2 style={{ margin: 0, fontSize: '1.1rem' }}>Arve read</h2>
          {isEditable && (
            <Button visualType="neutral" size="small" onClick={() => setShowAddModal(true)}>
              Lisa kood
            </Button>
          )}
        </div>

        <InvoiceLineTable
          lines={invoice.lines}
          isEditable={isEditable}
          onRemove={handleRemoveLine}
        />
      </div>

      {/* Audit trail */}
      <AuditTrail events={invoice.auditEvents} />

      {/* Add line modal */}
      {showAddModal && (
        <AddLineModal
          invoiceId={invoice.id}
          visitDate={invoice.visitDate}
          onClose={() => setShowAddModal(false)}
        />
      )}

      {/* Confirm modal */}
      {showConfirmModal && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
          }}
        >
          <div
            style={{
              background: 'white',
              borderRadius: '8px',
              padding: 'var(--spacing-lg, 24px)',
              maxWidth: '400px',
              width: '90%',
              boxShadow: '0 4px 32px rgba(0,0,0,0.18)',
            }}
          >
            <h2 style={{ margin: '0 0 var(--spacing-md, 16px)' }}>
              Kinnita ja saada
            </h2>
            <p style={{ color: 'var(--color-text-secondary, #555)' }}>
              Arve kinnitatakse ja saadetakse kohe Tervisekassale.
            </p>
            {mutationError && (
              <Alert type="danger" style={{ marginBottom: 'var(--spacing-sm, 8px)' }}>
                {mutationError}
              </Alert>
            )}
            <div style={{ display: 'flex', gap: 'var(--spacing-sm, 8px)', justifyContent: 'flex-end' }}>
              <Button
                visualType="neutral"
                onClick={() => setShowConfirmModal(false)}
                disabled={confirmMutation.isPending}
              >
                Tühista
              </Button>
              <Button
                visualType="primary"
                onClick={handleConfirm}
                disabled={confirmMutation.isPending || sendMutation.isPending}
              >
                {confirmMutation.isPending || sendMutation.isPending
                  ? 'Kinnitamine...'
                  : 'Kinnita ja saada'}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Sticky summary bar */}
      <InvoiceSummaryBar
        invoice={invoice}
        onConfirm={handleOpenConfirmOnly}
        onConfirmAndSend={handleOpenConfirmAndSend}
        onSend={handleSend}
        isConfirming={confirmMutation.isPending}
        isSending={sendMutation.isPending}
      />
    </div>
  );
}
