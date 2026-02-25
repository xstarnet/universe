import { Outlet, useLocation } from "react-router-dom";
import { useEffect, useMemo, useRef } from "react";
import BottomNav from "../BottomNav";
import "./AppLayout.scss";

function AppLayout() {
  const location = useLocation();
  const isMiro = useMemo(
    () => location.pathname.startsWith("/miro"),
    [location.pathname],
  );
  const iframeRef = useRef<HTMLIFrameElement | null>(null);
  const initializedRef = useRef(false);

  useEffect(() => {
    if (isMiro && !initializedRef.current && iframeRef.current) {
      iframeRef.current.src = "https://dr.miromind.ai/";
      initializedRef.current = true;
    }
  }, [isMiro]);

  return (
    <div className="app-layout">
      <div className="app-content">
        <Outlet />
      </div>
      <div
        className={`persistent-iframe-layer ${isMiro ? "visible" : "hidden"}`}
      >
        <iframe ref={iframeRef} title="MiroPersistent" />
      </div>
      <BottomNav />
    </div>
  );
}

export default AppLayout;
