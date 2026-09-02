# Picasso Intelligence — component storefront

Static storefront for the CubeMars line of robotic actuators and motors. No build
step, no dependencies, no framework. Open `index.html` or serve the folder:

```bash
python -m http.server 8000
```

## Information architecture

Navigation is organised by **how the joint is built**. Customers arrive knowing
they need "40 Nm, 48 V, hollow bore" — not knowing which series it lands in.

```
Actuators ▾   Gimbal Motors   Frameless Motors
  Planetary
  Hollow-Bore
  Accessories
```

Series (AK, AKE, AKA, AKH, GL, RI, RO) is shown on every product card and on the
product page, so a model-number search still lands somewhere recognisable. There
is no brand hub page: the catalogue is single-brand.

## Files

| Path | What it is |
| --- | --- |
| `index.html` | Hero, category tiles, 4 product rails, FAQ |
| `collection.html?c=<id>` | One category, filtered by price, sortable |
| `product.html?id=<id>` | Spec table, add to cart *or* request a quote |
| `cart.html` / `checkout.html` | Cart, then the three payment options |
| `search.html?q=` | Client-side search over names, series, and specs |
| `contact.html?model=` | Enquiry form; prefills when reached from a quote button |
| `assets/js/data.js` | **All content** — site, collections, products, FAQ, payment methods |
| `assets/js/app.js` | Header/footer injection, cart, page renderers |
| `assets/js/art.js` | SVG product illustrations (stand-ins for photography) |

## Where the data came from

- **CubeMars** — 58 models with titles, prices, and spec bullets pulled from
  `store.cubemars.com/products.json` (their own Shopify storefront). Prices move;
  re-check before launch.

The quote-only path is still wired up even though nothing currently uses it: a
product with `price: null` renders as "Request a quote" and can never enter the
cart — `Cart.read()` filters it out even if it is injected into localStorage.
Set `price: null` on anything you want quoted rather than listed.

## Wiring up payments

The checkout offers three routes, defined in `PAYMENT_METHODS` in `data.js`. ACH
is only labelled "recommended" once the order clears `SITE.achThreshold`.

**GitHub Pages cannot process payments** — it is static hosting with no backend.
You need one small serverless function (Cloudflare Workers, Vercel, and Netlify
all have free tiers that cover this). The front end is already wired to the point
where that call belongs: the submit handler in `pageCheckout()` in `app.js`.

| Option | What it needs |
| --- | --- |
| **Card / Apple Pay** | Stripe Checkout Session, `payment_method_types: ['card']`, then redirect to `session.url` |
| **ACH Bank Payment** | Same, with `['us_bank_account']`. Enable ACH in the Stripe dashboard first |
| **Request Volume Quote** | No payment. Route the form to sales |

Two rules that matter:

1. **Never put a card form on this site.** Card details must go straight to
   Stripe's hosted page. That is why there is no card input at checkout — it
   keeps you in PCI SAQ-A instead of the full questionnaire.
2. **The server must recompute every price from its own copy of the catalogue.**
   Never create a Checkout Session from prices posted by the browser — anyone can
   edit those in devtools and buy an actuator for one cent. Send product IDs and
   quantities only.

## Editing content

Everything user-facing is in `assets/js/data.js`.

- `SITE` — brand, phone, email, company location, ACH threshold
- `COLLECTIONS` — categories. `parent: "actuators"` puts one in the dropdown
- `PRODUCTS` — `collection` must match a collection id; `price: null` makes it
  quote-only; keys in `specs` render in the order written
- `PAYMENT_METHODS`, `FAQ`

## Before going live

- [ ] Re-verify every CubeMars price against their store
- [ ] Replace the `(555)` phone and the placeholder email in `SITE`
- [ ] Only write "Authorized Distributor" if you have signed distribution
      agreements
- [ ] The site deliberately makes **no stock, warehouse, lead-time, free-shipping,
      or duty-free claims** — shipping and duty are "quoted per order" throughout.
      Do not reintroduce "stocked in the USA", "same-day dispatch", or "no tariffs"
      unless it is true and you can evidence it
- [ ] Replace the SVG illustrations with product photography
- [ ] Rewrite the policy pages — they are a skeleton, not legal advice
