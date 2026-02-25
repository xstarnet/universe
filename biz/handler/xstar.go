package handler

import (
	"context"
	"crypto/sha256"
	"encoding/hex"
	"encoding/json"
	"io"
	"os"
	"path/filepath"
	"strings"

	"github.com/cloudwego/hertz/pkg/app"
	"github.com/cloudwego/hertz/pkg/protocol/consts"
)

func xstarDistBaseDir() string {
	if v := os.Getenv("XSTAR_DIST_DIR"); v != "" {
		return v
	}
	return "/var/www/xstar/capacitor"
}

func readManifest(base string) ([]byte, map[string]string, string, error) {
	p := filepath.Join(base, "manifest.json")
	f, err := os.Open(p)
	if err != nil {
		return nil, nil, "", err
	}
	defer f.Close()
	hasher := sha256.New()
	data, err := io.ReadAll(io.TeeReader(f, hasher))
	if err != nil {
		return nil, nil, "", err
	}
	var m map[string]string
	if err := json.Unmarshal(data, &m); err != nil {
		return nil, nil, "", err
	}
	etag := "\"sha256-" + hex.EncodeToString(hasher.Sum(nil)) + "\""
	return data, m, etag, nil
}

func isSafeRelPath(p string) bool {
	c := filepath.Clean(p)
	if strings.HasPrefix(c, "/") || strings.Contains(c, "..") {
		return false
	}
	return true
}

func changedKeys(client map[string]string, server map[string]string) []string {
	out := make([]string, 0, len(server))
	for k, v := range server {
		cv, ok := client[k]
		if !ok || cv != v {
			if isSafeRelPath(k) {
				out = append(out, filepath.Clean(k))
			}
		}
	}
	return out
}

func XstarManifest(ctx context.Context, c *app.RequestContext) {
	base := xstarDistBaseDir()
	data, _, etag, err := readManifest(base)
	if err != nil {
		c.String(consts.StatusNotFound, "manifest not found")
		return
	}
	inm := string(c.Request.Header.Peek("If-None-Match"))
	if inm != "" && inm == etag {
		c.Header("ETag", etag)
		c.Status(consts.StatusNotModified)
		return
	}
	c.Header("ETag", etag)
	c.Header("Cache-Control", "public, max-age=0")
	c.Data(consts.StatusOK, "application/json", data)
}

func XstarUpdate(ctx context.Context, c *app.RequestContext) {
	name := c.Param("filepath")
	if name == "" {
		name = c.Param("filename")
	}
	if name == "" {
		c.String(consts.StatusBadRequest, "missing filename")
		return
	}
	if !isSafeRelPath(name) {
		c.String(consts.StatusBadRequest, "invalid filename")
		return
	}
	base := xstarDistBaseDir()
	full := filepath.Join(base, name)
	f, err := os.Open(full)
	if err != nil {
		c.String(consts.StatusNotFound, "file not found")
		return
	}
	defer f.Close()
	hasher := sha256.New()
	data, err := io.ReadAll(io.TeeReader(f, hasher))
	if err != nil {
		c.String(consts.StatusInternalServerError, "failed to read file")
		return
	}
	etag := "\"sha256-" + hex.EncodeToString(hasher.Sum(nil)) + "\""
	inm := string(c.Request.Header.Peek("If-None-Match"))
	if inm != "" && inm == etag {
		c.Header("ETag", etag)
		c.Status(consts.StatusNotModified)
		return
	}
	c.Header("ETag", etag)
	c.Header("Cache-Control", "public, max-age=0")
	c.Header("Content-Disposition", "attachment; filename="+filepath.Base(name))
	c.Data(consts.StatusOK, "application/octet-stream", data)
}
