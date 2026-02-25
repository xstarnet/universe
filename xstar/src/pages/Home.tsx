import { type CSSProperties, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Home.scss";

// --- Components from original file ---

function NewsRotator({
  items,
  intervalMs = 8000,
}: {
  items: { title: string; content: string }[];
  intervalMs?: number;
}) {
  const [index, setIndex] = useState(0);
  useEffect(() => {
    if (items.length <= 1) return;
    const timer = setInterval(() => {
      setIndex((i) => (i + 1) % items.length);
    }, intervalMs);
    return () => clearInterval(timer);
  }, [items.length, intervalMs]);

  const current = items[index] ?? items[0];
  return (
    <div className="news-rotator-hero">
      <div className="news-content-wrapper">
        <div className="news-title">{current.title}</div>
        <div className="news-desc">{current.content}</div>
      </div>
      <div className="news-pagination">
        {items.map((_, i) => (
          <div key={i} className={`dot ${i === index ? "active" : ""}`} />
        ))}
      </div>
    </div>
  );
}

// --- Data from original file ---

const quickAppsData = [
  {
    id: "ledger",
    title: "家庭账簿",
    iconClass: "ri-book-2-fill",
    href: "/ledger",
    bg: "bg-green",
    color: "#009966",
  },
  {
    id: "miro",
    title: "Miro",
    iconClass: "",
    href: "/miro",
    bg: "bg-blue",
    color: "#5DDBD1",
  },
  {
    id: "alipay",
    title: "支付宝",
    iconClass: "ri-alipay-fill",
    href: "/alipay",
    bg: "bg-blue",
    color: "#1677FF",
  },
  {
    id: "taobao",
    title: "淘宝",
    iconClass: "ri-taobao-fill",
    href: "/taobao",
    bg: "bg-orange",
    color: "#FF5000",
  },
  {
    id: "tiktok",
    title: "抖音",
    iconClass: "ri-tiktok-fill",
    href: "/tiktok",
    bg: "bg-pink",
    color: "#000000",
  },
  {
    id: "youtube",
    title: "YouTube",
    iconClass: "ri-youtube-fill",
    href: "/youtube",
    bg: "bg-red",
    color: "#FF0000",
  },
  {
    id: "telegram",
    title: "Telegram",
    iconClass: "ri-telegram-fill",
    href: "/telegram",
    bg: "bg-purple",
    color: "#24A1DE",
  },
  {
    id: "whatsapp",
    title: "WhatsApp",
    iconClass: "ri-whatsapp-line",
    href: "/whatsapp",
    bg: "bg-green",
    color: "#25D366",
  },
  {
    id: "gmail",
    title: "Gmail",
    iconClass: "ri-mail-fill",
    href: "/gmail",
    bg: "bg-yellow",
    color: "#EA4335",
  },
  {
    id: "maps",
    title: "地图",
    iconClass: "ri-map-pin-fill",
    href: "/maps",
    bg: "bg-gray",
    color: "#4285F4",
  },
  {
    id: "github",
    title: "GitHub",
    iconClass: "ri-github-fill",
    href: "/github",
    bg: "bg-gray",
    color: "#333333",
  },
];

const newsData = [
  {
    title: "OpenAI 推出新多模态模型",
    content:
      "新模型在语音、图像与文本推理方面全面升级，速度与稳定性显著提升，适配更多端侧场景。",
  },
  {
    title: "苹果推进本地化 AI 研发",
    content:
      "聚焦隐私与端侧推理能力，强调在不上传数据的前提下完成常用智能任务，提升用户体验。",
  },
  {
    title: "特斯拉 FSD 进入更多城市",
    content:
      "自动驾驶能力与路况适配进一步优化，城市道路通行体验提升，重点加强复杂路口处理。",
  },
  {
    title: "英伟达发布新一代 GPU",
    content:
      "面向大模型训练的计算平台升级，能效比与吞吐提升，为企业级 AI 部署提供更强性能。",
  },
];

function Home() {
  const navigate = useNavigate();
  const [searchValue, setSearchValue] = useState("");

  // Split apps into Core (Top 4) and Shortcuts (Rest)
  const coreApps = quickAppsData.filter(
    (app) => app.id === "ledger" || app.id === "miro",
  );

  return (
    <div className="home-page-v2">
      {/* Lightweight Navigation Area - Merged into Scroll Container */}

      <div className="scroll-container">
        {/* Search Box */}
        <div className="search-box">
          <i className="ri-search-line search-icon" />
          <input
            type="text"
            className="search-input"
            placeholder="搜索功能、服务..."
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
          />
        </div>

        {/* Top Assistant Type (Hero Card) - Now News Rotator */}
        <div className="section top-hero-section">
          <div className="hero-card news-hero">
            <NewsRotator items={newsData} intervalMs={5000} />
          </div>
        </div>

        {/* Core Assistant Function Area - Top 4 Apps */}
        <div className="section core-functions-section">
          <div className="functions-grid">
            {coreApps.map((app) => (
              <div
                key={app.id}
                className="function-item"
                onClick={() => navigate(app.href)}
              >
                <div
                  className={`icon-circle ${app.id === "miro" ? "miro-icon-circle" : ""}`}
                  style={
                    {
                      "--icon-bg": app.id === "miro" ? "white" : app.color,
                    } as CSSProperties
                  }
                >
                  {app.id === "miro" ? (
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 64 64"
                      className="miro-icon"
                    >
                      <path
                        fill="#5DDBD1"
                        fillRule="evenodd"
                        d="M6.973 53.605A2.91 2.91 0 0 1 4.244 55.5c-2.045 0-3.453-2.052-2.717-3.96l15.487-40.162a4.496 4.496 0 0 1 8.39 0L40.89 51.54a2.912 2.912 0 1 1-5.446 2.065L21.469 16.116a.278.278 0 0 0-.52 0L6.973 53.606Z"
                        clipRule="evenodd"
                      ></path>
                      <path
                        fill="#000"
                        fillRule="evenodd"
                        d="M29.805 53.643c-.415 1.113-1.52 1.857-2.76 1.857-2.038 0-3.454-1.93-2.751-3.752l15.613-40.49C40.547 9.6 42.203 8.5 44.056 8.5s3.51 1.101 4.148 2.758l15.614 40.49c.702 1.821-.713 3.752-2.75 3.752-1.24 0-2.347-.744-2.762-1.857L44.313 16.11a.27.27 0 0 0-.257-.174.27.27 0 0 0-.258.174z"
                        clipRule="evenodd"
                      ></path>
                    </svg>
                  ) : (
                    <i className={app.iconClass} />
                  )}
                </div>
                <span className="function-label">{app.title}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Lightweight Assistant Feedback Area - News Feed - REMOVED */}

        {/* Restored Modules - REMOVED */}

        {/* Spacer for bottom nav */}
        <div className="bottom-spacer" />
      </div>
    </div>
  );
}

export default Home;
