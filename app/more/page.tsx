"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import "./more.css";

const menuItems = [
{
title: "About Us",
description: "Learn about IFC BIZGROWTH and our mission.",
href: "/about",
icon: "about",
},
{
title: "How It Works",
description: "Discover how to find and grow businesses.",
href: "/how-it-works",
icon: "how",
},
{
title: "Help & Support",
description: "Find help with using IFC BIZGROWTH.",
href: "/help",
icon: "help",
},
{
title: "Contact Us",
description: "Get in touch with our team.",
href: "/contact",
icon: "contact",
},
];

function MenuIcon({ name }: { name: string }) {
const common = {
width: 22,
height: 22,
viewBox: "0 0 24 24",
fill: "none",
stroke: "currentColor",
strokeWidth: 1.8,
strokeLinecap: "round" as const,
strokeLinejoin: "round" as const,
"aria-hidden": true as const,
};

switch (name) {
case "about":
return (
<svg {...common}>
<circle cx="12" cy="12" r="9" />
<path d="M12 11v5" />
<path d="M12 8h.01" />
</svg>
);

case "how":
  return (
    <svg {...common}>
      <rect x="3" y="4" width="18" height="16" rx="3" />
      <path d="M7 9h10" />
      <path d="M7 13h6" />
      <path d="m15 16 2 2 3-4" />
    </svg>
  );

case "help":
  return (
    <svg {...common}>
      <circle cx="12" cy="12" r="9" />
      <path d="M9.5 9a2.5 2.5 0 0 1 4.8 1c0 1.8-2.3 2.1-2.3 4" />
      <path d="M12 17h.01" />
    </svg>
  );

case "contact":
  return (
    <svg {...common}>
      <rect x="3" y="5" width="18" height="14" rx="3" />
      <path d="m4 7 8 6 8-6" />
    </svg>
  );

case "report":
  return (
    <svg {...common}>
      <path d="M12 3 22 20H2L12 3Z" />
      <path d="M12 9v4" />
      <path d="M12 17h.01" />
    </svg>
  );

default:
  return null;

}
}

function ChevronIcon() {
return (
<svg
width="18"
height="18"
viewBox="0 0 24 24"
fill="none"
stroke="currentColor"
strokeWidth="1.8"
strokeLinecap="round"
strokeLinejoin="round"
aria-hidden="true"
>
<path d="m9 18 6-6-6-6" />
</svg>
);
}

function BottomNavIcon({ name }: { name: string }) {
const common = {
width: 22,
height: 22,
viewBox: "0 0 24 24",
fill: "none",
stroke: "currentColor",
strokeWidth: 1.8,
strokeLinecap: "round" as const,
strokeLinejoin: "round" as const,
"aria-hidden": true as const,
};

switch (name) {
case "home":
return (
<svg {...common}>
<path d="m3 10 9-7 9 7" />
<path d="M5 9v11h14V9" />
<path d="M9 20v-7h6v7" />
</svg>
);

case "search":
  return (
    <svg {...common}>
      <circle cx="10.8" cy="10.8" r="6.8" />
      <path d="m16 16 4.5 4.5" />
    </svg>
  );

case "categories":
  return (
    <svg {...common}>
      <rect x="3" y="3" width="7" height="7" rx="1.5" />
      <rect x="14" y="3" width="7" height="7" rx="1.5" />
      <rect x="3" y="14" width="7" height="7" rx="1.5" />
      <rect x="14" y="14" width="7" height="7" rx="1.5" />
    </svg>
  );

case "nearby":
  return (
    <svg {...common}>
      <path d="M20 10c0 5-8 11-8 11S4 15 4 10a8 8 0 1 1 16 0Z" />
      <circle cx="12" cy="10" r="2.5" />
    </svg>
  );

case "more":
  return (
    <svg {...common}>
      <circle cx="5" cy="12" r="1" />
      <circle cx="12" cy="12" r="1" />
      <circle cx="19" cy="12" r="1" />
    </svg>
  );

default:
  return null;

}
}

