package utils

import (
    "context"
    "os"
    "strings"

    "github.com/cloudwego/hertz/pkg/app"
    "github.com/golang-jwt/jwt/v5"
)

func JwtAuth(paths ...string) []app.HandlerFunc {
    allow := map[string]struct{}{}
    for _, p := range paths {
        allow[p] = struct{}{}
    }
    secret := []byte(os.Getenv("jwt_secret_key"))

    return []app.HandlerFunc{
        func(ctx context.Context, c *app.RequestContext) {
            if _, ok := allow[string(c.Request.URI().Path())]; ok {
                c.Next(ctx)
                return
            }

            auth := string(c.Request.Header.Peek("Authorization"))
            if !strings.HasPrefix(auth, "Bearer ") {
                Unauthorized(c, "missing bearer token")
                c.Abort()
                return
            }
            tokenStr := strings.TrimPrefix(auth, "Bearer ")

            if len(secret) == 0 {
                InternalError(c, os.ErrNotExist)
                c.Abort()
                return
            }

            claims := &jwt.RegisteredClaims{}
            token, err := jwt.ParseWithClaims(tokenStr, claims, func(token *jwt.Token) (interface{}, error) {
                return secret, nil
            }, jwt.WithValidMethods([]string{jwt.SigningMethodHS256.Alg()}))

            if err != nil || token == nil || !token.Valid {
                Unauthorized(c, "invalid token")
                c.Abort()
                return
            }

            c.Set("user_id", claims.Subject)
            c.Next(ctx)
        },
    }
}

