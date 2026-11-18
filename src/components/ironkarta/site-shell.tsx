import { Link } from "@tanstack/react-router";
import { Heart, ArrowUpRight } from "lucide-react";
import { AccountMenu } from "./account-menu";

export function Ornament() {
  return (
    <svg viewBox="0 0 48 56" className="brand-symbol" fill="none" aria-hidden="true">
      <path
        d="m24 3 5 5-5 5-5-5 5-5Zm0 40 5 5-5 5-5-5 5-5ZM3 27l5-5 5 5-5 5-5-5Zm32 0 5-5 5 5-5 5-5-5Z"
        fill="currentColor"
      />
      <path
        d="m14 12 10 10 10-10M14 42l10-10 10 10M12 17l10 10-10 10m24-20L26 27l10 10"
        stroke="currentColor"
        strokeWidth="4"
      />
      <path
        d="m13 8 4 4-4 4-4-4 4-4Zm22 0 4 4-4 4-4-4 4-4ZM13 38l4 4-4 4-4-4 4-4Zm22 0 4 4-4 4-4-4 4-4Z"
        fill="currentColor"
      />
    </svg>
  );
}
export function SiteHeader() {

  return (
    <header className="site-header">
      <Link to="/" className="brand">
        <Ornament />
        <span className="brand-divider" />
        <span>Иронкарта</span>
      </Link>
      <nav aria-label="Главное меню" className="header-nav">
        <Link to="/" activeOptions={{ exact: true }} className="nav-link">
          Карта
        </Link>
        <Link to="/stories" className="nav-link">
          Истории фамилий
        </Link>
        <Link to="/about" className="nav-link">
          О проекте
        </Link>
        <AccountMenu/>
      </nav>
      <span className="header-note">
        <Heart size={13} /> Из Осетии. С любовью.
      </span>
    </header>
  );
}
export function SiteFooter() {
  return (
    <footer className="site-footer">
      <span>
        <span className="footer-brand">Иронкарта</span> · Связь, которая не знает границ
      </span>
      <Link to="/privacy">Конфиденциальность</Link>
      <Link to="/about" className="inline-flex items-center gap-1">
        Сделано с любовью к своим <ArrowUpRight size={12} />
      </Link>
    </footer>
  );
}
