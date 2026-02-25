import { useCallback, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Settings.scss";
import { preferences } from "../utils/preferences";

// Chevron removed per design

function Settings() {
  const navigate = useNavigate();
  const [debugMode, setDebugMode] = useState(false);
  const clickCountRef = useRef(0);
  const resetTimerRef = useRef<number | null>(null);

  const token = useMemo(() => preferences.get("token") || "", []);
  const userId = useMemo(() => {
    if (!token) return "";
    const parts = token.split(".");
    if (parts.length < 2) return "";
    try {
      const base64 = parts[1].replace(/-/g, "+").replace(/_/g, "/");
      const json = JSON.parse(atob(base64));
      return (
        json.user_id || json.uid || json.userId || json.sub || json.id || ""
      );
    } catch {
      return "";
    }
  }, [token]);

  const handleLogout = useCallback(async () => {
    await preferences.remove("token");
    await preferences.remove("refresh_token");
    await preferences.remove("token_expires_in");
    navigate("/login", { replace: true });
  }, [navigate]);

  const handleTitleClick = useCallback(() => {
    clickCountRef.current += 1;
    if (resetTimerRef.current) {
      clearTimeout(resetTimerRef.current);
      resetTimerRef.current = null;
    }
    resetTimerRef.current = window.setTimeout(() => {
      clickCountRef.current = 0;
      resetTimerRef.current = null;
    }, 500);
    if (clickCountRef.current >= 5) {
      clickCountRef.current = 0;
      if (resetTimerRef.current) {
        clearTimeout(resetTimerRef.current);
        resetTimerRef.current = null;
      }
      setDebugMode((prev) => !prev);
    }
  }, []);

  return (
    <div className="settings-page">
      <div className="nav-bar">
        <div className="nav-title" onClick={handleTitleClick}>
          设置
        </div>
        <div className="nav-right" />
      </div>

      <div className="settings-content">
        {debugMode && (
          <div className="debug-card">
            <div className="debug-title">Debug 模式</div>
            <div className="kv">
              <span className="key">User ID</span>
              <span className="val">{userId || "(空)"}</span>
            </div>
            <div className="kv">
              <span className="key">Token</span>
              <span className="val token">{token || "(空)"}</span>
            </div>
          </div>
        )}
        <div className="list">
          <button
            type="button"
            className="cell cell-danger"
            onClick={handleLogout}
          >
            <span className="label">退出登录</span>
          </button>
        </div>
      </div>
    </div>
  );
}

export default Settings;
