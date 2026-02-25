import { useState } from "react";
import "./AIModule.scss";

type CompletedItem = { text: string; ts: Date };

function AIModule() {
  const [input, setInput] = useState("");
  const now = new Date();
  const [completed, setCompleted] = useState<CompletedItem[]>([
    { text: "整理今日新闻摘要", ts: new Date(now.getTime() - 45 * 60 * 1000) },
    { text: "优化图片资源缓存", ts: new Date(now.getTime() - 20 * 60 * 1000) },
    {
      text: "生成本周工作周报草稿",
      ts: new Date(now.getTime() - 5 * 60 * 1000),
    },
  ]);

  const fmt = (d: Date) => {
    const mm = String(d.getMonth() + 1).padStart(2, "0");
    const dd = String(d.getDate()).padStart(2, "0");
    const hh = String(d.getHours()).padStart(2, "0");
    const mi = String(d.getMinutes()).padStart(2, "0");
    return `${mm}-${dd} ${hh}:${mi}`;
  };

  const handleCreate = () => {
    const text = input.trim();
    if (!text) return;
    setCompleted((prev) => [{ text, ts: new Date() }, ...prev]);
    setInput("");
  };

  return (
    <div className="ai-module card">
      <div className="section tasks-section">
        <div className="section-title">我的任务</div>
        <div className="ai-tasks">
          {completed.slice(0, 3).map((t, i) => (
            <div
              key={i}
              className="task-item completed"
              role="button"
              tabIndex={0}
              aria-label={`${t.text} ${fmt(t.ts)}`}
            >
              <div className="task-text">{t.text}</div>
              <div className="task-time">{fmt(t.ts)}</div>
            </div>
          ))}
        </div>
      </div>
      <div className="section-divider" />
      <div className="section">
        <div className="section-title">创建任务</div>
        <div className="composer fixed" aria-label="对话框输入区">
          <div className="compose-box">
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="愿此行，终抵群星"
              aria-label="输入内容"
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleCreate();
                }
              }}
            />
            <button
              className="send-inside"
              type="button"
              onClick={handleCreate}
              aria-label="发送"
            >
              发送
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AIModule;
