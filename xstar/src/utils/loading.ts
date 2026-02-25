import { Toast, SpinLoading } from "antd-mobile";
import React from "react";

let pendingCount = 0;
let mounted = false;

export function showLoading(content = "加载中…") {
  mounted = true;
  Toast.show({
    content: React.createElement("div", { className: "global-loading" }, [
      React.createElement(SpinLoading, {
        color: "white",
        key: "icon",
      }),
      React.createElement("div", { key: "text" }, content),
    ]),
    duration: 0,
    maskClickable: false,
  });
}

export function hideLoading() {
  mounted = false;
  Toast.clear();
}

export function beginRequest() {
  pendingCount++;
  if (pendingCount === 1 && !mounted) showLoading();
}

export function endRequest() {
  if (pendingCount > 0) pendingCount--;
  if (pendingCount === 0 && mounted) hideLoading();
}
