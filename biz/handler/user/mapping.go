package user

import (
    bm "universe/biz/model/user"
    dom "universe/domain/model"
    "github.com/google/uuid"
)

func toDomainUser(b *bm.User) *dom.User {
    if b == nil { return nil }
    var id uuid.UUID
    if b.Id != "" {
        if parsed, err := uuid.Parse(b.Id); err == nil { id = parsed }
    }
    return &dom.User{
        Id:     id,
        Name:   b.Name,
        Phone:  b.Phone,
        Avatar: b.Avatar,
    }
}

func toBizUser(d *dom.User) *bm.User {
    if d == nil { return nil }
    return &bm.User{
        Id:     d.Id.String(),
        Name:   d.Name,
        Phone:  d.Phone,
        Avatar: d.Avatar,
    }
}
