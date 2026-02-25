package ledger

import (
	"time"
	bm "universe/biz/model/ledger"
	dom "universe/domain/model"
)

func toBizEntryWithCategory(d *dom.LedgerEntry, categoryName string) *bm.LedgerEntry {
	if d == nil {
		return nil
	}
	var ts string
	if !d.UpdatedAt.IsZero() {
		ts = d.UpdatedAt.Format(time.RFC3339)
	}
	return &bm.LedgerEntry{
		Id:           d.Id.String(),
		CategoryId:   d.CategoryId.String(),
		CategoryName: categoryName,
		Amount:       d.Amount,
		UpdatedAt:    ts,
	}
}

// Category struct is not present in biz/model/ledger; domain-only mapping is omitted.
