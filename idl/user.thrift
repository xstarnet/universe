namespace go user

struct User {
    1: required string Id (api.json = "id"),
    2: optional string Name (api.json = "name"),
    3: required string Phone (api.json = "phone"),
    4: optional string Avatar (api.json = "avatar"),
    5: optional list<string> RoleIds (api.json = "role_ids")
}

struct CreateUserReq {
    1: required string Phone (api.body = "phone"),
    2: optional string Name (api.body = "name"),
    3: optional string Avatar (api.body = "avatar"),
    4: optional list<string> RoleIds (api.body = "role_ids")
}

struct CreateUserRes {
    1: required User User
}

struct UpdateUserReq {
    1: required string Id (api.path = "id"),
    2: optional string Name (api.body = "name"),
    3: optional string Phone (api.body = "phone"),
    4: optional string Avatar (api.body = "avatar"),
    5: optional list<string> RoleIds (api.body = "role_ids")
}

struct UpdateUserRes {
    1: required User User
}

struct ListUsersReq {
    1: required i32 Page (api.query = "page"),
    2: required i32 PageSize (api.query = "page_size"),
    3: optional string Name (api.query = "name"),
    4: optional string Phone (api.query = "phone")
}

struct ListUsersRes {
    1: required i32 Total,
    2: required list<User> Users
}

struct GetUserReq {
    1: required string Id (api.path = "id")
}

struct GetUserRes {
    1: required User User
}

struct DeleteUserReq {
    1: required string Id (api.path = "id")
}

struct DeleteUserRes {
}

service UserService {
    // User operations
    CreateUserRes CreateUser(1: CreateUserReq req) (api.post = "/v1/users"),
    UpdateUserRes UpdateUser(1: UpdateUserReq req) (api.post = "/v1/users/delete/:id"),
    DeleteUserRes DeleteUser(1: DeleteUserReq req) (api.post = "/v1/users/update/:id"),
    GetUserRes GetUser(1: GetUserReq req) (api.get = "/v1/users/:id"),
    ListUsersRes ListUsers(1: ListUsersReq req) (api.get = "/v1/users"),
}
