import { useLocation, useNavigate } from "react-router-dom";
import "./BottomNav.scss";

const navItems = [
  { id: "home", title: "首页", icon: "ri-home-5-line", href: "/home" },
  { id: "settings", title: "我的", icon: "ri-user-line", href: "/settings" },
];

function BottomNav() {
  const navigate = useNavigate();
  const location = useLocation();

  const activeId = (() => {
    const path = location.pathname;
    if (path === "/home" || path.startsWith("/ledger")) return "home";
    if (path.startsWith("/settings")) return "settings";
    return "";
  })();

  return (
    <div className="bottom-nav-bar">
      {navItems.map((item) => (
        <div
          key={item.id}
          className={`nav-item ${activeId === item.id ? "active" : ""}`}
          onClick={() => navigate(item.href)}
        >
          <i className={item.icon} />
          <span className="nav-label">{item.title}</span>
        </div>
      ))}
    </div>
  );
}

export default BottomNav;

