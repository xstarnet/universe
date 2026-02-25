import axios, { AxiosHeaders } from "axios";
import { beginRequest, endRequest } from "../utils/loading";
import { Toast } from "antd-mobile";
import type { AxiosInstance, AxiosRequestConfig } from "axios";
import type { UserService, RefreshTokenRes } from "./user";
import { UserServiceConfig } from "./user";
import type { LedgerService } from "./ledger";
import { LedgerServiceConfig } from "./ledger";
import { Capacitor } from "@capacitor/core";
import { preferences } from "../utils/preferences";

type baseResp<T> = {
  data: T;
  code: number;
  message?: string;
  detail?: string;
};

const client: AxiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL ?? window.location.origin,
});

client.interceptors.request.use((config) => {
  const token = preferences.get("token");
  if (token) {
    if (!config.headers) config.headers = new AxiosHeaders();
    (config.headers as AxiosHeaders).set("Authorization", `Bearer ${token}`);
  }
  beginRequest();
  return config;
});

client.interceptors.response.use(
  (response) => {
    endRequest();
    return response;
  },
  (error) => {
    endRequest();
    console.error("[axios error]", error);
    Toast.show({ content: String("网络错误") });
    return Promise.reject(error);
  }
);

type HttpRequest = {
  path?: Record<string, string | number | boolean | null | undefined>;
  body?: unknown;
  headers?: Record<string, string>;
  query?: Record<string, string | number | boolean | null | undefined>;
};

function fillPath(path: string, params?: HttpRequest["path"]) {
  if (!params) return path;
  return path.replace(/:([a-zA-Z_][a-zA-Z0-9_]*)/g, (_, k) =>
    encodeURIComponent(String(params[k] ?? ""))
  );
}

const getUrl = () => {
  if (Capacitor.isNativePlatform()) {
    return "https://www.miemie.tech/universe";
  } else {
    return "/universe";
  }
};

async function dispatch<Res>(
  method: string,
  path: string,
  req: HttpRequest
): Promise<Res> {
  const url = fillPath(path, req.path);
  const cfg: AxiosRequestConfig = {
    headers: req.headers,
    params: req.query,
    baseURL: getUrl(),
  };
  const m = method.toLowerCase() as "get" | "post" | "put" | "patch" | "delete";
  const res = await client.request<baseResp<Res>>({
    method: m,
    url,
    data: req.body,
    ...cfg,
  });
  const resp = res.data;
  if (resp.code !== 20000) {
    console.error(resp);
    if (resp.code === 50500) {
      Toast.show({ content: "请求异常" });
    } else if (resp.code === 40100) {
      try {
        await refreshToken();
        const retryRes = await client.request<baseResp<Res>>({
          method: m,
          url,
          data: req.body,
          ...cfg,
        });
        const retryData = retryRes.data;
        if (retryData.code !== 20000) {
          if (retryData.code === 40100) {
            void preferences.remove("token");
            void preferences.remove("refresh_token");
            void preferences.remove("token_expires_in");
            window.location.href = "/login";
          } else {
            Toast.show({
              content: String(
                retryData.detail || retryData.message || "请求失败"
              ),
            });
          }
          throw new Error(retryData.message);
        }
        return retryData.data;
      } catch {
        void preferences.remove("token");
        void preferences.remove("refresh_token");
        void preferences.remove("token_expires_in");
        window.location.href = "/login";
        throw new Error("Unauthorized");
      }
    } else {
      Toast.show({
        content: String(resp.detail || resp.message || "请求失败"),
      });
    }
    throw new Error(resp.message);
  }
  return resp.data;
}

type ServiceMethod<Fn> = Fn extends (arg: infer Req) => infer Res
  ? (arg: Req) => Promise<Res>
  : never;
type PromisifyService<T> = { [K in keyof T]: ServiceMethod<T[K]> };

function buildService<T>(
  config: Record<string, { method: string; path: string }>
): PromisifyService<T> {
  const service: Record<string, (req: unknown) => Promise<unknown>> = {};
  Object.keys(config).forEach((key) => {
    const { method, path } = config[key];
    service[key] = (req: unknown) => dispatch(method, path, req as HttpRequest);
  });
  return service as PromisifyService<T>;
}

export const api = {
  user: buildService<UserService>(UserServiceConfig),
  ledger: buildService<LedgerService>(LedgerServiceConfig),
};

export type Api = typeof api;

export function setApiBaseURL(url: string) {
  client.defaults.baseURL = url;
}

export const http = client;

let refreshPromise: Promise<void> | null = null;

async function doRefreshToken(): Promise<void> {
  const rt = preferences.get("refresh_token");
  if (!rt) throw new Error("No refresh token");
  const res = await client.request<baseResp<RefreshTokenRes>>({
    method: UserServiceConfig.RefreshToken.method.toLowerCase(),
    url: UserServiceConfig.RefreshToken.path,
    data: { refresh_token: rt },
    baseURL: getUrl(),
  });
  const resp = res.data;
  if (resp.code !== 20000) throw new Error(resp.message || "refresh failed");
  const data = resp.data;
  await preferences.set("token", data.token);
  await preferences.set("refresh_token", data.refresh_token);
  if (typeof data.expires_in === "number") {
    await preferences.set("token_expires_in", String(data.expires_in));
  }
}

function refreshToken(): Promise<void> {
  if (!refreshPromise) {
    refreshPromise = doRefreshToken().finally(() => {
      refreshPromise = null;
    });
  }
  return refreshPromise;
}
