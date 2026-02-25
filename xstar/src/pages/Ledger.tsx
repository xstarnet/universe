import { useEffect, useMemo, useState } from "react";
import { Toast } from "antd-mobile";
import { api } from "../api";
import "./Ledger.scss";

type ViewEntry = {
  id: string;
  category_id: string;
  category_name: string;
  amount: number;
  updatedAt: number;
};

function formatDate(ts: number) {
  try {
    return new Date(ts).toLocaleDateString("zh-CN", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    });
  } catch {
    return "未记录";
  }
}

function isToday(ts: number) {
  try {
    const d = new Date(ts);
    const now = new Date();
    return (
      d.getFullYear() === now.getFullYear() &&
      d.getMonth() === now.getMonth() &&
      d.getDate() === now.getDate()
    );
  } catch {
    return false;
  }
}

function formatAmount(n: number, unit: "千" | "万" | "元") {
  try {
    if (unit === "元") {
      return new Intl.NumberFormat("zh-CN", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }).format(n);
    }
    return new Intl.NumberFormat("zh-CN", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(n);
  } catch {
    return unit === "元" ? String(n) : n.toFixed(2);
  }
}

function scaleAmount(n: number, unit: "千" | "万" | "元") {
  if (unit === "千") return n / 1000;
  if (unit === "万") return n / 10000;
  return n;
}

function nextUnit(u: "千" | "万" | "元") {
  return u === "万" ? "千" : u === "千" ? "元" : "万";
}

