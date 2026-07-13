import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '../ui/Button';
import { useOrderFlow } from '../../hooks/useOrderFlow';

const LINKS = [
  { href: '#about', label: 'About' },
  { href: '#merchandise', label: 'Merch' },
  { href: '#pricing', label: 'Pricing' },
];

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const {
    state: { items },
    dispatch,
  } = useOrderFlow();
  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);

  useEffect(() => {
    function onScroll() {
      setScrolled(window.scrollY > 24);
    }
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <header
      className={`sticky top-0 z-40 border-b transition-all duration-300 ${
        scrolled
          ? 'border-white/10 bg-mora-black/95 backdrop-blur-md'
          : 'border-transparent bg-transparent'
      }`}
    >
      <nav className="mx-auto flex max-w-6xl items-center justify-between px-6 py-5">
        <Link to="/" className="flex items-center gap-2.5">
          <img
            src="/WhatsApp_Image_2026-07-06_at_11.37.36-removebg-preview.png"
            alt="MORA Baseball"
            className="h-8 w-auto brightness-0 invert"
          />
          <span className="hidden text-sm font-black uppercase tracking-[0.25em] text-mora-gold md:inline">
            MORA Baseball
          </span>
        </Link>
        <div className="hidden items-center gap-10 text-xs font-bold uppercase tracking-[0.2em] text-mora-white/70 md:flex">
          {LINKS.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="group relative py-1 hover:text-mora-white transition-colors"
            >
              {link.label}
              <span className="absolute -bottom-0.5 left-0 h-[2px] w-0 bg-mora-gold transition-all duration-300 group-hover:w-full" />
            </a>
          ))}
        </div>
        <div className="relative">
          <Button
            shape="sharp"
            onClick={() => dispatch({ type: 'OPEN_MODAL', step: 1 })}
            className="border-2 border-mora-gold px-6 py-2.5 text-xs uppercase tracking-widest"
          >
            Pre-Order
          </Button>
          {itemCount > 0 && (
            <span className="absolute -right-2 -top-2 flex h-5 min-w-5 items-center justify-center rounded-full bg-red-600 px-1 text-[11px] font-bold leading-none text-white">
              {itemCount}
            </span>
          )}
        </div>
      </nav>
    </header>
  );
}
