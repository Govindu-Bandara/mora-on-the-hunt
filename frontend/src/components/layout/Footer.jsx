export function Footer() {
  return (
    <footer className="border-t-4 border-mora-gold bg-mora-black px-6 py-12 text-center text-sm text-mora-white/60">
      <img
        src="/WhatsApp_Image_2026-07-06_at_11.37.36-removebg-preview.png"
        alt="MORA Baseball"
        className="mx-auto mb-4 h-10 w-auto brightness-0 invert"
      />
      <p className="font-slogan mb-3 text-xl text-mora-gold">#MORA on the Hunt</p>
      <p className="mb-1 text-xs font-bold uppercase tracking-[0.2em] text-mora-white/50">
        Organized independently by MORA Baseball
      </p>
      <p className="mt-3 text-sm text-mora-white/50">
        Contact:{' '}
        <a href="tel:0764172394" className="font-medium hover:text-mora-gold">
          Akila 0764172394
        </a>
        <span className="mx-2 text-mora-white/30">·</span>
        <a href="tel:0713902158" className="font-medium hover:text-mora-gold">
          Nethindu 0713902158
        </a>
      </p>
      <p className="mx-auto mt-4 max-w-xl px-6 text-mora-white/40">
        This is not an official University of Moratuwa website or merchandise store. It is an
        independent campaign organized by the MORA Baseball team to build excitement for the
        Inter University Games.
      </p>
      <p className="mt-6 text-xs text-mora-white/30">
        &copy; {new Date().getFullYear()} MORA Baseball. All rights reserved.
      </p>
    </footer>
  );
}