export default function MorePage() {
const pathname = usePathname();

return (
<main className="more-page">
<header className="more-header">
<div className="more-header-inner">
<Link href="/discover" className="more-brand" aria-label="IFC BIZGROWTH home">
<span className="more-brand-mark">IFC</span>

        <span className="more-brand-name">
          IFC <strong>BIZGROWTH</strong>
        </span>
      </Link>

      <Link href="/login" className="more-header-login">
        Log in
      </Link>
    </div>
  </header>

  <section className="more-hero">
    <div className="more-hero-inner">
      <div className="more-eyebrow">
        <span className="more-eyebrow-dot" />
        YOUR GUIDE TO IFC BIZGROWTH
      </div>

      <h1>
        More about <span>us.</span>
      </h1>

      <p>
        Everything you need to know about IFC BIZGROWTH, from getting
        started to contacting our team.
      </p>
    </div>

    <div className="more-hero-decoration" aria-hidden="true">
      <div className="more-decoration-circle circle-one" />
      <div className="more-decoration-circle circle-two" />
      <div className="more-decoration-circle circle-three" />
    </div>
  </section>

  <section className="more-content">
    <div className="more-section-heading">
      <div>
        <span className="more-section-label">EXPLORE</span>
        <h2>How can we help?</h2>
      </div>

      <p>Choose an option to continue.</p>
    </div>

    <div className="more-menu">
      <Link href="/login" className="more-menu-item more-account-item">
        <span className="more-menu-icon account-icon">
          <svg
            width="23"
            height="23"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <circle cx="12" cy="8" r="4" />
            <path d="M4 21v-2a8 8 0 0 1 16 0v2" />
          </svg>
        </span>

        <span className="more-menu-copy">
          <strong>Login / Create Account</strong>
          <span>Sign in or create your account to get started.</span>
        </span>

        <span className="more-menu-chevron">
          <ChevronIcon />
        </span>
      </Link>

      {menuItems.map((item) => (
        <Link
          href={item.href}
          className="more-menu-item"
          key={item.title}
        >
          <span className="more-menu-icon">
            <MenuIcon name={item.icon} />
          </span>

          <span className="more-menu-copy">
            <strong>{item.title}</strong>
            <span>{item.description}</span>
          </span>

          <span className="more-menu-chevron">
            <ChevronIcon />
          </span>
        </Link>
      ))}

      <a
        href="mailto:report@ifcbizgrowth.africa?subject=Business%20Report"
        className="more-menu-item more-report-item"
      >
        <span className="more-menu-icon report-icon">
          <MenuIcon name="report" />
        </span>

        <span className="more-menu-copy">
          <strong>Report a Business</strong>
          <span>
            Let us know about inaccurate or inappropriate business
            information.
          </span>
          <span className="more-report-email">
            report@ifcbizgrowth.africa
          </span>
        </span>

        <span className="more-menu-chevron">
          <ChevronIcon />
        </span>
      </a>
    </div>

    <div className="more-contact-banner">
      <div className="more-contact-symbol" aria-hidden="true">
        <svg
          width="25"
          height="25"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.7"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M21 11.5a8.4 8.4 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.4 8.4 0 0 1-3.8-.9L3 21l1.9-5.7a8.4 8.4 0 0 1-.9-3.8A8.5 8.5 0 0 1 8.7 3.9a8.4 8.4 0 0 1 3.8-.9h.5a8.5 8.5 0 0 1 8 8v.5Z" />
        </svg>
      </div>

      <div className="more-contact-copy">
        <strong>We're here to help.</strong>
        <span>
          Have a question? Visit Contact Us to reach our team.
        </span>
      </div>

      <Link href="/contact" className="more-contact-link">
        Get help <ChevronIcon />
      </Link>
    </div>
  </section>

  <footer className="more-footer">
    <div className="more-footer-inner">
      <Link href="/discover" className="more-footer-brand">
        IFC <strong>BIZGROWTH</strong>
      </Link>

      <p>
        Helping businesses get discovered and grow.
      </p>

      <span className="more-copyright">
        © {new Date().getFullYear()} IFC BIZGROWTH
      </span>
    </div>
  </footer>

  <nav className="more-bottom-nav" aria-label="Main navigation">
    <Link
      href="/discover"
      className={pathname === "/discover" ? "active" : ""}
    >
      <BottomNavIcon name="home" />
      <span>Home</span>
    </Link>

    <Link
      href="/businesses"
      className={pathname === "/businesses" ? "active" : ""}
    >
      <BottomNavIcon name="search" />
      <span>Search</span>
    </Link>

    <Link
      href="/categories"
      className={
        pathname === "/categories" || pathname.startsWith("/categories/")
          ? "active"
          : ""
      }
    >
      <BottomNavIcon name="categories" />
      <span>Categories</span>
    </Link>

    <Link href="/businesses?nearby=true">
      <BottomNavIcon name="nearby" />
      <span>Nearby</span>
    </Link>

    <Link href="/more" className="active" aria-current="page">
      <BottomNavIcon name="more" />
      <span>More</span>
    </Link>
  </nav>
</main>

);
}
