namespace go ledger

struct LedgerEntry {
    1: required string Id (api.body = "id"),
    2: required string CategoryId (api.body = "category_id"),
    3: required string CategoryName (api.body = "category_name"),
    4: required double Amount (api.body = "amount"),
    5: required string UpdatedAt (api.body = "updated_at")
}

struct CreateLedgerEntryReq {
    1: required string CategoryName (api.body = "category_name"),
    2: required double Amount (api.body = "amount")
}

struct CreateLedgerEntryRes {
    1: required LedgerEntry Entry (api.body = "entry")
}

struct UpdateLedgerEntryReq {
    1: required string CategoryId (api.body = "category_id"),
    2: optional string CategoryName (api.body = "category_name"),
    3: optional double Amount (api.body = "amount"),
    4: optional string UpdatedAt (api.body = "updated_at")
}

struct UpdateLedgerEntryRes {
    1: required LedgerEntry Entry (api.body = "entry")
}

struct DeleteLedgerEntryReq {
    1: required string CategoryId (api.body = "category_id")
}

struct DeleteLedgerEntryRes {
}

struct ListLedgerEntriesReq {
    1: required string StartDate (api.body = "start_date")
}

struct ListLedgerEntriesRes {
    1: required list<LedgerEntry> Entries (api.body = "entries")
}

service LedgerService {
    CreateLedgerEntryRes CreateLedgerEntry(1: CreateLedgerEntryReq req) (api.post = "/v1/ledger/entries/create"),
    UpdateLedgerEntryRes UpdateLedgerEntry(1: UpdateLedgerEntryReq req) (api.post = "/v1/ledger/entries/update"),
    DeleteLedgerEntryRes DeleteLedgerEntry(1: DeleteLedgerEntryReq req) (api.post = "/v1/ledger/entries/delete"),
    ListLedgerEntriesRes ListLedgerEntries(1: ListLedgerEntriesReq req) (api.post = "/v1/ledger/entries/list"),
}
