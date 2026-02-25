import { useEffect, useMemo, useState } from "react";
import "./TodoModule.scss";
import { preferences } from "../../utils/preferences";

type TodoItem = { id: string; text: string; done: boolean };
const seedItems: TodoItem[] = [
  { id: "s1", text: "复盘昨天任务", done: false },
  { id: "s2", text: "安排本周目标", done: false },
  { id: "s3", text: "清理下载文件", done: false },
  { id: "s4", text: "阅读行业资讯", done: false },
  { id: "s5", text: "备份重要文件", done: false },
  { id: "s6", text: "更新依赖库版本", done: false },
];

function TodoModule() {
  const [items, setItems] = useState<TodoItem[]>(() => {
    try {
      const raw = preferences.get("home.todo.items");
      if (raw) {
        const parsed = JSON.parse(raw) as TodoItem[];
        if (Array.isArray(parsed)) {
          const seededFlagKey = "home.todo.seeded.v2";
          const seeded = preferences.get(seededFlagKey) === "1";
          if (!seeded) {
            const exists = new Set(parsed.map((i) => i.text));
            const toAdd = seedItems.filter((i) => !exists.has(i.text));
            const merged = [...parsed, ...toAdd];
            try {
              // 使用异步设置，但不等待结果
              void preferences.set("home.todo.items", JSON.stringify(merged));
              void preferences.set(seededFlagKey, "1");
            } catch {
              void 0;
            }
            return merged;
          }
          return parsed;
        }
      }
    } catch {
      void 0;
    }
    return [
      { id: "m1", text: "查看今日安排", done: false },
      { id: "m2", text: "处理未读邮件", done: false },
      { id: "m3", text: "更新项目进度", done: true },
      { id: "m4", text: "准备周会材料", done: false },
      { id: "m5", text: "同步代码并自测", done: false },
      ...seedItems,
    ];
  });

  const storageKey = "home.todo.items";

  useEffect(() => {
    try {
      void preferences.set(storageKey, JSON.stringify(items));
    } catch {
      void 0;
    }
  }, [items]);

  const remainingCount = useMemo(
    () => items.filter((i) => !i.done).length,
    [items]
  );

  const visible = items.slice(0, 3);

  const toggleItem = (id: string) => {
    setItems((prev) =>
      prev.map((i) => (i.id === id ? { ...i, done: !i.done } : i))
    );
  };

  const removeItem = (id: string) => {
    setItems((prev) => prev.filter((i) => i.id !== id));
  };

  return (
    <div className="todo-module card">
      <div className="section">
        <div className="section-title">TODO</div>
        <div className="todo-list" aria-label="待办列表">
          {items.length === 0 ? (
            <div className="empty">暂无待办</div>
          ) : (
            visible.map((item) => (
              <div
                key={item.id}
                className="todo-item"
                role="button"
                tabIndex={0}
              >
                <button
                  className={`check ${item.done ? "checked" : ""}`}
                  type="button"
                  aria-label={item.done ? "标记为未完成" : "标记为完成"}
                  onClick={() => toggleItem(item.id)}
                >
                  <i
                    className={
                      item.done ? "ri-checkbox-line" : "ri-checkbox-blank-line"
                    }
                    aria-hidden="true"
                  />
                </button>
                <div className={`text ${item.done ? "done" : ""}`}>
                  {item.text}
                </div>
                <button
                  className="remove"
                  type="button"
                  aria-label="删除待办"
                  onClick={() => removeItem(item.id)}
                >
                  <i className="ri-delete-bin-line" aria-hidden="true" />
                </button>
              </div>
            ))
          )}
        </div>
      </div>
      <div className="footer-center">
        <div className="footer-meta">{remainingCount} 项未完成</div>
      </div>
    </div>
  );
}

export default TodoModule;