function Ledger() {
  const [entries, setEntries] = useState<ViewEntry[]>([]);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [formCategory, setFormCategory] = useState("");
  const [formAmount, setFormAmount] = useState("");
  const [unit, setUnit] = useState<"千" | "万" | "元">("万");
  const isEditing = editingIndex !== null;

  const total = useMemo(
    () => entries.reduce((sum, it) => sum + it.amount, 0),
    [entries]
  );
  const sortedEntries = useMemo(
    () =>
      [...entries].sort((a, b) =>
        a.category_name.localeCompare(b.category_name, "zh", {
          sensitivity: "base",
        })
      ),
    [entries]
  );

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await api.ledger.ListLedgerEntries({
          body: { start_date: "" },
        });
        const list = Array.isArray(res.entries) ? res.entries : [];
        const mapped: ViewEntry[] = list
          .filter(
            (e) =>
              typeof e?.id === "string" &&
              typeof e?.category_id === "string" &&
              typeof e?.category_name === "string" &&
              typeof e?.amount === "number" &&
              typeof e?.updated_at === "string"
          )
          .map((e) => ({
            id: e.id,
            category_id: e.category_id,
            category_name: e.category_name,
            amount: e.amount,
            updatedAt: Number.isNaN(Date.parse(e.updated_at))
              ? Date.now()
              : Date.parse(e.updated_at),
          }));
        if (!cancelled) {
          setEntries(mapped);
          void 0;
        }
      } catch {
        void 0;
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const handleAdd = () => {
    setEditingIndex(null);
    setFormCategory("");
    setFormAmount("");
    setModalOpen(true);
  };

  const openEditModal = (idx: number) => {
    const prev = entries[idx];
    if (!prev) return;
    setEditingIndex(idx);
    setFormCategory(prev.category_name);
    setFormAmount(String(prev.amount));
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
  };

  const submitModal = async () => {
    const category = formCategory.trim();
    const amount = parseFloat(formAmount);
    if (!category) {
      Toast.show({ content: "请输入分类" });
      return;
    }
    if (Number.isNaN(amount)) {
      Toast.show({ content: "金额需为数字" });
      return;
    }
    if (isEditing && editingIndex !== null) {
      const prev = entries[editingIndex];
      if (!prev) return;
      try {
        const res = await api.ledger.UpdateLedgerEntry({
          body: {
            category_id: prev.category_id,
            category_name:
              category !== prev.category_name ? category : undefined,
            amount: amount !== prev.amount ? amount : undefined,
          },
        });
        const e = res.entry;
        const nextItem: ViewEntry = {
          id: e.id,
          category_id: e.category_id,
          category_name: e.category_name,
          amount: e.amount,
          updatedAt: Number.isNaN(Date.parse(e.updated_at))
            ? Date.now()
            : Date.parse(e.updated_at),
        };
        setEntries((list) =>
          list.map((x, i) => (i === editingIndex ? nextItem : x))
        );
        Toast.show({ content: "保存成功" });
      } catch {
        void 0;
      }
    } else {
      try {
        const res = await api.ledger.CreateLedgerEntry({
          body: { category_name: category, amount },
        });
        const e = res.entry;
        const nextItem: ViewEntry = {
          id: e.id,
          category_id: e.category_id,
          category_name: e.category_name,
          amount: e.amount,
          updatedAt: Number.isNaN(Date.parse(e.updated_at))
            ? Date.now()
            : Date.parse(e.updated_at),
        };
        setEntries((list) => [nextItem, ...list]);
        Toast.show({ content: "新增成功" });
      } catch {
        void 0;
      }
    }
    setModalOpen(false);
  };

  const handleDeleteCurrent = async () => {
    if (editingIndex === null) return;
    const prev = entries[editingIndex];
    if (!prev) return;
    try {
      await api.ledger.DeleteLedgerEntry({
        body: { category_id: prev.category_id },
      });
      setEntries((list) =>
        list.filter((e) => e.category_id !== prev.category_id)
      );
      Toast.show({ content: "删除成功" });
      setModalOpen(false);
    } catch {
      void 0;
    }
  };

  return (
    <div className="page ledger-page">
      <div className="header">
        <div className="title">家庭账簿</div>
      </div>

      <div className="content">
        <div className="card">
          <div className="summary-row">
            <div
              className="summary-value"
              role="button"
              tabIndex={0}
              aria-label="点击切换单位"
              onClick={() => setUnit(nextUnit(unit))}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  setUnit(nextUnit(unit));
                }
              }}
            >
              <span className="currency">¥</span>
              <span className="amount-number">
                {formatAmount(scaleAmount(total, unit), unit)}
              </span>
              <span className="unit-label">{unit}</span>
            </div>
            <div className="summary-actions">
              <button
                type="button"
                className="add-button"
                onClick={handleAdd}
                aria-label="新增"
              >
                <i className="ri-add-line" aria-hidden="true" />
              </button>
            </div>
          </div>
          <div className="items-list">
            {sortedEntries.map((it) => (
              <div
                key={it.id}
                className="item-block"
                onClick={() => {
                  const originalIdx = entries.findIndex((e) => e.id === it.id);
                  openEditModal(originalIdx);
                }}
              >
                <div className="item-row">
                  <div className="item-left">
                    <div className="item-category">{it.category_name}</div>
                    <div className="item-updated">
                      {formatDate(it.updatedAt)}
                    </div>
                  </div>
                  <div className="item-amount">
                    <span className="currency">¥</span>
                    <span className="amount-number">
                      {formatAmount(scaleAmount(it.amount, unit), unit)}
                    </span>
                    <span className="unit-label">{unit}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
        {modalOpen && (
          <div className="modal-mask" onClick={closeModal}>
            <div
              className="modal-panel"
              role="dialog"
              aria-modal="true"
              aria-label={isEditing ? "编辑账目" : "新增账目"}
              onClick={(e) => e.stopPropagation()}
            >
              <button
                type="button"
                className="modal-close"
                aria-label="关闭"
                onClick={closeModal}
              >
                <i className="ri-close-line" aria-hidden="true" />
              </button>
              <div className="modal-title">
                {isEditing ? "编辑账目" : "新增账目"}
              </div>
              <div className="form-group">
                <div className="form-row">
                  <label className="form-label">名目</label>
                  <input
                    className="form-input"
                    type="text"
                    value={formCategory}
                    onChange={(e) => setFormCategory(e.target.value)}
                    placeholder="如：XX银行/股票"
                  />
                </div>
                <div className="form-row">
                  <label className="form-label">金额</label>
                  <input
                    className="form-input"
                    type="number"
                    inputMode="decimal"
                    value={formAmount}
                    onChange={(e) => setFormAmount(e.target.value)}
                    placeholder="请输入数字"
                  />
                </div>
              </div>
              <div className="modal-actions">
                <button
                  type="button"
                  className="modal-button save"
                  onClick={submitModal}
                >
                  {!isEditing ||
                  editingIndex === null ||
                  !isToday(entries[editingIndex]?.updatedAt)
                    ? "保存"
                    : "更改"}
                </button>
                {isEditing && (
                  <button
                    type="button"
                    className="modal-button delete"
                    onClick={handleDeleteCurrent}
                  >
                    删除
                  </button>
                )}
                {isEditing && (
                  <div className="editing-hint">
                    若此记录的最后更新时间是今天，则直接更新金额，否则创建新记录。
                    删除不会清除条目，而是更改或者新增0金额记录，0金额记录不会被展示。
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default Ledger;
