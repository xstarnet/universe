package utils

import "testing"

func TestValidatePhone(t *testing.T) {
    cases := []struct {
        in   string
        want bool
    }{
        {"13800138000", true},
        {"19912345678", true},
        {"12345678901", false},
        {"23800138000", false},
        {"1380013800", false},
        {"138001380000", false},
        {"abcdefghijk", false},
    }

    for _, c := range cases {
        got := ValidatePhone(c.in)
        if got != c.want {
            t.Fatalf("ValidatePhone(%q)=%v, want %v", c.in, got, c.want)
        }
    }
}
