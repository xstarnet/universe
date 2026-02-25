# 领域模型与业务模型映射

## User
- 领域模型：`domain/model.User`
  - 列：`id (char(36), PK)`, `name (varchar(255))`, `phone (varchar(32), unique)`, `avatar (varchar(255))`
  - 表：`users`
- 业务模型：`biz/model/user.User`
- 映射实现：`biz/handler/user/mapping.go`

## LedgerEntry
- 领域模型：`domain/model.LedgerEntry`
  - 列：`id (char(36), PK)`, `category_id (char(36), index)`, `category_name (varchar(255))`, `amount (numeric)`, `updated_at (varchar(64))`
  - 表：`ledger_entries`
- 业务模型：`biz/model/ledger.LedgerEntry`
- 映射实现：`biz/handler/ledger/mapping.go`

## Category
- 领域模型：`domain/model.Category`
  - 列：`id (char(36), PK)`, `name (varchar(255), index)`, `description (varchar(1024))`
  - 表：`categories`
- 业务模型：`biz/model/ledger.Category`
- 映射实现：`biz/handler/ledger/mapping.go`
