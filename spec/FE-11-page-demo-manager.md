# FE-11: Page — Demo Manager

## Goal
Implement the DemoManager page (`/demo`) for creating demo cases for testing.

## File to create
`apps/frontend/src/pages/DemoManager.tsx`

---

## Data

```typescript
const { data: allCases, isLoading } = useHaiguslood();
const demoCases = allCases?.filter(c => c.isDemo) ?? [];
const createMutation = useCreateDemoHaiguslugu();
const navigate = useNavigate();

const [form, setForm] = useState({
  patientName: '',
  patientCode: '',
  haigusjuhtumiNr: '',
  saatekirjaType: 'lab_results' as const,
  fixturePdfCase: 1 as const,
});
```

---

## Layout

```
PageHeader: "Demo juhtumid"

## Olemasolevad demo juhtumid
Table:
  Patsient | HaigusjuhtumiNr | Olek | Toimingud
  ──────────────────────────────────────────────
  Jaarika.. | A21996          | OPEN | [Vaata →]

## Lisa uus demo juhtum
[Form]
  Patsiendi nimi:    [TextInput]
  Isikukood:         [TextInput]  (11 digits required)
  HaigusjuhtumiNr:   [TextInput]  (auto-suggest: "DEMO-00N")
  PDF fikstuuri tüüp: [Select]
    - 1: Laborianalüüsid (Jaarika)
    - 2: Lapse vaktsineerimine
    - 3: Haava sidumine + TVL
  [Lisa juhtum] (primary Button)
```

---

## Form validation (client-side)

Before submitting:
- `patientName`: required, non-empty
- `patientCode`: must be exactly 11 digits (`/^\d{11}$/`)
- `haigusjuhtumiNr`: required, non-empty

Show inline error text below each invalid field using TEDI error state on `TextInput`.

---

## Auto-suggest for haigusjuhtumiNr

When the form opens, compute the next demo number:
```typescript
const nextNum = (demoCases.length + 1).toString().padStart(3, '0');
const suggestion = `DEMO-${nextNum}`;
```
Pre-fill the `haigusjuhtumiNr` field with this suggestion (user can override).

---

## Submit flow

1. Validate form (show errors if invalid, don't submit)
2. Call `createMutation.mutate(form)`
3. On success: `navigate('/cases/' + newHaiguslugu.id)`
4. On error: show TEDI `Alert` type="error" above the form: error.message

Show TEDI `Spinner` inside the submit button while `createMutation.isPending`.

---

## Existing demo cases table

List all cases where `isDemo === true`.
- "Vaata" link → `/cases/:id`
- Show `CaseStatus` as TEDI Badge (OPEN = green, CLOSED = grey)

If no demo cases yet: TEDI `Alert` type="info": "Demo juhtumeid pole. Lisa uus juhtum allpool."

---

## Fixture PDF options (Select)

```typescript
const fixtureOptions = [
  { value: 1, label: '1: Laborianalüüsid (Jaarika Järviste)' },
  { value: 2, label: '2: Lapse vaktsineerimine (Kristjan Tamm)' },
  { value: 3, label: '3: Haava sidumine + TVL (Mari Lepik)' },
];
```

The `saatekirjaType` is derived from `fixturePdfCase`:
- 1 → 'lab_results'
- 2 → 'child_vaccination'
- 3 → 'wound_tvl'

---

## Done when
- Existing demo cases list renders correctly
- Form validates patientCode (11 digits) before submitting
- Successful submission redirects to CaseDetail
- Auto-suggested haigusjuhtumiNr pre-fills correctly
