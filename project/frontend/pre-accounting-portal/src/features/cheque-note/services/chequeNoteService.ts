import { erpPost } from '../../../services/erpApi'

export type ChequeNoteKind = 'Cek' | 'Senet'
export type ChequeNoteDirection = 'Musteriden' | 'Tedarikciye'
export type ChequeNoteStatus = 'Portfoyde' | 'Tahsil Edildi' | 'Ciro Edildi' | 'Iade' | 'Protesto'

export type ChequeNoteRow = {
  name: string
  kind: ChequeNoteKind
  direction: ChequeNoteDirection
  instrument_no: string
  party?: string
  amount: number
  issue_date?: string
  due_date?: string
  status: ChequeNoteStatus
  note?: string
  linked_payment_entry?: string
  last_status_at?: string
}

export type ChequeNoteMovementRow = {
  name: string
  cheque_note: string
  movement_type: 'Olusturuldu' | 'Durum Degisti'
  from_status?: ChequeNoteStatus
  to_status?: ChequeNoteStatus
  movement_note?: string
  moved_by?: string
  moved_at?: string
}

export type ChequeNoteRiskSummary = {
  portfoy_alacak_riski: number
  portfoy_borc_riski: number
  net_risk: number
  open_count: number
}

export type ChequeNoteMaturityCalendar = {
  start_date: string
  end_date: string
  overdue_items: ChequeNoteRow[]
  due_soon_items: ChequeNoteRow[]
  count: number
}

export type ChequeNoteFilter = {
  status?: ChequeNoteStatus
  kind?: ChequeNoteKind
  direction?: ChequeNoteDirection
  party_query?: string
  due_from?: string
  due_to?: string
}

export type ChequeNoteDraft = {
  kind: ChequeNoteKind
  direction: ChequeNoteDirection
  instrument_no: string
  party?: string
  amount: number
  issue_date?: string
  due_date?: string
  note?: string
}

export async function listChequeNotes(limit = 100, filter: ChequeNoteFilter = {}): Promise<ChequeNoteRow[]> {
  const response = await erpPost<{ message?: { items?: ChequeNoteRow[] } }, { limit: number } & ChequeNoteFilter>(
    '/method/shipyard_app.pre_accounting_cheque.list_cheque_notes',
    { limit, ...filter },
  )
  return response.message?.items ?? []
}

export async function createChequeNote(payload: ChequeNoteDraft): Promise<void> {
  await erpPost<{ message?: { status?: string } }, ChequeNoteDraft>(
    '/method/shipyard_app.pre_accounting_cheque.create_cheque_note',
    payload,
  )
}

export async function updateChequeNoteStatus(
  name: string,
  status: ChequeNoteStatus,
  movement_note?: string,
  linked_payment_entry?: string,
): Promise<void> {
  await erpPost<
    { message?: { status?: string } },
    { name: string; status: ChequeNoteStatus; movement_note?: string; linked_payment_entry?: string }
  >('/method/shipyard_app.pre_accounting_cheque.update_cheque_note_status', {
    name,
    status,
    movement_note,
    linked_payment_entry,
  })
}

export async function listChequeNoteMovements(cheque_note?: string, limit = 100): Promise<ChequeNoteMovementRow[]> {
  const response = await erpPost<
    { message?: { items?: ChequeNoteMovementRow[] } },
    { cheque_note?: string; limit: number }
  >('/method/shipyard_app.pre_accounting_cheque.list_cheque_note_movements', {
    cheque_note,
    limit,
  })
  return response.message?.items ?? []
}

export async function getChequeNoteRiskSummary(): Promise<ChequeNoteRiskSummary> {
  const response = await erpPost<{ message?: ChequeNoteRiskSummary }, Record<string, never>>(
    '/method/shipyard_app.pre_accounting_cheque.get_cheque_note_risk_summary',
    {},
  )
  return (
    response.message ?? {
      portfoy_alacak_riski: 0,
      portfoy_borc_riski: 0,
      net_risk: 0,
      open_count: 0,
    }
  )
}

export async function getChequeNoteMaturityCalendar(days = 60): Promise<ChequeNoteMaturityCalendar> {
  const response = await erpPost<{ message?: ChequeNoteMaturityCalendar }, { days: number }>(
    '/method/shipyard_app.pre_accounting_cheque.get_cheque_note_maturity_calendar',
    { days },
  )
  return (
    response.message ?? {
      start_date: '',
      end_date: '',
      overdue_items: [],
      due_soon_items: [],
      count: 0,
    }
  )
}
