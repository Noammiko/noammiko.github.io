"use client";

import ProjectDialog from "@/components/priceNbundles/forms/projectInqueary";
import { withConvexProvider } from "@/lib/convex";

/**
 * QuoteFormTrigger
 * Self-contained island: renders the "Request a Custom Quote" CTA that opens
 * the full-project inquiry modal.
 * Wrapped with withConvexProvider so useMutation inside the form works.
 */
export default withConvexProvider(function QuoteFormTrigger() {
  return (
    <ProjectDialog>
      <button
        className="btn-crimson"
        style={{ cursor: "pointer" }}
      >
        Request a Custom Quote
      </button>
    </ProjectDialog>
  );
});
