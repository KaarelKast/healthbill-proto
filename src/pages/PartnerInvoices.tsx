import { useState, useMemo } from "react";
import { StatusBadge } from "@tehik-ee/tedi-react/tedi";
import { useQuery } from "@tanstack/react-query";
import { api } from "../api/client";
import { LoadingSpinner } from "../components/shared/LoadingSpinner";
import PageHeader from "../components/layout/PageHeader";
import type { ParsedPartnerLine, LisaEntry } from "../types";

import partnerParsedData from '../data/partner-invoice-parsed.json';
import rawInvoices from '../data/invoices.json';

const PARTNERS = ['Synlab', 'Tartu Ülikooli Kliinikum', 'Confido'];

export default function PartnerInvoices() {
  const [selectedPartner, setSelectedPartner] = useState<string>(PARTNERS[0]);
  const [dateFrom, setDateFrom] = useState<string>('');
  const [dateTo, setDateTo] = useState<string>('');
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());

  // Fetch our system's data for this partner + date range
  const { data: ourLines, isLoading: ourLinesLoading } = useQuery({
    queryKey: ['lines-by-partner', selectedPartner, dateFrom, dateTo],
    queryFn: () => api.getLinesByPartner({
      partner: selectedPartner,
      dateFrom: dateFrom || undefined,
      dateTo: dateTo || undefined,
    }),
  });

  // Load partner data directly from mock JSON (no upload needed)
  const partnerData = (partnerParsedData as any)[selectedPartner];
  const parsedPartnerLines: ParsedPartnerLine[] = partnerData?.lines ?? [];
  const parsedLisaEntries: LisaEntry[] = partnerData?.lisa ?? [];

  function toggleRow(code: string) {
    setExpandedRows((prev) => {
      const next = new Set(prev);
      if (next.has(code)) next.delete(code); else next.add(code);
      return next;
    });
  }

  // Build comparison data
  const comparisonRows = useMemo(() => {
    if (parsedPartnerLines.length === 0 && (!ourLines || ourLines.length === 0)) return [];

    // Group partner lines by code
    const partnerByCode = new Map<string, { description: string; quantity: number }>();
    for (const line of parsedPartnerLines) {
      const existing = partnerByCode.get(line.code);
      if (existing) {
        existing.quantity += line.quantity;
      } else {
        partnerByCode.set(line.code, { description: line.description, quantity: line.quantity });
      }
    }

    // Build our codes map
    const ourByCode = new Map<string, number>();
    if (ourLines) {
      for (const group of ourLines) {
        ourByCode.set(group.ttlCode, group._sum.quantity ?? 0);
      }
    }

    // Merge
    const allCodes = new Set([...partnerByCode.keys(), ...ourByCode.keys()]);
    const rows: Array<{
      code: string;
      description: string;
      partnerQty: number;
      ourQty: number;
      status: 'match' | 'mismatch' | 'missing_from_us' | 'missing_from_partner';
    }> = [];

    for (const code of allCodes) {
      const partner = partnerByCode.get(code);
      const ourQty = ourByCode.get(code) ?? 0;
      const partnerQty = partner?.quantity ?? 0;

      let status: typeof rows[0]['status'];
      if (partnerQty === ourQty) status = 'match';
      else if (partnerQty > 0 && ourQty === 0) status = 'missing_from_us';
      else if (partnerQty === 0 && ourQty > 0) status = 'missing_from_partner';
      else status = 'mismatch';

      rows.push({
        code,
        description: partner?.description ?? '—',
        partnerQty,
        ourQty,
        status,
      });
    }

    return rows.sort((a, b) => a.code.localeCompare(b.code));
  }, [parsedPartnerLines, ourLines]);

  // Lisa entries grouped by ttlCode
  const lisaByCode = useMemo(() => {
    if (parsedLisaEntries.length === 0) return new Map<string, LisaEntry[]>();
    const map = new Map<string, LisaEntry[]>();
    for (const entry of parsedLisaEntries) {
      const list = map.get(entry.ttlCode) ?? [];
      list.push(entry);
      map.set(entry.ttlCode, list);
    }
    return map;
  }, [parsedLisaEntries]);

  return (
    <div>
      <PageHeader
        title="Partnerarvete võrdlus"
        subtitle="Võrdle partneri arvet süsteemis registreeritud teenustega"
      />

      {/* Filters row */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-md, 16px)', marginBottom: 'var(--spacing-lg, 24px)', flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <label style={{ fontSize: '0.875rem', fontWeight: 600 }}>Partner:</label>
          <select
            value={selectedPartner}
            onChange={(e) => setSelectedPartner(e.target.value)}
            style={selectStyle}
          >
            {PARTNERS.map((p) => <option key={p} value={p}>{p}</option>)}
          </select>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginLeft: 'auto' }}>
          <label style={{ fontSize: '0.875rem', fontWeight: 600 }}>Alates:</label>
          <input type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} style={dateInputStyle} />
          <label style={{ fontSize: '0.875rem', fontWeight: 600 }}>Kuni:</label>
          <input type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)} style={dateInputStyle} />
        </div>
      </div>

      {/* Two-column layout */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--spacing-lg, 24px)', marginBottom: 'var(--spacing-lg, 24px)' }}>
        {/* Left: Partner files (shown as already uploaded) */}
        <div style={cardStyle}>
          <h3 style={cardTitleStyle}>Partneri arve</h3>

          <div style={{ border: '2px dashed var(--color-border, #ccc)', borderRadius: '8px', padding: 'var(--spacing-md, 16px)', textAlign: 'center', marginBottom: 'var(--spacing-sm, 8px)' }}>
            <div style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--color-success, #2e7d32)' }}>
              {selectedPartner}_arve_03-2026.pdf
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--color-text-secondary, #999)', marginTop: '4px' }}>PDF fail laetud</div>
          </div>

          <div style={{ border: '2px dashed var(--color-border, #ccc)', borderRadius: '8px', padding: 'var(--spacing-md, 16px)', textAlign: 'center' }}>
            <div style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--color-success, #2e7d32)' }}>
              {selectedPartner}_arve_lisa_03-2026.pdf
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--color-text-secondary, #999)', marginTop: '4px' }}>PDF fail laetud</div>
          </div>
        </div>

        {/* Right: Our system data */}
        <div style={cardStyle}>
          <h3 style={cardTitleStyle}>Süsteemis registreeritud</h3>

          {ourLinesLoading ? (
            <LoadingSpinner label="Laadin andmeid..." />
          ) : !ourLines || ourLines.length === 0 ? (
            <p style={{ color: 'var(--color-text-secondary, #666)', fontSize: '0.875rem' }}>
              Sellel perioodil pole selle partneri teenuseid arvele jõudnud.
            </p>
          ) : (
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--color-border, #e0e0e0)' }}>
                  <th style={ourThStyle}>Teenus</th>
                  <th style={{ ...ourThStyle, textAlign: 'right' }}>Kogus</th>
                </tr>
              </thead>
              <tbody>
                {ourLines.map((group) => (
                  <tr key={group.ttlCode} style={{ borderBottom: '1px solid var(--color-border, #f0f0f0)' }}>
                    <td style={{ padding: '6px 8px', fontSize: '0.85rem' }}>
                      <span style={{ fontFamily: 'monospace', fontWeight: 600, marginRight: '8px' }}>{group.ttlCode}</span>
                      {group.ttlName}
                    </td>
                    <td style={{ padding: '6px 8px', fontSize: '0.85rem', textAlign: 'right', fontWeight: 600 }}>
                      {group._sum.quantity}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Comparison table */}
      {comparisonRows.length > 0 && (
        <div style={{ ...cardStyle, padding: 'var(--spacing-lg, 24px)' }}>
          <h3 style={{ ...cardTitleStyle, marginBottom: 'var(--spacing-md, 16px)' }}>Võrdlustabel</h3>

          {comparisonRows.length === 0 ? (
            <p style={{ color: 'var(--color-text-secondary, #666)', fontSize: '0.875rem' }}>
              Partneri arvest ei õnnestunud teenuseid tuvastada.
            </p>
          ) : (
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: '2px solid var(--color-border, #e0e0e0)', textAlign: 'left' }}>
                  <th style={compThStyle}></th>
                  <th style={compThStyle}>Teenuskood</th>
                  <th style={{ ...compThStyle, textAlign: 'right' }}>Partneri kogus</th>
                  <th style={{ ...compThStyle, textAlign: 'right' }}>Arvele jõudnud</th>
                  <th style={{ ...compThStyle, textAlign: 'center' }}>Olek</th>
                </tr>
              </thead>
              <tbody>
                {comparisonRows.map((row) => {
                  const isExpanded = expandedRows.has(row.code);
                  const lisaEntries = lisaByCode.get(row.code) ?? [];

                  // Build a set of personalCodes present in the lisa (partner side)
                  const lisaPersonCodes = new Set(lisaEntries.map((e) => e.personalCode));

                  // Get our system's line instances for this code + partner from invoice data
                  const ourInstances: Array<{ personalCode: string; haigusjuhtumiNr: string; serviceDate: string }> = [];
                  for (const inv of rawInvoices as any[]) {
                    for (const line of inv.lines) {
                      if (line.ttlCode === row.code && line.partnerName === selectedPartner) {
                        for (let q = 0; q < line.quantity; q++) {
                          ourInstances.push({
                            personalCode: inv.patientCode,
                            haigusjuhtumiNr: inv.haigusjuhtumiNr,
                            serviceDate: line.serviceDate,
                          });
                        }
                      }
                    }
                  }

                  // Build a count of how many times each personalCode appears in our system
                  const ourByPerson = new Map<string, number>();
                  for (const inst of ourInstances) {
                    ourByPerson.set(inst.personalCode, (ourByPerson.get(inst.personalCode) ?? 0) + 1);
                  }

                  // Enrich lisa entries: match them against our instances
                  const matchedPersonCounts = new Map<string, number>();
                  const enrichedEntries: LisaEntry[] = lisaEntries.map((entry) => {
                    const matched = matchedPersonCounts.get(entry.personalCode) ?? 0;
                    const ourCount = ourByPerson.get(entry.personalCode) ?? 0;
                    const isMatched = matched < ourCount;
                    matchedPersonCounts.set(entry.personalCode, matched + 1);

                    // Find haiguslugu for this person
                    const ourInst = ourInstances.find((i) => i.personalCode === entry.personalCode);

                    return {
                      ...entry,
                      haigusjuhtumiNr: ourInst?.haigusjuhtumiNr,
                      status: isMatched ? 'match' as const : 'not_invoiced' as const,
                    };
                  });

                  // Add entries from our system that are NOT in the lisa (missing from partner)
                  for (const inst of ourInstances) {
                    if (!lisaPersonCodes.has(inst.personalCode)) {
                      enrichedEntries.push({
                        personalCode: inst.personalCode,
                        saatekirjaNumber: '—',
                        ttlCode: row.code,
                        serviceDate: new Date(inst.serviceDate).toLocaleDateString('et-EE'),
                        haigusjuhtumiNr: inst.haigusjuhtumiNr,
                        status: 'missing_from_partner',
                      });
                    }
                  }

                  return (
                    <ComparisonRow
                      key={row.code}
                      row={row}
                      isExpanded={isExpanded}
                      onToggle={() => toggleRow(row.code)}
                      lisaEntries={enrichedEntries}
                      hasLisa={parsedLisaEntries.length > 0}
                    />
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      )}
    </div>
  );
}

// ── Sub-components ──

interface ComparisonRowProps {
  row: { code: string; description: string; partnerQty: number; ourQty: number; status: string };
  isExpanded: boolean;
  onToggle: () => void;
  lisaEntries: LisaEntry[];
  hasLisa: boolean;
}

function ComparisonRow({ row, isExpanded, onToggle, lisaEntries, hasLisa }: ComparisonRowProps) {
  const statusColor = row.status === 'match' ? 'success' : 'danger';
  const statusLabel = row.status === 'match' ? 'Kattub'
    : row.status === 'mismatch' ? 'Erinevus'
    : row.status === 'missing_from_us' ? 'Puudub arvelt'
    : 'Puudub partneril';

  return (
    <>
      <tr
        style={{
          borderBottom: '1px solid var(--color-border, #e0e0e0)',
          cursor: hasLisa ? 'pointer' : 'default',
          background: isExpanded ? 'var(--color-primary-light, #f0f6ff)' : 'white',
        }}
        onClick={hasLisa ? onToggle : undefined}
      >
        <td style={{ padding: '8px 10px', fontSize: '0.85rem', width: '30px' }}>
          {hasLisa && (isExpanded ? '▼' : '▶')}
        </td>
        <td style={{ padding: '8px 10px', fontSize: '0.875rem' }}>
          <span style={{ fontFamily: 'monospace', fontWeight: 600 }}>{row.code}</span>
        </td>
        <td style={{ padding: '8px 10px', fontSize: '0.875rem', textAlign: 'right' }}>{row.partnerQty}</td>
        <td style={{ padding: '8px 10px', fontSize: '0.875rem', textAlign: 'right', fontWeight: 600 }}>{row.ourQty}</td>
        <td style={{ padding: '8px 10px', textAlign: 'center' }}>
          <StatusBadge color={statusColor}>{statusLabel}</StatusBadge>
        </td>
      </tr>
      {isExpanded && lisaEntries.length > 0 && (
        <tr>
          <td colSpan={5} style={{ padding: '0 10px 12px 40px', background: 'var(--color-bg-subtle, #fafafa)' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '4px' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--color-border, #e0e0e0)' }}>
                  <th style={subThStyle}>Isikukood</th>
                  <th style={subThStyle}>Saatekiri nr</th>
                  <th style={subThStyle}>Haiguslugu</th>
                  <th style={subThStyle}>Kuupäev</th>
                  <th style={{ ...subThStyle, textAlign: 'center' }}>Olek</th>
                </tr>
              </thead>
              <tbody>
                {lisaEntries.map((entry, idx) => {
                  const entryStatus = entry.status ?? 'match';
                  const badgeColor = entryStatus === 'match' ? 'success' : entryStatus === 'not_invoiced' ? 'danger' : 'warning';
                  const badgeLabel = entryStatus === 'match' ? 'Kattub' : entryStatus === 'not_invoiced' ? 'Arve esitamata' : 'Partnerarvel puudu';
                  return (
                    <tr key={idx} style={{ borderBottom: '1px solid var(--color-border, #f0f0f0)' }}>
                      <td style={subTdStyle}>{entry.personalCode}</td>
                      <td style={{ ...subTdStyle, fontFamily: 'monospace' }}>{entry.saatekirjaNumber}</td>
                      <td style={{ ...subTdStyle, fontFamily: 'monospace' }}>{entry.haigusjuhtumiNr || '—'}</td>
                      <td style={subTdStyle}>{entry.serviceDate || '—'}</td>
                      <td style={{ ...subTdStyle, textAlign: 'center' }}>
                        <StatusBadge color={badgeColor}>{badgeLabel}</StatusBadge>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </td>
        </tr>
      )}
      {isExpanded && lisaEntries.length === 0 && (
        <tr>
          <td colSpan={5} style={{ padding: '8px 10px 12px 40px', background: 'var(--color-bg-subtle, #fafafa)', fontSize: '0.825rem', color: 'var(--color-text-secondary, #888)' }}>
            Arve lisa andmed puuduvad selle koodi kohta.
          </td>
        </tr>
      )}
    </>
  );
}

// ── Styles ──

const selectStyle: React.CSSProperties = {
  padding: '6px 12px',
  border: '1px solid var(--color-border, #e0e0e0)',
  borderRadius: '4px',
  fontSize: '0.875rem',
  background: 'white',
};

const dateInputStyle: React.CSSProperties = {
  padding: '4px 8px',
  border: '1px solid var(--color-border, #e0e0e0)',
  borderRadius: '4px',
  fontSize: '0.875rem',
};

const cardStyle: React.CSSProperties = {
  background: 'white',
  border: '1px solid var(--color-border, #e0e0e0)',
  borderRadius: '8px',
  padding: 'var(--spacing-md, 16px)',
};

const cardTitleStyle: React.CSSProperties = {
  margin: '0 0 var(--spacing-md, 16px)',
  fontSize: '1.05rem',
};

const ourThStyle: React.CSSProperties = {
  padding: '6px 8px',
  fontSize: '0.75rem',
  color: 'var(--color-text-secondary, #666)',
  fontWeight: 600,
  textTransform: 'uppercase',
  letterSpacing: '0.04em',
};

const compThStyle: React.CSSProperties = {
  padding: '8px 10px',
  fontSize: '0.75rem',
  color: 'var(--color-text-secondary, #666)',
  fontWeight: 600,
  textTransform: 'uppercase',
  letterSpacing: '0.04em',
};

const subThStyle: React.CSSProperties = {
  padding: '4px 6px',
  fontSize: '0.7rem',
  color: 'var(--color-text-secondary, #888)',
  fontWeight: 600,
  textTransform: 'uppercase',
  textAlign: 'left',
};

const subTdStyle: React.CSSProperties = {
  padding: '4px 6px',
  fontSize: '0.825rem',
};
