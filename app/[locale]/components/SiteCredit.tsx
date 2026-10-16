/* The designer's credit, pinned to the bottom of the window on every public
   page. It lives in the locale layout rather than in each footer so no page
   can be missing it — the homepage footer, for one, only shows on its last
   section. The wrapper ignores the pointer so only the pill itself takes
   clicks; z-40 keeps it above the page and the header (z-30) but under modals
   (z-50). The footers carry extra bottom padding so it never sits on top of
   their text at the end of a page. */
export function SiteCredit() {
  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-[max(0.75rem,env(safe-area-inset-bottom))] z-40 flex justify-center px-4">
      <a
        href="https://espark.dev"
        target="_blank"
        rel="noopener noreferrer"
        dir="ltr"
        className="pointer-events-auto rounded-full border border-line bg-card/85 px-3 py-1 text-xs text-ink-muted shadow-sm backdrop-blur transition hover:text-ink"
      >
        Designed by <span className="font-semibold text-accent">espark.dev</span>
      </a>
    </div>
  );
}
