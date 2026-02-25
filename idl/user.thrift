namespace go user

struct User {
    1: required string Id (api.body = "id"),
    2: optional string Name (api.body = "name"),
    3: required string Phone (api.body = "phone"),
    4: optional string Avatar (api.body = "avatar")
}

struct CreateUserReq {
    1: required string Phone (api.body = "phone"),
    2: optional string Name (api.body = "name"),
    3: optional string Avatar (api.body = "avatar")
}

struct CreateUserRes {
    1: required User User (api.body = "user")
}

struct UpdateUserReq {
    1: required string Id (api.path = "id"),
    2: optional string Name (api.body = "name"),
    3: optional string Phone (api.body = "phone"),
    4: optional string Avatar (api.body = "avatar")
}

struct UpdateUserRes {
    1: required User User (api.body = "user")
}

struct ListUsersReq {
    1: required i32 Page (api.body = "page"),
    2: required i32 PageSize (api.body = "page_size"),
    3: optional string Name (api.body = "name"),
    4: optional string Phone (api.body = "phone")
}

struct ListUsersRes {   
    1: required i32 Total (api.body = "total"),
    2: required list<User> Users (api.body = "users")
}

struct GetUserReq {
    1: required string Id (api.path = "id")
}

struct GetUserRes {
    1: required User User (api.body = "user")
}

struct DeleteUserReq {
    1: required string Id (api.path = "id")
}

struct DeleteUserRes {
}

// SMS & Login related structs
struct SendSmsCodeReq {
    1: required string Phone (api.body = "phone"), // User's phone number
}

struct SendSmsCodeRes {
}

struct LoginReq {
    1: required string Phone (api.body = "phone"), // User's phone number
    2: required string SmsCode (api.body = "sms_code"), // SMS verification code
}

struct LoginRes {
    1: required string Token (api.body = "token"), // JWT token for authentication
    2: required string RefreshToken (api.body = "refresh_token"), // Token to refresh the JWT
    3: optional i32 ExpiresIn (api.body = "expires_in"), // Token expiration time in seconds
}

struct LogoutReq {
    1: required string Token (api.header = "Authorization"), // JWT token to invalidate
}

struct LogoutRes {
}

struct RefreshTokenReq {
    1: required string RefreshToken (api.body = "refresh_token"), // Refresh token
}

struct RefreshTokenRes {
    1: required string Token (api.body = "token"), // New JWT token
    2: required string RefreshToken (api.body = "refresh_token"), // New refresh token
    3: optional i32 ExpiresIn (api.body = "expires_in"), // Token expiration time in seconds
}

service UserService {
    // User operations
    CreateUserRes CreateUser(1: CreateUserReq req) (api.post = "/v1/users"),
    UpdateUserRes UpdateUser(1: UpdateUserReq req) (api.post = "/v1/users/update/:id"),
    DeleteUserRes DeleteUser(1: DeleteUserReq req) (api.post = "/v1/users/delete/:id"),
    GetUserRes GetUser(1: GetUserReq req) (api.get = "/v1/users/:id"),
    ListUsersRes ListUsers(1: ListUsersReq req) (api.post = "/v1/users/list"),

    // Login & SMS operations
    SendSmsCodeRes SendSmsCode(1: SendSmsCodeReq req) (api.post = "/v1/users/sms_code"),
    LoginRes Login(1: LoginReq req) (api.post = "/v1/users/login"),
    LogoutRes Logout(1: LogoutReq req) (api.post = "/v1/users/logout"),
    RefreshTokenRes RefreshToken(1: RefreshTokenReq req) (api.post = "/v1/users/refresh_token"),
}
