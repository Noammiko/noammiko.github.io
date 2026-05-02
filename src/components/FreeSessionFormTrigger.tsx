"use client";

import BookingFormModal from "@/components/priceNbundles/forms/freebooking";
import { withConvexProvider } from "@/lib/convex";

/**
 * FreeSessionFormTrigger
 * Self-contained island: renders the "Secure Your Spot" CTA that opens the
 * First-Time Tryout Session booking modal.
 * Wrap with withConvexProvider so useMutation inside the form works correctly.
 */
export default withConvexProvider(function FreeSessionFormTrigger() {
  return (
    <BookingFormModal>
      {/* btn-crimson class is defined in globals.css and available globally */}
      <button
        className="btn-crimson"
        style={{
          display: "block",
          width: "100%",
          textAlign: "center",
          cursor: "pointer",
        }}
      >
        Secure Your Spot
      </button>
    </BookingFormModal>
  );
});
