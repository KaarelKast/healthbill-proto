import { useState, useMemo } from "react";
import "./AddLineModal.css";
import { createColumnHelper } from "@tanstack/react-table";
import { Button, Spinner, TextField } from "@tehik-ee/tedi-react/tedi";
import { Table } from "@tehik-ee/tedi-react/community";
import { useTtlCodes } from "../../hooks/useTtlCodes";
import { useAddLine } from "../../hooks/useInvoice";
import type { TtlCode } from "../../types";

interface AddLineModalProps {
  invoiceId: string;
  visitDate: string;
  onClose: () => void;
}

interface CodeRow {
  code: string;
  nameEt: string;
  priceLimit: string;
  source: string;
  category: string;
  rowGroupKey: string;
  rowClassName?: string;
}

type CategoryKey = 'Pearahasisesed' | 'Uuringud' | 'Analüüsid' | 'Protseduurid';

const PROCEDURE_CODES = new Set(['7556', '7559', '7562', '7563']);
const CATEGORY_ORDER: CategoryKey[] = ['Pearahasisesed', 'Uuringud', 'Analüüsid', 'Protseduurid'];

function getTtlCategory(code: TtlCode): CategoryKey {
  const c = code.code;
  if (code.source === 'FREE') {
    return 'Pearahasisesed';
  }
  if (code.source === 'TIS' || code.source === 'PIS') {
    if (c.startsWith('66')) return 'Analüüsid';
    if (PROCEDURE_CODES.has(c)) return 'Protseduurid';
    if (code.source === 'PIS') return 'Protseduurid';
    return 'Uuringud';
  }
  return 'Pearahasisesed';
}

const columnHelper = createColumnHelper<CodeRow>();

const columns = [
  columnHelper.accessor('code', {
    header: 'Kood',
    size: 80,
  }),
  columnHelper.accessor('nameEt', {
    header: 'Nimetus',
    size: 400,
  }),
  columnHelper.accessor('priceLimit', {
    header: 'Hind',
    size: 80,
  }),
];

