"use client";

/**
 * TestimonialsLive — reads reviews directly from Convex so the carousel
 * is always up-to-date without a site rebuild.
 *
 * Replicates the exact layout / CSS class names used by the static
 * TestimonialsCarousel.astro so the global styles apply identically.
 */

import { useEffect, useRef, useCallback } from "react";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { withConvexProvider } from "@/lib/convex";

interface Review {
  _id: string;
  name: string;
  text: string;
  rating: number;
  image?: string;
  imagegoogle?: string;
}

function Carousel({ reviews }: { reviews: Review[] }) {
  const trackRef    = useRef<HTMLDivElement>(null);
  const vpRef       = useRef<HTMLDivElement>(null);
  const progressRef = useRef<HTMLDivElement>(null);
  const counterRef  = useRef<HTMLSpanElement>(null);
  const currentRef  = useRef(0);
  const timerRef    = useRef<ReturnType<typeof setInterval> | null>(null);
  const pausedRef   = useRef(false);

  const total = reviews.length;

  const perPage = () => {
    const w = window.innerWidth;
    if (w <= 600) return 1;
    if (w <= 900) return 2;
    return 3;
  };

  const cardPx = useCallback(() => {
    const first = trackRef.current?.children[0] as HTMLElement | null;
    return first ? first.offsetWidth : 0;
  }, []);

  const goTo = useCallback((idx: number) => {
    if (!trackRef.current) return;
    const pp  = perPage();
    const max = Math.max(0, total - pp);
    const i   = Math.max(0, Math.min(idx, max));
    currentRef.current = i;

    trackRef.current.style.transform = `translateX(-${i * cardPx()}px)`;

    if (counterRef.current)
      counterRef.current.textContent = `${i + 1} / ${total}`;

    if (progressRef.current) {
      const pct = max > 0 ? (i / max) * 100 : 0;
      progressRef.current.style.width = `${pct}%`;
    }
  }, [cardPx, total]);

  const next = useCallback(() => {
    const pp  = perPage();
    const max = Math.max(0, total - pp);
    goTo(currentRef.current >= max ? 0 : currentRef.current + 1);
  }, [goTo, total]);

  const prev = useCallback(() => {
    const pp  = perPage();
    const max = Math.max(0, total - pp);
    goTo(currentRef.current <= 0 ? max : currentRef.current - 1);
  }, [goTo, total]);

  const resetAuto = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(() => { if (!pausedRef.current) next(); }, 7000);
  }, [next]);

  useEffect(() => {
    goTo(0);
    resetAuto();

    const handleResize = () => goTo(currentRef.current);
    window.addEventListener("resize", handleResize);
    return () => {
      window.removeEventListener("resize", handleResize);
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [goTo, resetAuto]);

  // Touch support
  const touchStartX = useRef(0);

  return (
    <>
      <div className="tsc-outer reveal">
        {/* Left arrow */}
        <button className="tsc-arr tsc-arr-l" aria-label="Previous review"
          onClick={() => { prev(); resetAuto(); }}>
          <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="15 18 9 12 15 6" />
          </svg>
        </button>

        {/* Viewport */}
        <div
          className="tsc-viewport"
          ref={vpRef}
          onMouseEnter={() => { pausedRef.current = true; }}
          onMouseLeave={() => { pausedRef.current = false; }}
          onTouchStart={(e) => { touchStartX.current = e.touches[0].clientX; }}
          onTouchEnd={(e) => {
            const delta = touchStartX.current - e.changedTouches[0].clientX;
            if (Math.abs(delta) > 40) { delta > 0 ? next() : prev(); resetAuto(); }
          }}
        >
          <div className="tsc-track" ref={trackRef}>
            {reviews.map((r) => {
              const av = r.image || r.imagegoogle || null;
              return (
                <div key={r._id} className="tsc-card">
                  {/* Stars */}
                  <div className="tsc-stars">
                    {Array(5).fill(null).map((_, i) => (
                      <span key={i} className="tsc-star" />
                    ))}
                  </div>
                  {/* Quote */}
                  <p className="tsc-quote">"{r.text}"</p>
                  {/* Author */}
                  <div className="tsc-author">
                    {av
                      ? <img src={av} alt={r.name} className="tsc-av-img" loading="lazy" />
                      : <div className="tsc-av-init">{r.name.charAt(0).toUpperCase()}</div>
                    }
                    <div>
                      <div className="tsc-name">{r.name}</div>
                      <div className="tsc-meta">Google Review</div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right arrow */}
        <button className="tsc-arr tsc-arr-r" aria-label="Next review"
          onClick={() => { next(); resetAuto(); }}>
          <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="9 18 15 12 9 6" />
          </svg>
        </button>
      </div>

      {/* Footer */}
      <div className="tsc-footer">
        <button className="tsc-arr-sm" aria-label="Previous review" onClick={() => { prev(); resetAuto(); }}>
          <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="15 18 9 12 15 6" />
          </svg>
        </button>
        <div className="tsc-progress-track">
          <div className="tsc-progress-fill" ref={progressRef} />
        </div>
        <span className="tsc-counter" ref={counterRef}>1 / {total}</span>
        <button className="tsc-arr-sm" aria-label="Next review" onClick={() => { next(); resetAuto(); }}>
          <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="9 18 15 12 9 6" />
          </svg>
        </button>
      </div>
    </>
  );
}

function TestimonialsInner() {
  const reviews = useQuery(api.reviews.listActiveReviews);

  if (!reviews) {
    return (
      <div className="tsc-outer reveal" style={{ justifyContent: "center", padding: "60px 0" }}>
        <p style={{ color: "rgba(245,240,232,0.2)", fontFamily: "'Josefin Sans', sans-serif", fontSize: "12px", letterSpacing: "0.2em", textTransform: "uppercase" }}>
          Loading…
        </p>
      </div>
    );
  }

  if (reviews.length === 0) {
    return null;
  }

  return <Carousel reviews={reviews} />;
}

export default withConvexProvider(TestimonialsInner);
