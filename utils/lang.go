package utils

func V2p[T any](v T) *T {
	return &v
}

func Nvl[T any](v *T, def T) T {
	if v == nil {
		return def
	}
	return *v
}
