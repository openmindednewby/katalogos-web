# Katalogos — Landing Copy (DRAFT v1)

Status: First draft. Review, redline, send back edits.
Pricing numbers are placeholders — adjust to whatever feels right for your market.

---

## Hero

**Wordmark:** Katalogos

**Tagline:** Your menu, online — in minutes.

**Subhead:**
> Upload your dishes once. Get a beautiful digital menu, a QR code for every table, and real-time updates — without printing another menu, ever.

**Primary CTA:** Build your menu free
**Secondary CTA:** See an example menu

---

## Features (3 blocks)

### 1. Set up in minutes, not days

No design skills needed. Upload your dishes, photos, and prices once. Katalogos generates a clean, mobile-friendly menu that works on every device. Print one QR code per table — that's the whole deployment.

### 2. Match your restaurant's brand

Custom logo. Custom palette. Custom typography from a curated library of professional fonts that match your printed menu. Most digital menu services lock the font; yours doesn't.

### 3. Update everything in real time

Sold out an item? One tap, gone. Specials menu changes daily? Edit once, every QR code updates instantly. No reprinting, no re-stickers, no apologies to guests.

---

## Pricing (4 tiers)

| | Trial | Free + Ads | Paid (No Ads) | Paid Full |
|---|---|---|---|---|
| **Price** | Free 14 days | €0/month | €14/month | €29/month |
| **Menus** | All features | 1 menu | 3 menus | Unlimited |
| **Items** | Unlimited | 50 items | 500 items | Unlimited |
| **Custom branding** | ✓ | — | ✓ (logo + palette) | ✓ (logo + palette + typography) |
| **Custom typography** | — | Manrope only | 9 fonts | 12 fonts (full library) |
| **Ads on guest QR menus** | None | Yes | None | None |
| **Multi-language** | ✓ | — | ✓ | ✓ |
| **Allergy / dietary tags** | ✓ | ✓ | ✓ | ✓ |
| **Real-time price updates** | ✓ | ✓ | ✓ | ✓ |
| **Custom domain** | — | — | — | ✓ (yourrestaurant.com) |
| **White-label / hide attribution** | — | — | — | ✓ |
| **Priority support** | — | — | — | ✓ |

---

## FAQ

**Who is Katalogos for?**
Restaurants, cafés, food trucks, hotels with F&B, ghost kitchens — any food business that wants a digital menu without the hassle of building one from scratch.

**Do my guests need to download an app?**
No. Guests scan a QR code at the table and the menu opens in their phone's browser. No app, no signup, no friction.

**Can I update prices without re-printing QR codes?**
Yes. Print the QR code once. Edit menus, items, prices anytime — every guest who scans gets the latest version.

**How long does it take to get started?**
Most restaurants are live in under 15 minutes. Upload your dish list, choose a template, print the QR code, done.

**Can I match my printed menu's typography?**
Yes — on paid plans you can choose from 9 to 12 professional fonts. We curate the library so your menu always looks polished, no matter which font you pick.

**Multi-language?**
Yes. Build your menu once in your primary language, translate to any other in two clicks. Guests see it in the language their phone prefers.

**Allergies and dietary tags?**
Each item supports custom tags — gluten-free, vegan, contains nuts, halal, kosher, whatever you need. Guests can filter the menu by tag.

**What if my Wi-Fi is slow at peak hours?**
Menus are pre-rendered and cached. Even on patchy 3G, guests see the menu within a second.

---

## Footer

- Privacy Policy
- Terms of Service
- Status
- Contact: support@katalogos.dloizides.com (or whatever's locked)
- "built by dloizides.com" attribution (auto-rendered via @dloizides/ui-primitives)

---

## Voice notes (so you can edit consistently)

- **Restaurant-owner-speaking-to-restaurant-owner.** Concrete, practical, slightly warm. The buyer is busy and skeptical — respect their time.
- **Verb-led.** "Build" / "Update" / "Match" / "Print" — never passive.
- **Specific over fancy.** "15 minutes" beats "in moments." "$14/month" beats "affordable."
- **Mention the printed menu.** Restaurants are emotionally invested in their print menu — every place we can tie the digital experience back to it ("match your printed menu's typography") earns trust.

---

## Things I'm flagging as "verify before publishing"

- **Pricing numbers** ($14 / $29) — restaurant-SaaS market is highly price-sensitive. Toast/Square charge per-transaction; Katalogos's flat-fee positioning is the differentiator. Check competitors like Owner.com, MenuBuilder.io, ChefMate before publishing.
- **"Most digital menu services lock the font"** — true today, but worth verifying every 6 months in case competitors copy.
- **"Custom typography"** — Phase 3.5, post-launch v1.1. If launching before that ships: either remove this from features OR mark "Coming Q3" on the comparison row.
- **"Custom domain"** — verify the platform supports tenant custom domains. If not yet, also mark "Coming Q3."
- **"Allergy / dietary tags"** — verify this exists in the existing OnlineMenu service or flag as roadmap.
- **"Pre-rendered and cached"** — true if SSR is configured. If we're shipping a CSR-first SPA initially, soften the line.
- **Currency: $ vs €** — your buyer is mostly EU/Cyprus-based. €14 / €29 is probably more accurate. Or leave $ for international perception. Decide.
