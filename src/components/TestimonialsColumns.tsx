"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { withConvexProvider } from "@/lib/convex";
import ReviewColumn from "./ReviewColumn";

function TestimonialsColumnsInner() {
  const reviews = useQuery(api.reviews.listActiveReviews);

  if (!reviews) {
    return (
      <div className="rcol-grid" style={{ justifyItems: "center", padding: "60px 0" }}>
        <p style={{ color: "rgba(245,240,232,0.2)", fontFamily: "'Josefin Sans', sans-serif", fontSize: "12px", letterSpacing: "0.2em", textTransform: "uppercase", gridColumn: "1/-1" }}>
          Loading…
        </p>
      </div>
    );
  }

  if (reviews.length === 0) return null;

  // Interleave reviews across 3 columns: col0 gets 0,3,6…  col1 gets 1,4,7…  col2 gets 2,5,8…
  const cols = [0, 1, 2].map((offset) =>
    reviews.filter((_, i) => i % 3 === offset)
  );

  return (
    <div className="rcol-grid">
      <ReviewColumn reviews={cols[0]} scrollSpeed={5000} startOffset={0} />
      <ReviewColumn reviews={cols[1]} scrollSpeed={5000} startOffset={1700} />
      <ReviewColumn reviews={cols[2]} scrollSpeed={5000} startOffset={3400} />
    </div>
  );
}

export default withConvexProvider(TestimonialsColumnsInner);