export function AddLineModal({ invoiceId, visitDate, onClose }: AddLineModalProps) {
  const { data: ttlCodes, isLoading: codesLoading } = useTtlCodes();
  const addLine = useAddLine(invoiceId);

  const [codeFilter, setCodeFilter] = useState('');
  const [nameFilter, setNameFilter] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('ALL');
  const [selectedCode, setSelectedCode] = useState<string | null>(null);
  const [serviceDate, setServiceDate] = useState(visitDate);
  const [error, setError] = useState<string | null>(null);

  const tableData: CodeRow[] = useMemo(() => {
    if (!ttlCodes) return [];

    let filtered = ttlCodes;

    if (categoryFilter !== 'ALL') {
      filtered = filtered.filter((c) => getTtlCategory(c) === categoryFilter);
    }
    if (codeFilter.trim()) {
      const q = codeFilter.trim().toLowerCase();
      filtered = filtered.filter((c) => c.code.toLowerCase().includes(q));
    }
    if (nameFilter.trim()) {
      const q = nameFilter.trim().toLowerCase();
      filtered = filtered.filter((c) => c.nameEt.toLowerCase().includes(q));
    }

    // Sort by category order, then by code
    const sorted = [...filtered].sort((a, b) => {
      const catA = CATEGORY_ORDER.indexOf(getTtlCategory(a));
      const catB = CATEGORY_ORDER.indexOf(getTtlCategory(b));
      if (catA !== catB) return catA - catB;
      return a.code.localeCompare(b.code);
    });

    return sorted.map((c) => {
      const category = getTtlCategory(c);
      return {
        code: c.code,
        nameEt: c.nameEt,
        priceLimit: c.isBillable ? `${Number(c.priceLimit).toFixed(2)} €` : '0 €',
        source: c.source ?? 'FREE',
        category,
        rowGroupKey: category,
        rowClassName: c.code === selectedCode ? 'tedi-table-row--selected' : undefined,
      };
    });
  }, [ttlCodes, codeFilter, nameFilter, categoryFilter, selectedCode]);

  function handleRowClick(row: CodeRow) {
    setSelectedCode(row.code === selectedCode ? null : row.code);
    setError(null);
  }

  function handleSubmit() {
    if (!selectedCode) {
      setError('Vali TTL kood');
      return;
    }
    setError(null);
    addLine.mutate(
      { ttlCode: selectedCode, serviceDate, quantity: 1 },
      {
        onSuccess: () => onClose(),
        onError: (err) => setError(err instanceof Error ? err.message : 'Viga lisamisel'),
      }
    );
  }

  const totalCount = tableData.length;

  return (
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
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div
        style={{
          background: 'white',
          borderRadius: '8px',
          padding: 'var(--spacing-lg, 24px)',
          minWidth: '700px',
          maxWidth: '900px',
          width: '90%',
          maxHeight: '85vh',
          display: 'flex',
          flexDirection: 'column',
          boxShadow: '0 4px 32px rgba(0,0,0,0.18)',
        }}
      >
        <h2 style={{ margin: '0 0 var(--spacing-md, 16px)', fontSize: '1.2rem' }}>Teenuste otsing</h2>

        {error && (
          <div
            style={{
              color: 'var(--color-error, #c62828)',
              background: 'var(--color-error-light, #ffebee)',
              padding: 'var(--spacing-sm, 8px) var(--spacing-md, 16px)',
              borderRadius: '4px',
              marginBottom: 'var(--spacing-sm, 8px)',
              fontSize: '0.875rem',
            }}
          >
            {error}
          </div>
        )}

        {/* Search filters */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: 'var(--spacing-sm, 8px) var(--spacing-md, 16px)',
            marginBottom: 'var(--spacing-md, 16px)',
          }}
        >
          <TextField
            id="code-filter"
            label="Kood"
            placeholder="nt. 3002"
            value={codeFilter}
            onChange={(v) => setCodeFilter(v)}
          />
          <TextField
            id="name-filter"
            label="Teenuse nimetus sisaldab"
            placeholder="nt. vastuvõtt"
            value={nameFilter}
            onChange={(v) => setNameFilter(v)}
          />
        </div>

        {/* Category radio filter */}
        <div style={{ display: 'flex', gap: 'var(--spacing-md, 16px)', marginBottom: 'var(--spacing-md, 16px)', fontSize: '0.875rem', flexWrap: 'wrap' }}>
          <strong>Näita:</strong>
          {[
            { value: 'ALL', label: 'Kõik' },
            { value: 'Pearahasisesed', label: 'Pearahasisesed' },
            { value: 'Uuringud', label: 'Uuringud' },
            { value: 'Analüüsid', label: 'Analüüsid' },
            { value: 'Protseduurid', label: 'Protseduurid' },
          ].map((opt) => (
            <label key={opt.value} style={{ display: 'flex', alignItems: 'center', gap: '4px', cursor: 'pointer' }}>
              <input
                type="radio"
                name="category-filter"
                checked={categoryFilter === opt.value}
                onChange={() => setCategoryFilter(opt.value)}
              />
              {opt.label}
            </label>
          ))}
        </div>

        {/* Service date */}
        <div style={{ marginBottom: 'var(--spacing-md, 16px)', maxWidth: '220px' }}>
          <label style={{ display: 'block', marginBottom: '4px', fontWeight: 600, fontSize: '0.875rem' }}>
            Teenuse kuupäev
          </label>
          <input
            type="date"
            value={serviceDate}
            onChange={(e) => setServiceDate(e.target.value)}
            style={{
              width: '100%',
              padding: 'var(--spacing-sm, 8px)',
              border: '1px solid var(--color-border, #e0e0e0)',
              borderRadius: '4px',
              fontSize: '0.875rem',
              boxSizing: 'border-box',
            }}
          />
        </div>

        {/* Table */}
        <div style={{ flex: 1, overflow: 'auto', minHeight: 0, marginBottom: 'var(--spacing-md, 16px)' }}>
          {codesLoading ? (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '32px', gap: '8px' }}>
              <Spinner label="Laadin koode..." />
              <span>Laadin koode...</span>
            </div>
          ) : (
            <Table<CodeRow>
              id="ttl-code-picker"
              data={tableData}
              columns={columns}
              hidePagination
              size="small"
              groupRowsBy="rowGroupKey"
              onRowClick={handleRowClick}
              isLoading={codesLoading}
              placeholder={{ children: 'Koode ei leitud. Muuda otsingukriteeriume.' }}
            />
          )}
        </div>

        {/* Footer */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span style={{ fontSize: '0.85rem', color: 'var(--color-text-secondary, #666)' }}>
            Ridu: {totalCount}
            {selectedCode && <> | Valitud: <strong>{selectedCode}</strong></>}
          </span>
          <div style={{ display: 'flex', gap: 'var(--spacing-sm, 8px)' }}>
            <Button visualType="neutral" onClick={onClose} disabled={addLine.isPending}>
              Tühista
            </Button>
            <Button visualType="primary" onClick={handleSubmit} disabled={addLine.isPending || !selectedCode}>
              {addLine.isPending ? <Spinner label="Lisan..." /> : 'OK'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
