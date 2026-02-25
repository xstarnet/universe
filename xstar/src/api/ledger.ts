export interface LedgerEntry {
  id: string; // api.body: "id"
  category_id: string; // api.body: "category_id"
  category_name: string; // api.body: "category_name"
  amount: number; // api.body: "amount"
  updated_at: string; // api.body: "updated_at"
}

export interface CreateLedgerEntryReq {
  category_name: string; // api.body: "category_name"
  amount: number; // api.body: "amount"
}

export interface CreateLedgerEntryReqBody {
  category_name: string;
  amount: number;
}

export interface CreateLedgerEntryReqHttpRequest {
  body?: CreateLedgerEntryReqBody;
}

export interface CreateLedgerEntryRes {
  entry: LedgerEntry; // api.body: "entry"
}

export interface UpdateLedgerEntryReq {
  category_id: string; // api.body: "category_id"
  category_name?: string; // api.body: "category_name"
  amount?: number; // api.body: "amount"
  updated_at?: string; // api.body: "updated_at"
}

export interface UpdateLedgerEntryReqBody {
  category_id: string;
  category_name?: string;
  amount?: number;
  updated_at?: string;
}

export interface UpdateLedgerEntryReqHttpRequest {
  body?: UpdateLedgerEntryReqBody;
}

export interface UpdateLedgerEntryRes {
  entry: LedgerEntry; // api.body: "entry"
}

export interface DeleteLedgerEntryReq {
  category_id: string; // api.body: "category_id"
}

export interface DeleteLedgerEntryReqBody {
  category_id: string;
}

export interface DeleteLedgerEntryReqHttpRequest {
  body?: DeleteLedgerEntryReqBody;
}

export interface DeleteLedgerEntryRes {
}

export interface ListLedgerEntriesReq {
  start_date: string; // api.body: "start_date"
}

export interface ListLedgerEntriesReqBody {
  start_date: string;
}

export interface ListLedgerEntriesReqHttpRequest {
  body?: ListLedgerEntriesReqBody;
}

export interface ListLedgerEntriesRes {
  entries: LedgerEntry[]; // api.body: "entries"
}

export interface LedgerService {
  CreateLedgerEntry(req: CreateLedgerEntryReqHttpRequest): CreateLedgerEntryRes;
  UpdateLedgerEntry(req: UpdateLedgerEntryReqHttpRequest): UpdateLedgerEntryRes;
  DeleteLedgerEntry(req: DeleteLedgerEntryReqHttpRequest): DeleteLedgerEntryRes;
  ListLedgerEntries(req: ListLedgerEntriesReqHttpRequest): ListLedgerEntriesRes;
}

export const LedgerServiceConfig = {
  CreateLedgerEntry: { method: "post", path: "/v1/ledger/entries/create" },
  UpdateLedgerEntry: { method: "post", path: "/v1/ledger/entries/update" },
  DeleteLedgerEntry: { method: "post", path: "/v1/ledger/entries/delete" },
  ListLedgerEntries: { method: "post", path: "/v1/ledger/entries/list" },
}

