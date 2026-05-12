"use client";

import { useEffect, useRef } from "react";

interface Review {
  _id: string;
  name: string;
  text: string;
  rating: number;
  image?: string;
  imagegoogle?: string;
}

interface ReviewColumnProps {
  reviews: Review[];
  scrollSpeed?: number;
  startOffset?: number;
}

export default function ReviewColumn({
  reviews,
  scrollSpeed = 5000,
  startOffset = 0,
}: ReviewColumnProps) {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const trackRef   = useRef<HTMLDivElement>(null);
  const indexRef   = useRef(0);
  const pausedRef  = useRef(false);
  const cardHRef   = useRef(0);
  const timerRef   = useRef<ReturnType<typeof setTimeout> | null>(null);

  const origCount = reviews.length;

  function applyTranslate(animated: boolean) {
    const track = trackRef.current;
    if (!track) return;
    track.style.transition = animated
      ? "transform 0.7s cubic-bezier(0.22, 1, 0.36, 1)"
      : "none";
    track.style.transform = `translateY(-${indexRef.current * cardHRef.current}px)`;
  }

  function advance() {
    if (pausedRef.current || origCount === 0) return;
    indexRef.current++;
    applyTranslate(true);
    if (indexRef.current >= origCount) {
      setTimeout(() => {
        indexRef.current = 0;
        applyTranslate(false);
      }, 750);
    }
  }

  function manualStep(dir: 1 | -1) {
    if (origCount === 0) return;
    if (dir === 1) {
      indexRef.current++;
      applyTranslate(true);
      if (indexRef.current >= origCount) {
        setTimeout(() => {
          indexRef.current = 0;
          applyTranslate(false);
        }, 600);
      }
    } else {
      indexRef.current = (indexRef.current - 1 + origCount) % origCount;
      applyTranslate(true);
    }
  }

  useEffect(() => {
    if (origCount === 0) return;

    function measureAndReset() {
      const track = trackRef.current;
      if (!track) return;
      const firstCard = track.children[0] as HTMLElement | null;
      if (!firstCard) return;
      const h = firstCard.getBoundingClientRect().height;
      cardHRef.current = h;

      // Set wrapper height to one card
      if (wrapperRef.current) wrapperRef.current.style.height = `${h}px`;

      // Reset position
      indexRef.current = 0;
      applyTranslate(false);
    }

    measureAndReset();

    const ro = new ResizeObserver(measureAndReset);
    const firstCard = trackRef.current?.children[0] as HTMLElement | null;
    if (firstCard) ro.observe(firstCard);

    // Start auto-scroll after offset
    const offsetTimer = setTimeout(() => {
      const interval = setInterval(advance, scrollSpeed);
      timerRef.current = interval as unknown as ReturnType<typeof setTimeout>;
    }, startOffset);

    const handleResize = () => setTimeout(measureAndReset, 100);
    window.addEventListener("resize", handleResize);

    return () => {
      clearTimeout(offsetTimer);
      if (timerRef.current) clearInterval(timerRef.current as unknown as ReturnType<typeof setInterval>);
      window.removeEventListener("resize", handleResize);
      ro.disconnect();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [origCount, scrollSpeed, startOffset]);

  if (origCount === 0) return null;

  const allCards = [...reviews, ...reviews]; // originals + clones

  return (
    <div
      className="rcol-wrapper"
      ref={wrapperRef}
      onMouseEnter={() => { pausedRef.current = true; }}
      onMouseLeave={() => { pausedRef.current = false; }}
    >
      {/* Up chevron */}
      <button
        className="rcol-arrow rcol-arrow-up"
        aria-label="Previous review"
        onClick={(e) => { e.stopPropagation(); manualStep(-1); }}
      >
        <svg width="14" height="10" viewBox="0 0 14 10" fill="none">
          <path d="M1 8L7 2L13 8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
        </svg>
      </button>

      {/* Scrolling track */}
      <div className="rcol-track" ref={trackRef}>
        {allCards.map((r, i) => {
          const av = r.image || r.imagegoogle || null;
          return (
            <div key={`${r._id}-${i}`} className="tsc-card">
              <div className="tsc-stars">
                {Array(5).fill(null).map((_, si) => (
                  <span key={si} className="tsc-star" />
                ))}
              </div>
              <p className="tsc-quote">"{r.text}"</p>
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

      {/* Down chevron */}
      <button
        className="rcol-arrow rcol-arrow-dn"
        aria-label="Next review"
        onClick={(e) => { e.stopPropagation(); manualStep(1); }}
      >
        <svg width="14" height="10" viewBox="0 0 14 10" fill="none">
          <path d="M1 2L7 8L13 2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
        </svg>
      </button>
    </div>
  );
}
