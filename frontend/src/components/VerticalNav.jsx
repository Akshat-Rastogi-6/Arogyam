import React, { useState } from "react";
import "./VerticalNav.css";
import AccountOverlay from "./AccountOverlay.jsx"; // new import

const navItems = [
  { id: "profile", label: "Profile", icon: "icon-chat", url: "/profile" },
  {
    id: "dashboard",
    label: "Dashboard",
    icon: "icon-dashboard",
    url: "/dashboard",
  },
  { id: "rantbot", label: "RantBot", icon: "icon-chat", url: "/rantbot" },
  { id: "update", label: "User Info", icon: "icon-update", url: "/update" }, // renamed from Update Profile
  {
    id: "notification",
    label: "Notification",
    icon: "icon-notification",
    url: "/notification",
  },
  {
    id: "account",
    label: "Account",
    icon: "icon-account" /* no url needed for overlay */,
  },
];

const VerticalNav = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [activeItem, setActiveItem] = useState("profile");
  const [overlayOpen, setOverlayOpen] = useState(false);

  const handleItemClick = (item) => {
    setActiveItem(item.id);
    if (item.id === "account") {
      setOverlayOpen(true);
    } else {
      // Redirect to the specified URL for non-overlay items
      window.location.href = item.url;
    }
  };

  return (
    <>
      <nav className="vertical-nav">
        <div className="logo">Arogyam</div>
        <button className="menu-toggle" onClick={() => setMenuOpen(!menuOpen)}>
          Menu
        </button>
        <ul className={menuOpen ? "open" : ""}>
          {navItems.map((item) => (
            <li
              key={item.id}
              className={activeItem === item.id ? "active" : ""}
              onClick={() => handleItemClick(item)}
            >
              <i className={item.icon} /> {item.label}
            </li>
          ))}
        </ul>
      </nav>
      {overlayOpen && (
        <AccountOverlay closeOverlay={() => setOverlayOpen(false)} />
      )}
    </>
  );
};

export default VerticalNav;
