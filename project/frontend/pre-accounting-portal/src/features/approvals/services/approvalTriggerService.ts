import { erpPost } from '../../../services/erpApi'

type ApprovalTriggerResponse = {
  message?: {
    requires_approval: boolean
    created: boolean
    request_name?: string | null
  }
}

const TRIGGER_ENDPOINT = '/method/shipyard_app.pre_accounting_approval.register_transaction_for_approval'

export async function registerTransactionForApproval(documentType: string, documentName: string, amount: number): Promise<void> {
  await erpPost<ApprovalTriggerResponse, { document_type: string; document_name: string; amount: number }>(TRIGGER_ENDPOINT, {
    document_type: documentType,
    document_name: documentName,
    amount,
  })
}
