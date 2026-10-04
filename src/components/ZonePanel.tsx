"use client";

import { AnimatePresence, motion } from "motion/react";
import { useNavigation } from "@/lib/navigation";
import { useIsMobile } from "@/lib/media";
import { getZone, NAV_ZONES, type ZoneId } from "@/lib/zones";

export function ZonePanel() {
  const { active, reducedMotion, setActive } = useNavigation();
  const zone = getZone(active);
  const mobile = useIsMobile();

  return (
    <>
      {/* Desktop: edge-bleed copy · Mobile: bottom sheet above dock */}
      <div
        className={
          mobile
            ? "pointer-events-none fixed inset-x-0 bottom-[calc(4.25rem+env(safe-area-inset-bottom))] z-30"
            : "pointer-events-none fixed inset-x-0 top-0 z-30 h-full md:w-[min(420px,38vw)]"
        }
      >
        {!mobile && (
          <>
            {/* Dense left veil so floor rings / metal can't wash out type */}
            <div
              className="absolute inset-0 bg-[linear-gradient(90deg,rgba(4,6,10,0.96)_0%,rgba(4,6,10,0.88)_38%,rgba(4,6,10,0.55)_68%,transparent_100%)]"
              aria-hidden
            />
            <div
              className="absolute inset-y-0 left-0 w-[85%] bg-[radial-gradient(ellipse_80%_70%_at_0%_50%,rgba(0,0,0,0.72)_0%,transparent_70%)]"
              aria-hidden
            />
          </>
        )}
        {mobile && (
          <div
            className="absolute inset-x-0 bottom-0 top-auto h-[min(52vh,420px)] bg-[linear-gradient(180deg,transparent_0%,rgba(4,6,10,0.7)_22%,rgba(4,6,10,0.96)_68%)]"
            aria-hidden
          />
        )}

        <div
          className={
            mobile
              ? "relative flex min-h-[min(48vh,380px)] flex-col justify-center px-4 pb-3 pt-6"
              : "relative flex h-full flex-col justify-center px-10"
          }
        >
          <AnimatePresence mode="wait">
            <motion.div
              key={zone.id}
              initial={
                reducedMotion
                  ? false
                  : mobile
                    ? { opacity: 0, y: 14 }
                    : { opacity: 0, x: -16 }
              }
              animate={{ opacity: 1, x: 0, y: 0 }}
              exit={
                reducedMotion
                  ? undefined
                  : mobile
                    ? { opacity: 0, y: 8 }
                    : { opacity: 0, x: -10 }
              }
              transition={{ duration: 0.4, ease: [0.23, 1, 0.32, 1] }}
              className={`pointer-events-auto ${mobile ? "max-w-none" : "max-w-md"}`}
            >
              <p className="copy-legible text-[10px] font-semibold tracking-[0.28em] text-signal sm:text-[11px]">
                {zone.eyebrow}
              </p>
              <h1
                className={`display copy-legible-title mt-2 leading-[1.08] text-foam ${
                  mobile
                    ? "text-[1.55rem] max-[380px]:text-[1.35rem]"
                    : "mt-3 text-[2.65rem]"
                }`}
              >
                {zone.title}
              </h1>
              <p
                className={`copy-legible-muted mt-2.5 text-sm leading-relaxed text-[#d4d0c8] ${
                  mobile ? "line-clamp-3 max-w-none" : "mt-4 max-w-sm md:text-[0.95rem]"
                }`}
              >
                {zone.body}
              </p>

              {!mobile && (
                <dl className="mt-6 grid gap-2.5 border-l border-signal/50 pl-4">
                  {zone.points.map((point) => (
                    <div
                      key={point.label}
                      className="grid grid-cols-[7rem_1fr] gap-3 text-sm"
                    >
                      <dt className="copy-legible-muted tracking-[0.1em] text-[#c8c4bc]">
                        {point.label}
                      </dt>
                      <dd className="copy-legible text-foam">{point.value}</dd>
                    </div>
                  ))}
                </dl>
              )}

              {mobile && (
                <div className="mt-3 flex gap-3 overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                  {zone.points.map((point) => (
                    <div
                      key={point.label}
                      className="min-w-[7.5rem] shrink-0 border-l border-signal/35 pl-2.5"
                    >
                      <p className="copy-legible-muted text-[10px] tracking-[0.14em] text-[#c8c4bc]">
                        {point.label}
                      </p>
                      <p className="copy-legible mt-0.5 text-xs text-foam">
                        {point.value}
                      </p>
                    </div>
                  ))}
                </div>
              )}

              <div
                className={`flex flex-wrap items-center gap-3 ${
                  mobile ? "mt-4" : "mt-7"
                }`}
              >
                {zone.cta.href.startsWith("#") ? (
                  <button
                    type="button"
                    className="btn-signal min-h-11 touch-manipulation shadow-[0_8px_28px_rgba(0,0,0,0.55)]"
                    onClick={() =>
                      setActive(zone.cta.href.replace("#", "") as ZoneId)
                    }
                  >
                    {zone.cta.label}
                  </button>
                ) : (
                  <a
                    href={zone.cta.href}
                    className="btn-signal min-h-11 touch-manipulation shadow-[0_8px_28px_rgba(0,0,0,0.55)]"
                  >
                    {zone.cta.label}
                  </a>
                )}
                {active !== "hub" && (
                  <button
                    type="button"
                    className="copy-legible-muted min-h-11 px-1 text-xs tracking-[0.16em] text-[#d4d0c8] underline-offset-4 touch-manipulation transition hover:text-foam hover:underline"
                    onClick={() => setActive("hub")}
                  >
                    ← Studio
                  </button>
                )}
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      {/* Zone dock */}
      <nav
        aria-label="World zones"
        className="pointer-events-auto fixed inset-x-0 bottom-0 z-40 border-t border-line/80 bg-void/80 pb-[env(safe-area-inset-bottom)] backdrop-blur-md"
      >
        <div className="mx-auto flex max-w-5xl items-stretch">
          <div className="hidden items-center border-r border-line/50 px-4 text-[10px] tracking-[0.2em] text-muted md:flex">
            SCROLL
          </div>
          <div className="grid flex-1 grid-cols-4">
            {NAV_ZONES.map((item) => {
              const on = active === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setActive(item.id)}
                  className={`group relative flex min-h-14 flex-col items-center justify-center gap-0.5 px-1 py-2.5 text-center touch-manipulation transition sm:items-start sm:px-4 sm:text-left md:py-3.5 ${
                    on ? "bg-signal/10" : "active:bg-foam/[0.06]"
                  }`}
                >
                  <span
                    className={`absolute inset-x-0 top-0 h-px transition ${
                      on ? "bg-signal" : "bg-transparent"
                    }`}
                  />
                  <span
                    className={`text-[10px] tracking-[0.18em] ${
                      on ? "text-signal" : "text-muted"
                    }`}
                  >
                    {item.short}
                  </span>
                  <span
                    className={`text-[11px] tracking-[0.04em] sm:text-sm ${
                      on ? "text-foam" : "text-muted"
                    }`}
                  >
                    {item.label}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </nav>
    </>
  );
}
