# Poured Candle Bar: concept preview (film edition)

Concept preview, not affiliated with Poured Candle Bar, 711 Warren St, Hudson, NY 12534 (last listed on their site in 2024; call to confirm) · (518) 303-3878.

## Is it operating at 711 Warren St in 2026?
Yes. Checked Oct 12, 2026:
- pouredcandlebar.com (every page footer) posts "Hudson 2026 Summer Hours": Sun 11–6, Mon 12–6, Tue–Wed closed, Thu 12–7, Fri 12–8, Sat 11–8.
- The bookable "Custom Fragrance Experience" (https://www.pouredcandlebar.com/products/pcb-experience) is live at $50 for 45 minutes. Its product data shows updated_at 2026-10-12T07:17-04:00.
- The About page describes "our shop in Hudson, NY". The FAQ lists (518) 303-3878.
- Street address: the shop's own page https://www.pouredcandlebar.com/pages/pcb-experience, Wayback capture 20240122220731, reads "711 Warren Street Hudson, NY 12534". The current live site doesn't print the street address. The county tourism listing (columbiacountytourism.org) gives the same address and phone.

## Photos
All five photos come from pouredcandlebar.com (the shop's own website) and were downloaded Oct 12, 2026. None are customer uploads. They were resized locally to WebP and JPG, and nothing was upscaled. The owners photo file is 344 px wide and is shown downscaled in a deliberate framed column (110 px at ≤480, 140 px wider), not at native size.

| Local | Shows | Source URL |
|---|---|---|
| img/tray.* (800w, 1500w) | Experience tray at the bar | https://www.pouredcandlebar.com/cdn/shop/files/custom-fragrance-experience-9017783.jpg |
| img/shop.* (800w, 1500w) | Shop interior | https://www.pouredcandlebar.com/cdn/shop/files/FC91319C-71B3-48A5-80AD-78B5A1B40247.jpg |
| img/bowl.* (600w, 1200w) | Gold hammered bowl candle | https://www.pouredcandlebar.com/cdn/shop/files/PCB_2023-PR_Photoshoot-GOLD_HAMMER_BOWL.jpg |
| img/bar.* (600w, 1200w webp; 1200w jpg) | The blending bar: scent clipboard, wine, beaker, fragrance shelves | https://cdn.shopify.com/s/files/1/0377/9756/0451/files/PCB_4524-2048x.jpg (served by their page https://www.pouredcandlebar.com/pages/wine-bar; 1638×2048 original, "PCB_" shoot prefix) |
| img/owners.* (344w native) | Dennis Green & Ricky Tiscareno with Nashville | https://cdn.shopify.com/s/files/1/0377/9756/0451/files/unnamed-2_480x480.jpg (served by their About page) |

## Tray hero provenance (checked Oct 12, 2026)
The tray file name `custom-fragrance-experience-9017783.jpg` ends in a 7-digit number that matches a Pexels photo ID. Kept as theirs, because:
- The same photo is on their pcb-experience page under a phone-style upload name, `2BFE0C80-61E8-4F07-88B1-7D61F22DC5CD.jpg` (1920×1536). After resizing it matches our tray.jpg with a mean pixel diff of about 2/255.
- Every product image in their Shopify store follows the same `handle-NNNNNNN` pattern (iron-bust-1052563, wick-trimmers-6138659, pcb-gift-cards-8918149). The number comes from the store's naming, not from Pexels.
- Pexels blocks automated lookups (403), so this was not reverse-image-checked against Pexels 9017783. The review says that photo has a different aspect ratio and photographer. Confirm with the owner before pitch.

## Fonts
Two families: Cormorant Garamond (display, headings, ALL-CAPS buttons/labels) and Karla (text). Josefin Sans removed.

- img/favicon.png and apple-touch-icon.png: a wax drop falling into a vessel, drawn for this concept. It isn't their logo.

## Facts (retrieved Oct 12, 2026)
- 40+ fragrances, licensed wine bar, 8 oz amber/black candle included, upgrade vessels, 45 min plus 120 min cure, the 3-hours-before-close pickup rule, 18% service charge, 50% cancellation refund, groups of 5+ call first, walk-ins first come first served, no outside food or drink, SayHi@PouredCandleBar.com: https://www.pouredcandlebar.com/pages/pcb-experience
- $48/person (FAQ), reservations recommended, weekends book up: https://www.pouredcandlebar.com/pages/faqs
- "Handcrafted in Hudson, New York", "Fragrance is Decor": https://www.pouredcandlebar.com/
- Owners and bios: https://www.pouredcandlebar.com/pages/about-us
- Social: @pouredcandlebar on Instagram, TikTok, and Facebook (linked from their site footer).

## Marked "call to confirm"
- Hours: still labeled summer hours in October, and holiday hours aren't posted.
- Price: the FAQ says $48 and the booking page says $50.
- Upgrade prices: not posted.

## Motion (AI-generated)
The scroll-scrubbed footage on this page is AI-generated video, made from the shop's own photos listed above (image-to-video, with first/last-frame chaining). It is not footage filmed at the shop. Some details (for example the wall of amber bottles in the hero's second half, the wax stream, and the single-wick close-up) are invented by the model and do not show the real shop.

| Sequence | Frames | Made from |
|---|---|---|
| frames/hero (walk in → bar → wall of scents) | 193 (2 clips × 8 s, every 2nd frame) | Clip 1 starts on img/shop.jpg and ends on img/bar.jpg. Clip 2 starts on clip 1's exact last frame, so there is no seam. |
| frames/pour (wax pours into a vessel) | 97 (8 s) | Starts on img/tray.jpg |
| frames/wick (a wick is lit, the flame blooms) | 97 (8 s) | Ends on img/bowl.jpg |

Desktop frames are 1280×720 WebP. Mobile frames are 540×720 center crops. Posters and stills are first or last frames from the same clips. When reduced motion is on, or JS is off, the page shows the stills and all of the content without scroll-scrubbing.

## Code
GSAP 3.12.5 + ScrollTrigger, served locally from js/ (standard GSAP license).
