export interface User {
  id: string; // api.body: "id"
  name?: string; // api.body: "name"
  phone: string; // api.body: "phone"
  avatar?: string; // api.body: "avatar"
}

export interface CreateUserReq {
  phone: string; // api.body: "phone"
  name?: string; // api.body: "name"
  avatar?: string; // api.body: "avatar"
}

export interface CreateUserReqBody {
  phone: string;
  name?: string;
  avatar?: string;
}

export interface CreateUserReqHttpRequest {
  body?: CreateUserReqBody;
}

export interface CreateUserRes {
  user: User; // api.body: "user"
}

export interface UpdateUserReq {
  id: string; // api.path: "id"
  name?: string; // api.body: "name"
  phone?: string; // api.body: "phone"
  avatar?: string; // api.body: "avatar"
}

export interface UpdateUserReqPath {
  id: string;
}

export interface UpdateUserReqBody {
  name?: string;
  phone?: string;
  avatar?: string;
}

export interface UpdateUserReqHttpRequest {
  path?: UpdateUserReqPath;
  body?: UpdateUserReqBody;
}

export interface UpdateUserRes {
  user: User; // api.body: "user"
}

export interface ListUsersReq {
  page: number; // api.body: "page"
  page_size: number; // api.body: "page_size"
  name?: string; // api.body: "name"
  phone?: string; // api.body: "phone"
}

export interface ListUsersReqBody {
  page: number;
  page_size: number;
  name?: string;
  phone?: string;
}

export interface ListUsersReqHttpRequest {
  body?: ListUsersReqBody;
}

export interface ListUsersRes {
  total: number; // api.body: "total"
  users: User[]; // api.body: "users"
}

export interface GetUserReq {
  id: string; // api.path: "id"
}

export interface GetUserReqPath {
  id: string;
}

export interface GetUserReqHttpRequest {
  path?: GetUserReqPath;
}

export interface GetUserRes {
  user: User; // api.body: "user"
}

export interface DeleteUserReq {
  id: string; // api.path: "id"
}

export interface DeleteUserReqPath {
  id: string;
}

export interface DeleteUserReqHttpRequest {
  path?: DeleteUserReqPath;
}

export interface DeleteUserRes {
}

export interface SendSmsCodeReq {
  phone: string; // api.body: "phone"
}

export interface SendSmsCodeReqBody {
  phone: string;
}

export interface SendSmsCodeReqHttpRequest {
  body?: SendSmsCodeReqBody;
}

export interface SendSmsCodeRes {
}

export interface LoginReq {
  phone: string; // api.body: "phone"
  sms_code: string; // api.body: "sms_code"
}

export interface LoginReqBody {
  phone: string;
  sms_code: string;
}

export interface LoginReqHttpRequest {
  body?: LoginReqBody;
}

export interface LoginRes {
  token: string; // api.body: "token"
  refresh_token: string; // api.body: "refresh_token"
  expires_in?: number; // api.body: "expires_in"
}

export interface LogoutReq {
  Authorization: string; // api.header: "Authorization"
}

export interface LogoutReqHeaders {
  Authorization: string;
}

export interface LogoutReqHttpRequest {
  headers?: LogoutReqHeaders;
}

export interface LogoutRes {
}

export interface RefreshTokenReq {
  refresh_token: string; // api.body: "refresh_token"
}

export interface RefreshTokenReqBody {
  refresh_token: string;
}

export interface RefreshTokenReqHttpRequest {
  body?: RefreshTokenReqBody;
}

export interface RefreshTokenRes {
  token: string; // api.body: "token"
  refresh_token: string; // api.body: "refresh_token"
  expires_in?: number; // api.body: "expires_in"
}

export interface UserService {
  CreateUser(req: CreateUserReqHttpRequest): CreateUserRes;
  UpdateUser(req: UpdateUserReqHttpRequest): UpdateUserRes;
  DeleteUser(req: DeleteUserReqHttpRequest): DeleteUserRes;
  GetUser(req: GetUserReqHttpRequest): GetUserRes;
  ListUsers(req: ListUsersReqHttpRequest): ListUsersRes;
  SendSmsCode(req: SendSmsCodeReqHttpRequest): SendSmsCodeRes;
  Login(req: LoginReqHttpRequest): LoginRes;
  Logout(req: LogoutReqHttpRequest): LogoutRes;
  RefreshToken(req: RefreshTokenReqHttpRequest): RefreshTokenRes;
}

export const UserServiceConfig = {
  CreateUser: { method: "post", path: "/v1/users" },
  UpdateUser: { method: "post", path: "/v1/users/update/:id" },
  DeleteUser: { method: "post", path: "/v1/users/delete/:id" },
  GetUser: { method: "get", path: "/v1/users/:id" },
  ListUsers: { method: "post", path: "/v1/users/list" },
  SendSmsCode: { method: "post", path: "/v1/users/sms_code" },
  Login: { method: "post", path: "/v1/users/login" },
  Logout: { method: "post", path: "/v1/users/logout" },
  RefreshToken: { method: "post", path: "/v1/users/refresh_token" },
}

