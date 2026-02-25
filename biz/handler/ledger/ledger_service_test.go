package ledger

import (
    "testing"
    "time"
    "github.com/google/uuid"
    "fmt"
)

func TestMergeRows_NoStart(t *testing.T) {
    catA := uuid.New()
    catB := uuid.New()
    now := time.Now().UTC()
    l := []listRow{
        {id: uuid.New(), categoryId: catA, categoryName: "A", amount: 10, updatedAt: now.Add(-1 * time.Hour)},
        {id: uuid.New(), categoryId: catB, categoryName: "B", amount: 20, updatedAt: now.Add(-2 * time.Hour)},
    }
    g := mergeRows(l, nil)
    if len(g) != 2 {
        t.Fatalf("expected 2 groups, got %d", len(g))
    }
    out := toBizEntries(g)
    if len(out) != 2 {
        t.Fatalf("expected 2 entries, got %d", len(out))
    }
    if out[0].CategoryName == out[1].CategoryName {
        t.Fatalf("expected different categories")
    }
}

func TestMergeRows_DedupWithStart(t *testing.T) {
    cat := uuid.New()
    now := time.Now().UTC()
    id := uuid.New()
    latest := []listRow{{id: id, categoryId: cat, categoryName: "X", amount: 1, updatedAt: now}}
    since := []listRow{{id: id, categoryId: cat, categoryName: "X", amount: 1, updatedAt: now}}
    g := mergeRows(latest, since)
    if len(g[cat]) != 1 {
        t.Fatalf("expected 1 entry after dedup, got %d", len(g[cat]))
    }
}

func TestMergeRows_IncludeZeroAmountsInStart(t *testing.T) {
    cat := uuid.New()
    now := time.Now().UTC()
    latest := []listRow{{id: uuid.New(), categoryId: cat, categoryName: "Y", amount: 2, updatedAt: now.Add(-1 * time.Hour)}}
    since := []listRow{{id: uuid.New(), categoryId: cat, categoryName: "Y", amount: 0, updatedAt: now}}
    g := mergeRows(latest, since)
    if len(g[cat]) != 2 {
        t.Fatalf("expected 2 entries including zero, got %d", len(g[cat]))
    }
    out := toBizEntries(g)
    if out[0].Amount != 0 {
        t.Fatalf("expected latest by time first with zero amount, got %v", out[0].Amount)
    }
}

func TestParseStartDate_UnixMs(t *testing.T) {
    now := time.Now().UTC()
    ms := now.UnixMilli()
    p, err := parseStartDate(fmt.Sprintf("%d", ms))
    if err != nil {
        t.Fatalf("unexpected error: %v", err)
    }
    if p == nil {
        t.Fatalf("expected non-nil time")
    }
    if p.After(now.Add(2 * time.Second)) || p.Before(now.Add(-2 * time.Second)) {
        t.Fatalf("parsed time not close to now: %v vs %v", p, now)
    }
}
