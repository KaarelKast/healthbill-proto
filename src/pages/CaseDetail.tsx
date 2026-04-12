import { useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { Alert, StatusBadge } from "@tehik-ee/tedi-react/tedi";
import { useHaiguslugu, useProcessSaatekiri } from "../hooks/useHaiguslood";
import { SaatekirjaRow } from "../components/case/SaatekirjaRow";
import { InvoiceStatusBadge } from "../components/invoice/InvoiceStatusBadge";
import { LoadingSpinner } from "../components/shared/LoadingSpinner";
import PageHeader from "../components/layout/PageHeader";

function formatDate(dateStr?: string): string {
  if (!dateStr) return '—';
  const d = new Date(dateStr);
  const day = String(d.getDate()).padStart(2, '0');
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const year = d.getFullYear();
  return `${day}.${month}.${year}`;
}

function maskPatientCode(code: string): string {
  if (code.length <= 6) return code;
  return code.slice(0, 6) + 'XXXXX';
}

export default function CaseDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: haiguslugu, isLoading, error } = useHaiguslugu(id!);
  const processMutation = useProcessSaatekiri();
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [processError, setProcessError] = useState<string | null>(null);

  if (isLoading) return <LoadingSpinner />;
  if (error || !haiguslugu) {
    return <Alert type="danger">Andmete laadimine ebaõnnestus. Palun värskenda lehte.</Alert>;
  }

  function handleProcess(saatekirjaId: string) {
    setProcessingId(saatekirjaId);
    setProcessError(null);
    processMutation.mutate(saatekirjaId, {
      onSuccess: (invoice) => {
        navigate(`/invoices/${invoice.id}`);
      },
      onError: (err) => {
        setProcessingId(null);
        setProcessError(err instanceof Error ? err.message : 'Töötlemine ebaõnnestus');
      },
    });
  }

  return (
    <div>
      <PageHeader
        breadcrumb={[{ label: 'Arved', to: '/invoices' }]}
        title={`${haiguslugu.haigusjuhtumiNr} — ${haiguslugu.patientName}`}
        subtitle={undefined}
        action={
          <StatusBadge color={haiguslugu.status === 'OPEN' ? 'success' : 'neutral'}>
            {haiguslugu.status === 'OPEN' ? 'Avatud' : 'Suletud'}
          </StatusBadge>
        }
      />

      {/* Patient info */}
      <div
        style={{
          display: 'flex',
          gap: 'var(--spacing-xl, 32px)',
          marginBottom: 'var(--spacing-lg, 24px)',
          padding: 'var(--spacing-md, 16px)',
          background: 'white',
          borderRadius: '8px',
          border: '1px solid var(--color-border, #e0e0e0)',
        }}
      >
        <div>
          <span style={{ fontSize: '0.8rem', color: 'var(--color-text-secondary, #666)' }}>Sünnikuupäev</span>
          <div style={{ fontWeight: 600 }}>{formatDate(haiguslugu.patientDob)}</div>
        </div>
        <div>
          <span style={{ fontSize: '0.8rem', color: 'var(--color-text-secondary, #666)' }}>Isikukood</span>
          <div style={{ fontWeight: 600, fontFamily: 'monospace' }}>
            {maskPatientCode(haiguslugu.patientCode)}
          </div>
        </div>
      </div>

      {/* Process error */}
      {processError && (
        <Alert type="danger" style={{ marginBottom: 'var(--spacing-md, 16px)' }}>
          Töötlemine ebaõnnestus: {processError}
        </Alert>
      )}

      {/* Saatekirjad */}
      <section style={{ marginBottom: 'var(--spacing-xl, 32px)' }}>
        <h2 style={{ fontSize: '1.1rem', marginBottom: 'var(--spacing-md, 16px)', borderBottom: '1px solid var(--color-border, #e0e0e0)', paddingBottom: '8px' }}>
          Saatekirjad
        </h2>
        {haiguslugu.saatekirjad && haiguslugu.saatekirjad.length > 0 ? (
          haiguslugu.saatekirjad.map((sk) => (
            <SaatekirjaRow
              key={sk.id}
              saatekiri={sk}
              onProcess={handleProcess}
              isProcessing={processingId === sk.id && processMutation.isPending}
            />
          ))
        ) : (
          <p style={{ color: 'var(--color-text-secondary, #666)', fontSize: '0.875rem' }}>
            Saatekirju pole.
          </p>
        )}
      </section>

      {/* Invoices */}
      <section>
        <h2 style={{ fontSize: '1.1rem', marginBottom: 'var(--spacing-md, 16px)', borderBottom: '1px solid var(--color-border, #e0e0e0)', paddingBottom: '8px' }}>
          Arved
        </h2>
        {haiguslugu.invoices && haiguslugu.invoices.length > 0 ? (
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '2px solid var(--color-border, #e0e0e0)', textAlign: 'left' }}>
                <th style={{ padding: '8px', fontSize: '0.875rem', color: 'var(--color-text-secondary, #666)', fontWeight: 600 }}>Kuupäev</th>
                <th style={{ padding: '8px', fontSize: '0.875rem', color: 'var(--color-text-secondary, #666)', fontWeight: 600 }}>Olek</th>
                <th style={{ padding: '8px', fontSize: '0.875rem', color: 'var(--color-text-secondary, #666)', fontWeight: 600 }}>Toimingud</th>
              </tr>
            </thead>
            <tbody>
              {haiguslugu.invoices.map((inv) => (
                <tr key={inv.id} style={{ borderBottom: '1px solid var(--color-border, #e0e0e0)' }}>
                  <td style={{ padding: '8px', fontSize: '0.875rem' }}>{formatDate(inv.visitDate)}</td>
                  <td style={{ padding: '8px' }}>
                    <InvoiceStatusBadge status={inv.status} />
                  </td>
                  <td style={{ padding: '8px' }}>
                    <Link
                      to={`/invoices/${inv.id}`}
                      style={{ color: 'var(--color-primary, #0066cc)', textDecoration: 'none', fontSize: '0.875rem' }}
                    >
                      Vaata arvet →
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <Alert type="info">Ühtegi arvet pole veel loodud.</Alert>
        )}
      </section>
    </div>
  );
}
