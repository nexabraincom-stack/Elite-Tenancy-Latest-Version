declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
    plausible?: (event: string, opts?: { props?: Record<string, unknown> }) => void;
  }
}

// ── Core helper ───────────────────────────────────────────────────────────────

export function trackEvent(name: string, params?: Record<string, unknown>): void {
  window.gtag?.("event", name, params);
  window.plausible?.(name, { props: params as Record<string, string | number | boolean> | undefined });
}

// ── Listing events ────────────────────────────────────────────────────────────

export function trackListingView(listingId: string, title: string, price: number): void {
  trackEvent("listing_view", { listing_id: listingId, listing_title: title, price_pcm: price, currency: "GBP" });
}

export function trackListingEnquiry(listingId: string, title: string): void {
  trackEvent("listing_enquiry", { listing_id: listingId, listing_title: title });
}

// ── Lead / conversion events ──────────────────────────────────────────────────

export function trackLeadSubmit(source: "contact" | "listing" | "passport" | "room-wanted"): void {
  trackEvent("lead_submit", { lead_source: source });
}

export function trackFormSubmit(formName: string): void {
  trackEvent("form_submit", { form_name: formName });
}

// ── Engagement events ─────────────────────────────────────────────────────────

export function trackWhatsAppClick(context?: string): void {
  trackEvent("whatsapp_click", { context: context ?? "unknown" });
}

export function trackRenterPassportSubmit(): void {
  trackEvent("renter_passport_submit");
}

export function trackRightToRentCheck(): void {
  trackEvent("right_to_rent_check");
}

export function trackValuationRequest(): void {
  trackEvent("valuation_request");
}
