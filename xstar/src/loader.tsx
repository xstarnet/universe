import { StrictMode, useEffect, useState } from "react";
import { createRoot } from "react-dom/client";
import { launchLoader } from "./utils/loader";
import "./loader.scss";
import { WebView } from "@capacitor/core";

function Entry() {
  const [verbose, setVerbose] = useState<string[]>(["拉取 manifest 中..."]);
  const [expanded, setExpanded] = useState(false);
  const run = async () => {
    const loader = launchLoader();
    setVerbose(["拉取 manifest 中..."]);
    try {
      const m = await loader.pullManifest();
      setVerbose((prev) => {
        const next = [...prev];
        if (next.length) next[next.length - 1] = "拉取 manifest 完成";
        else next.push("拉取 manifest 完成");
        next.push("检查文件中...");
        return next;
      });
      const res = await loader.checkFiles(m || {}, true);
      setVerbose((prev) => {
        const next = [...prev];
        next[next.length - 1] = "检查文件完成";
        if (res.missing.length) next.push(`缺失文件: ${res.missing.length}`);
        for (const f of res.missing) next.push(`缺失: ${f}`);
        if (res.extra.length) next.push(`多余文件: ${res.extra.length}`);
        for (const f of res.extra) next.push(`多余: ${f}`);
        return next;
      });
      if (res.extra.length) {
        setVerbose((prev) => [...prev, "删除多余文件开始"]);
        for (const f of res.extra) {
          setVerbose((prev) => [...prev, `删除: ${f}`]);
          await loader.deleteExtras([f]);
        }
        setVerbose((prev) => [...prev, "删除多余文件完成"]);
      }
      if (res.missing.length) {
        setVerbose((prev) => [...prev, "下载缺失文件开始"]);
        for (const f of res.missing) {
          setVerbose((prev) => [...prev, `下载: ${f}`]);
          await loader.downloadMissing([f]);
        }
        setVerbose((prev) => [...prev, "下载缺失文件完成"]);
      }
      const tree = await loader.listAll();
      setVerbose((prev) => {
        const next = [...prev];
        next.push(`当前目录(目录): ${tree.dirs.length}`);
        for (const d of tree.dirs) next.push(`目录: ${d}`);
        next.push(`当前目录(文件): ${tree.files.length}`);
        for (const f of tree.files) next.push(`文件: ${f}`);
        return next;
      });
      const final = await loader.checkFiles(m || {});
      setVerbose((prev) => {
        const next = [...prev];
        if (final.missing.length == 0 && final.extra.length == 0) {
          next.push("全部检查完成");
        }
        if (final.missing.length)
          next.push(`最终缺失文件: ${final.missing.length}`);
        for (const f of final.missing) next.push(`最终缺失: ${f}`);
        if (final.extra.length)
          next.push(`最终多余文件: ${final.extra.length}`);
        for (const f of final.extra) next.push(`最终多余: ${f}`);
        return next;
      });
      if (final.missing.length == 0 && final.extra.length == 0) {
        const root = (await loader.getRootDirUri())?.replaceAll("file://", "");
        if (root) {
          setVerbose((prev) => [...prev, "正在启动"]);
          WebView.setServerBasePath({ path: root });
          window.location.href = "./index.html?ts=" + new Date().getTime();
        }
      }
    } catch (e) {
      setVerbose((prev) => {
        const next = [...prev];
        if (next.length) next[0] = "拉取 manifest 失败";
        else next.push("拉取 manifest 失败");
        next.push(String(e));
        next.push("检查文件中...");
        return next;
      });
    }
  };
  useEffect(() => {
    run();
  }, []);
  const lastLine = verbose.length ? verbose[verbose.length - 1] : "";
  return (
    <div className="loader-page">
      <div className="loader-container">
        <div className="loader-card">
          <div className="actions"></div>
          {expanded && (
            <div className="verbose-list">
              {verbose.map((v, idx) => (
                <div className="verbose-item" key={idx}>
                  {v}
                </div>
              ))}
            </div>
          )}
        </div>
        <div className="bottom-actions">
          <button className="text-button" onClick={run}>
            重新拉取
          </button>
          <button
            className="text-button"
            onClick={async () => {
              const loader = launchLoader();
              setVerbose(() => ["删除中..."]);
              await loader.deleteAll();
              setVerbose((prev) => {
                const next = [...prev];
                next[next.length - 1] = "删除完成";
                return next;
              });
            }}
          >
            全部删除
          </button>
        </div>
        <div className="footer-section">
          <div className="divider" />
          <p className="footer-text" onClick={() => setExpanded((s) => !s)}>
            {lastLine || ""}
          </p>
        </div>
      </div>
    </div>
  );
}

createRoot(document.getElementById("app")!).render(
  <StrictMode>
    <Entry />
  </StrictMode>
);

export default Entry;
