# 417 Motoring — Shopify theme

Store: **`417motoring-zahnadke`** (`417motoring-zahnadke.myshopify.com`)

```bash
shopify theme dev --store=417motoring-zahnadke
```

First pushed 2026-10-06 (at `b74ed8b`) as the unpublished theme **"417 Motoring"**,
id **`158937645248`**. Update it with
`shopify theme push --store=417motoring-zahnadke --theme=158937645248`. The live
theme is still the default **Horizon** (`#156476473536`) until someone publishes
417 Motoring. `theme dev` runs on its own development theme (`158904582336`).
Last pushed to the live theme at `a00829d` (cards to Figma, 0 Products count, CLI-942 Description row, CLI-943 Returns nav), 2026-10-12.
417 Motoring was published on 2026-10-06, so it is **live**: pushes need
`--allow-live`, and pull-before-push applies from now on.

⚠️ **New section settings: push the section before the templates that use it.**
If a template arrives before its section's schema defines a setting, Shopify
silently drops that setting. `default_copy` on the policy pages was lost
this way once. So push in two steps, `--only sections/<file>` first and then the
rest, and pull a template back to check. The storefront is
password-protected, so `theme dev` prompts for the store password. Run it in
your own terminal, or pass `--store-password`.

## Where this came from

Forked from `../TotalCommercial-Custom` (commit `39477a0`, 2026-09-27, clean
working tree, nothing uncommitted came across). Chosen at the user's request. It is
the newest base in the family: it has the mobile hero sizing (`7e1cd5f`), the
centred mobile logo (`56726fd`, CLI-874), the truck-banner divide-by-zero fix and
mobile cart icon fix (`a244ad0`), and the CLI-570 "never highlight Returns" nav fix
(`315963f`). Its repo was also synced with its live theme on 2026-09-2x
(`b1e49dc`, `86da064`), so it isn't stale against Shopify.

**Country: 417 Motoring is in the USA** (Nixa, Missouri; confirmed from the Figma
contact frame `18046-9248` and the home frame's "Trusted US Dismantler"). Total
Commercial is New Zealand, so this needs a **full NZ→US pass**:
- Phone fields default to NZ: `snippets/country-code-list.liquid:1282` marks NZ
  `is-default`, `assets/global.js` ~line 1780 falls back to `'NZ'`, and the
  country chips in `snippets/blank-request-form.liquid`, `snippets/get-estimate.liquid`
  and `snippets/return.liquid` show NZ. Figma shows **"United States"** with
  placeholders like `+1 (417) 123 4567`.
- Sell My Car form (`18046-7214`) still says "Registration Number" and "Suburb /
  Address", with "2015 Holden Commodore" as the example. Those are AU/NZ leftovers in
  the design itself. Ask whether to use VIN / License Plate and Address / ZIP.
- Shipping copy: "New Zealand-wide", "North Island / South Island", Palmerston North
  pickup. Replace it with the Figma's USPS/UPS/FedEx, "lower 48 states" and freight
  terms (`18046-9356`).
- Fallback meta descriptions in `layout/theme.liquid`, and currency/market (USD) in
  admin. The cart drawer frame `18046-9056` shows `£156.86`, a stale placeholder;
  prices elsewhere are `$`.

`1c6b7ac` in AustralianAutoParts (NZ default) and `c36b3c0` in SparesPlus (NZ→AU)
show every file a country pass touches.

The full git history came with the fork, so `git log` covers the sibling stores'
work too. All of these themes descend from the same Find A Part base, so when you
need a fix or a pattern, a sibling usually has it:

```bash
git fetch ../SparesPlus && git log --oneline FETCH_HEAD -20
```

✅ **Cherry-picked on 2026-10-05**: `83f84fd` (a5c1819), `b055bab` (4fb2c0d, wording
set to the 417 Figma), `8537028` (CLI-654 from 5425502), plus `d544fa7` (a theme-check
fix). These were the picks, landed in siblings after Total Commercial was forked:

| Repo | Commit | What |
|---|---|---|
| SparesPlus | `a5c1819` | QA batch CLI-76: search scope & sort (CLI-660/652), zero-result UI (CLI-664), filter chips (CLI-653), out-of-range pages (CLI-681), per-page selector (CLI-682), Find My Part button (CLI-666), distinct form tags (CLI-678), Stock #/Tag # field (CLI-677), VIN/maxlength/honeypot (CLI-694), returns phone width (CLI-689), fitment caveat (CLI-683), empty meta descriptions/H1/favicon (CLI-680), trunk-prefix placeholder bug (CLI-687) |
| SparesPlus | `4fb2c0d` | Nav modals bind on `data-modal`, not the menu title, so renaming Sell My Car / Returns no longer breaks them; letterbox card photos that `cover` would over-crop (CLI-655). Also contains wording (CLI-686/693/691). Check those against the 417 Figma |
| SparesPlus | `5425502` | **Partial pick.** Take CLI-654 (phone `pattern` rejected `+` and spaces in all five phone fields). Leave CLI-673 (Spares Plus opening hours in `header-group.json` / `page.contact.json`) |

`a5c1819` sits on top of SparesPlus's rebrand commit `88d4782`, so expect conflicts
where its hunks touch recoloured lines. Keep the Total Commercial side of colour
conflicts, since the recolour pass replaces them anyway. Pick with `git fetch
../SparesPlus && git cherry-pick -x <sha>` (use `-n` for `5425502` and revert the
hours hunks).

Not queued, brand-specific or already here: SparesPlus `c36b3c0`/`88d4782` and
greenacre `51b11ff` (rebrand dumps), AustralianAutoParts `2ec8283`, `4d161de`,
`dd60193`, `e254801`, `8b58b94`, `15089da`, `5f04f65` (its own identity),
`1c6b7ac` (NZ default; this fork is already NZ), `2439942` (a port of Total
Commercial fixes this repo already has).

### Total Commercial branding still baked into code

Beyond colours, some recent Total Commercial commits are brand styling, not
generic fixes. Revisit them against the 417 design:
- `56726fd` CLI-873: black header CSS migrated from the editor
- `0b50037` CLI-898: white inactive nav links, lime active link and underline (`assets/base.css`)
- `a244ad0`: cart icon forced visible on the *black* mobile header

`sections/custom-image-banner.liquid` uses **CRLF** line endings (`39477a0` restored
them). Keep them, or every diff of that file becomes a whole-file rewrite.

## Design source — 34 frames

Figma: **417 Motoring** (team "Web Shops"):
`https://www.figma.com/design/jiBJEOIgREJEpHSD8QtWVp/417-Motoring`
(fileKey `jiBJEOIgREJEpHSD8QtWVp`). MCP tools want colon form: `18046:6572`.

**Confirmed on 2026-10-05**: the 417 Motoring file was open, and every node below
was screenshotted through the MCP and showed 417 branding.

| Node | Frame | Maps to |
|---|---|---|
| `18046-6572` | **Home**, desktop, full page | `templates/index.json` |
| `20020-3477` | Home tabbed grid: **Engines** tab | tabbed-product-grid |
| `20020-3577` | …Transmissions & Gearboxes tab | 〃 |
| `20020-3677` | …Headlights & Taillights tab | 〃 |
| `20020-3823` | …ECU's tab (tab row adds "Gearboxes") | 〃 |
| `20020-3869` | …Exterior Parts tab | 〃 |
| `18046-7429` | **Shop Parts By Makes**: Acura | make carousel |
| `18046-7495` | …Audi | 〃 |
| `22009-4129` | …Bentley | 〃 |
| `18046-7561` | …BMW M Sport | 〃 |
| `18046-7627` | …Corvette (tab row above the title in this one) | 〃 |
| `18046-7462` | …Ferrari | 〃 |
| `18046-7528` | …GTR | 〃 |
| `18046-7594` | …McLaren | 〃 |
| `18046-6481` | **Parts / search results** ("Search Parts" hero with Year/Make/Model/Part Type + Find My Part, sort, grid, Showing 25, pagination) | `templates/search.json` / collection |
| `18046-7214` | **Sell My Car** modal ("Get a Quote") | `snippets/get-estimate.liquid` |
| `18046-7288` | **Returns** modal, with the reason-for-return dropdown open | `snippets/return.liquid` |
| `18046-7378` | Return Request Submitted Successfully modal | 〃 |
| `18046-9423` | **Vehicles** listing ("Search Vehicles" hero, Search Part / Vehicle Details) | vehicles collection |
| `18046-9498` | **Vehicle detail** page (details table, Request Part, Available Parts grid) | vehicle product template |
| `18046-9684` | **Request Part** modal | `snippets/blank-request-form.liquid` |
| `18046-8658` | **Part page, no price**: Make an Offer variant, Fitment table tab | `sections/main-product.liquid` |
| `18046-8903` | **Make an Offer** modal | `snippets/product-card-form.liquid` |
| `18046-7707` | **Part page, priced** ($449.99, Buy It Now + Add to Cart): Fitment table tab | `sections/main-product.liquid` |
| `18046-7955` | …Grading Rules tab (A/B/C graded table, green/amber/red rows) | 〃 |
| `18046-8205` | …Shipping tab | 〃 |
| `18046-8432` | …Warranty tab | 〃 |
| `18046-9056` | **Cart drawer** | cart-drawer |
| `18046-9356` | **Shipping & Delivery** page (Small Package + Freight) | `page.shipping-policy` |
| `18046-9385` | **Warranty** page (1-year parts warranty, engine/transmission/axle/body/SRS terms) | `page.guarantee-after-sales` |
| `22038-3808` | **Returns** page ("Returns and Refunds", File a Return button) | `page.returns-policy` |
| `22039-4206` | **Privacy Policy** page | `page.privacy-policy` |
| `22038-3967` | **Terms of Service** page | `page.terms-of-service` |
| `18046-9248` | **Contact Us** page (info block, map, "Established in 2018" copy) | `page.contact` |

Things the frames show that differ from Total Commercial:
- **Header is white**, with a black top bar ("(417) 374-7733 Hotline 5 days a
  week | Nationwide Shipping Available | Monday to Friday from 9:00am to 5:00pm").
  Logo on the left; search and a red Cart button; nav underneath. Active nav
  link is red and bold with an underline, inactive links are black. This replaces
  TC's black header and lime/white nav (CLI-873/898).
- Section titles use the slanted black label with grey and red stripes ("Shop Parts
  By Makes", "Get a Quote", "Returns").
- Page heroes are dark photo banners with a centred white title.
- Pages end with a "Quality Parts, Ready When You Are!" CTA (Jost Medium 36) above
  the footer.
- Footer is white: logo, "Powered by Dismantly", Shop (Shop Parts, Currently
  Dismantling), Contact (Contact Us, Warranty, Shipping & Delivery), contact
  lines with red icons, Terms of Service / Privacy Policy, and red round X /
  Facebook / Instagram icons. The contact page also lists YouTube.
- Part page: "Tested Quality Part" (green), "Grade A" (amber) and "Pickup Allowed"
  badges; Make an Offer when there's no price; payment icons; the four benefit
  icons (World Wide Delivery, Secure Payments, Right Parts The First Time,
  5 Star Rated Service); and the fitment caveat "Fitment may vary. Please call us
  with your VIN…" (CLI-683 in the `a5c1819` cherry-pick).
- Privacy Policy and Terms of Service are new pages, with templates
  `page.privacy-policy` / `page.terms-of-service` (`git log` for when). Every policy
  page and the contact page use committed 417 photos: `assets/417-hero-*.jpg`
  (2000x909 crops of the Figma heroes) and `assets/417-cta.jpg`. No Files upload
  is needed. The Returns page has the File a Return button as a custom-liquid
  section (`data-modal="returns"`).
- In the **Warranty frame's** nav, the active "Returns" link uses
  `--primaries/red-dark` with fallback `#5b635f`. That's inconsistent with
  every other frame. Treat active as accent red everywhere.

⚠️ **The Figma desktop MCP has no fileKey parameter.** It reads whichever file is
*open* in the Figma desktop app. The brand files in this family are duplicates of one
another and **share node IDs**, so asking for a node with the wrong file open
silently returns another brand's design. **Call `get_screenshot` first and confirm
the 417 Motoring branding before pulling anything.** All 34 frames together are
about 469k tokens, so pull design context one frame at a time.

Invoke the `figma:figma-design-to-code` skill before `get_design_context`, and
export image assets into `assets/` early, because the localhost URLs Figma hands back
expire. The logo layer is `ChatGPT Image Sep 24, 2025, 06_56_23 PM 1/Light mode`
(component `2048:4523`, inner image `20059:3753`).

Most of these frames map to pages the source already implements. Diff each
design against what is built rather than rebuilding from scratch.

### Palette and type (from `get_variable_defs` on `18046:6572`)

```
Primaries/Accent      #e4332b   red: buttons, active nav, icons, links
Primaries/Primary     #070302   near-black: headings, top bar, title labels
Title/Title Dark      #000000
Grey/Grey Dark        #222020
Grey/Grey Accent      #535353   body copy on policy pages
GreyScale/Grey-700    #585858   Body Text/Grey
GreyScale/Grey-300    #ACACAC
Stroke/Default        #d8d8d8
BG/Light BG           #f9f9f9   CTA band, contact info panel
RAG/Amber             #f9c543   "Only 1 Left" / Grade badges (same as TC --badge-amber)
icon/Blue, text/Blue  #145da0   Dismantly badge only
Primaries/Red Dark    #df7f20   (an orange despite the name; little used)
text/primary #222530, text/secondary #525866, stroke/soft #e1e4ea
```

Type: **Figtree** for everything (UI 14–16 Medium/SemiBold, page body 18/28,
policy headings Bold 24 uppercase, hero titles Medium 36). The theme already uses
`figtree_n7` / `figtree_n4`. **Jost Medium 36** is used for the CTA heading only.

## Already done in the fork

`config/settings_data.json`: cleared `logo`
(`F522E7D1-3F32-41CF-9EF6-9E8BC5926400.png`), `favicon` (`tcs-logo.png`),
`social_facebook_link`, `social_instagram_link` and `storefront_api_token`. They
pointed at Total Commercial's own uploads and accounts. `.shopify/` (the CLI's
store binding) was not copied.

## Still to do — theme side

✅ **Home page** (`4fb5b95`…`3a03390`, 2026-10-06): every section matched to
`18046-6572` at 1440 (positions within ~2px) and checked at 375. All images are
committed theme assets named `417-*` (hero, tab banners, make cars, tow truck) or
`make-*.png` (logo strip). ✅ **Cards** (2026-10-09, styling only, against test
listings): part cards (`18046:6972` Recently Listed, `22012:5017` tab grid, same
component in search, Similar Parts and Available Parts) and the vehicle card
(`18046:7074` Currently Dismantling) match at 1440 and were checked at 375. Card
buttons read **"Buy Now"** (the part page's own button stays "Buy It Now", as in
`18046-7707`). Photos that `cover` would over-crop are letterboxed on purpose
(CLI-655). Those sections read the collections `parts` and `vehicle`
and the `custom.make`/`part_type` metafields. The make filters assume Corvette is
stored as Chevrolet, GTR as Nissan and BMW M Sport as BMW.
**Tab grid keywords** (`2b2a817`): each tab's "Product match keywords" field
(theme editor → Home page → Tabbed product grid → the tab) takes a comma-separated
list, e.g. `Engine, Motor, Long Block`. A part shows if its title or `custom.part_type`
contains any of the words, ignoring case. The current values are `Engine`,
`Transmission`, `light`, `ECU` and `Exterior`. The client edits these. Limit:
without a collection picked, each tab scans `collections.all.products`, which Liquid
caps at the first 50 products. Once there are real listings, give each tab an
automated collection (rule: Part type contains …) in admin.
Traps hit on the home page:
- Figma read the **Australian Auto Parts** file twice after the user touched it,
  even from a separate window. Check every read's content for 417 (red, US) and
  ask for the other brand files to be closed.
- Figma's localhost asset URLs serve only the **most recent** read. Download each
  image right after its `get_design_context`.
- Shell loops: zsh doesn't word-split `$p`, so `set -- $p` fails silently. Wrap
  such loops in `bash -c`.
  The same applies to building a `--only` list for `theme push`: use a bash array.
- Range settings have steps (5 on icon-with-text, 4 elsewhere). An off-step value
  makes theme dev reject the whole template ("must be a step in the range").
- `.banner--adapt` fixes custom image banners at 850px; `base.css` pins carousel
  arrows with `left: 12px !important`.
✅ Header (`b894dd7`) and ✅ footer (`b117351`) done: white, matched to Figma at 1440
and checked at 375. ✅ Cherry-picks, ✅ recolour (`357ddef`), ✅ identity and NZ→US pass (`71065c0`, `76cbd86`:
contact details, US phone default, product Shipping/Warranty tabs, 417 logo,
PAGE-CONTENT.md) are done. Still open from that pass: the social URLs (not in Figma),
and `assets/tcs-hero.jpg`, which the home hero still uses. Next →
the frames, one at a time (header/footer first, since every frame shares them).

**Colours: done in `357ddef`.** The table below is the mapping that was applied. Still
Total Commercial: the black header and white/lime nav CSS (CLI-873/898). The benefit
icons render from the inline `svg-icon` block settings of `icon_with_text_PK6rDF` in
`templates/index.json` and `templates/product.json`, which are black like Figma
(`18046:7845`). `assets/icon-benefit-*.svg` are unused copies of the same Figma
exports. The brand variables are in [layout/theme.liquid](layout/theme.liquid), around line 303:

```
variable              TC now    → 417        role
--text-on-main-color  #000      → #ffffff    label on the accent         (line 249)
--main-heading-color  #0F172A   → #070302    headings                    (line 251)
--accent-color        #d7fd10   → #e4332b    accent                      (line 252)
--brand-green         #3d6601   → #e4332b?   accent-as-text on white     (line 253)
--brand-dark          #050708   → #070302    top bar, title labels       (line 254)
--badge-amber         #f9c543   → #f9c543    unchanged (RAG/Amber)       (line 255)
--main-color          {{ primary_scheme.settings.primary_color }} (line 245, from the colour scheme in settings_data.json)
```

The 417 red is already dark enough to read as text on white, so `--brand-green`
can probably just be the accent (or a slightly darker red for hover). Check it
against the frames.

`--brand-green` keeps its misleading name on purpose: renaming it would conflict on
every cherry-pick from the siblings. It is the dark companion of the accent, the one
that is readable as text on white.

Hardcoded fallbacks are spread across `assets/`, `sections/`, `snippets/` and the JSON
templates: `#d7fd10` ×63 in 19 files, `#3d6601` ×45 in 17, `#050708` ×15 in 7,
`#f9c543` ×9 in 4. **Some are uppercase**, so grep case-insensitively:

```bash
grep -rIin "d7fd10\|3d6601\|050708\|f9c543" assets sections snippets layout config templates
```

Total Commercial's accent is *light* (lime, black text on it). The 417 accent is a
*dark* red with white labels, so this flips. Also sweep the label colours that pair with it: `--text-on-main-color` and
`var(--text-on-main-color, …)` fallbacks, `button_label` in the colour schemes whose
`button` is the accent, `form_button_text_color`, and every `*_button_text_color` in
the JSON templates.

**Identity**: still Total Commercial / Total Spares everywhere. New values come from
the Figma contact frame `18046-9248`:

| | Current (TC) | 417 Motoring |
|---|---|---|
| Name | Total Commercial / Total Spares | **417 Motoring** (legal: **417 Motoring LLC** in the warranty copy) |
| Phone | `+64 6359 2386`, href `tel:+6463592386` (7 links) | **(417) 374-7733**, href `tel:+14173747733` |
| Email | `admin@totalspares.co.nz` (href), shown as `sales@…` / `info@…` | **parts@417motoring.com** |
| Address | `708 Napier Road, Whakarongo, Palmerston North 4470, New Zealand`, plus `31A Atkinson Avenue, Otahuhu, Auckland 1062` | **825 N Gerald St, Nixa, MO 65714, USA** (one location) |
| Hours | TC's | **Monday to Friday 9:00am – 5:00pm**; top bar says "Hotline 5 days a week" |
| Social | cleared | X, Instagram, Facebook (footer), plus YouTube (contact page). URLs not in Figma, so ask |
| About | n/a | "Established in 2018, 417 Motoring has become…" (contact page, 3 paragraphs) |

They live in `sections/header-group.json:21` (top bar), `sections/footer-group.json:55-57`,
`templates/page.contact.json:28-29` (and the Google Maps `q=` embed),
`sections/main-product.liquid:726` ("Ask a Specialist"), the schema defaults in
`sections/contact-info-section.liquid`, and the shipping policy copy (NZ-wide,
North/South Island delivery times, Palmerston North pickup). `PAGE-CONTENT.md`
(103 lines) is Total Commercial's admin page copy and needs rewriting too.

**Brand images.** These are Shopify **Files** references inherited from Total
Commercial. They won't resolve on this store until files with the same names are
uploaded, or the settings are repointed:

| Where | Reference |
|---|---|
| `templates/index.json` | `8F34D020-1193-4D24-9AA0-09E07C043388.png`, `C2A6A234-6938-48E6-AD16-BB15A72DAE91.png`, `F275902C-EA7D-4292-A4DC-0790F03F25C6.png`, `F522E7D1-3F32-41CF-9EF6-9E8BC5926400_82c32305-3cac-42db-8786-73951914a4f6.png`, `car-engine-computer-inside.jpg`, `engine-toyota-hilux-toyota-revo-car-png-favpng-fZTVybNAtjU24qkFZUPCt30fB.jpg`, `images.jpg`, `image0.jpg`, `image0_1.png` … `image0_5.png`, `image1.png`, `image1_1.png`, `image1_2.png` |
| `sections/footer-group.json` | `F522E7D1-3F32-41CF-9EF6-9E8BC5926400_82c32305-3cac-42db-8786-73951914a4f6.png` (logo), `Screenshot_2026-09-23_132845.png` |
| `templates/search.json` | `F424C73B-03CC-4157-A14F-A5C8B886CF0A.png` |
| `templates/page.contact.json` | `C961E83C-85FC-4B43-9562-78C07C00675E.png` |
| `templates/page.shipping-policy.json` | `1FEC2816-82A5-43B0-8E19-D3D900B8A0E4.png`, `IMG_0602.jpg` |
| `templates/page.guarantee-after-sales.json` | `91384EC9-9C94-41AE-B617-C60FC030D199.png`, `IMG_0603.jpg` |
| `templates/page.returns-policy.json`, `templates/page.service-policy.json` | `cta-quality-parts.jpg` |
| `config/settings_data.json` | `logo` / `favicon`, now empty and to set after upload |

Uploading files with the **same filenames** makes the existing references resolve
with no code change. Theme assets committed under `assets/` need no upload. Most
of these are Total Commercial truck photos, so expect to replace them from the
Figma exports anyway.

## Still to do — store side (Shopify admin)

The full procedure is the Linear doc **Setup Shopify store**
(https://linear.app/dismantly/document/setup-shopify-store-71fa7b662c78). In short:

1. ✅ **Metafield definitions**: all 17 created on 2026-10-05. (The script's closing
   "Next:" hint is hardcoded to the Rosco store and theme. Ignore it.)
   Originally: `python3 ../create_metafield_definitions.py` against this
   store. This has to happen before the first theme push, because Shopify rejects
   `templates/product.json` while a referenced definition is missing.
2. **Search & Discovery app**: install it and add filters for `custom.make`,
   `custom.model`, `custom.year`, `custom.part_type` and `custom.type`. Without it,
   every `filter.p.m.custom.*` URL is inert.
3. **Navigation**: Home / Parts / Vehicles / Contact Us / Sell My Car / Returns. Sell My
   Car is a modal trigger: give it `#` as the URL, never a page, or the header
   highlights it on that page (CLI-570). **Returns is a page** (CLI-943, the client's
   call): point the menu item at the Returns & Refunds page; its File a Return button
   opens the form. The header no longer binds the Returns item to the modal.
   The footer reads three more menus by handle (`sections/footer-group.json`):
   - `shop`: Shop Parts, Currently Dismantling
   - `contact`: Contact Us, Warranty, Shipping & Delivery
   - `footer-legal`: Terms of Service, Privacy Policy (bottom row, beside the
     social icons). Point these at the themed pages, not `/policies/…`.
   Social icons show once the `social_*_link` theme settings are filled. The
   design has X, Instagram and Facebook in the footer, plus YouTube on the
   contact page. We don't have the URLs yet.
4. **Pages**: create the policy pages and the contact page, and assign the matching
   `page.*` templates.
5. **Dismantly connection**: section 4 of the Setup doc. Use the trimmed scope list, and
   the API host `api.dev.dismantly.ai` / `api.dismantly.ai`, not the frontend host.

## Mobile check (no Figma for it)

The Figma frames are desktop only, so mobile is an independent check. Do it after
each frame is matched at 1440, and again before handover. Use the browser pane at
**375×812** (and spot-check 390 and 414). For every page and state:

- **Home**: every section, top to bottom.
- **Search**: Parts and Vehicles, including a filtered result and the filter drawer.
- **Product pages**: a priced part, a no-price part, and a vehicle.
- **Cart drawer**: with two items in it. Empty the cart afterwards with
  `fetch('/cart/clear.js',{method:'POST'})`.
- **Every modal**: Make an Offer, Request Part, Sell My Car, Returns and the Returns
  success screen.
- **Menu and search**: the hamburger menu, and the search modal with a typed query.
- **Policy pages and Contact Us**.

Check each for:

1. **Sideways scroll.** `scrollWidth` must equal the viewport width. If not, find the
   culprit: walk every element whose `getBoundingClientRect().right` exceeds the
   width, and skip anything inside an `overflow` ancestor, the drawers and the hidden
   popups.
2. **Overlap.** Carousel arrows over buttons or text, badges over titles.
3. **Invisible or clipped controls.** Icons the same colour as their background, close
   buttons, and placeholders cut off in narrow inputs.
4. **Tap targets** at least 24px, and buttons 44px tall.
5. **Proportions.** Desktop-sized blocks that eat a phone screen.

Take screenshots with `window.scrollTo(…)` then `screenshot`. One taken straight after
a reload can still show the top of the page.

✅ **Done 2026-10-07** (`c0f531f`, `cc5c4ba`, `db5585f` and the policy commit). Fixed:

- **Recently Listed:** a mobile slide stacks two cards, so the arrows sat on the first
  card's buttons. They are now centred on its photo.
- **Reviews:** the 60px desktop arrows covered the copy. Now 36px at the screen edges
  below 750.
- **Benefit icons:** there was a stray divider on the left of the second row.
- **Tab grid tile:** the fixed 500px beat the mobile min-heights. Now 225px at 375.
- **Mobile menu account icon:** `assets/icon-account.svg` had `fill="white"`, from TC's
  black header. Now `currentColor`.
- **Search modal:** it kept the header's dark scheme, so its black close icon was
  invisible. It now has a white background.
- **"Filter and sort" link:** it took the scheme's white link colour.
- **Filter drawer:** near-black panel under navy labels. Now white, with the 417 text
  colour and a red Apply button.
- **Two-up result cards:** the side-by-side buttons wrapped to three lines. Now stacked
  full width.
- **Vehicle card titles:** 22px split words mid-word. Now 17px below 750.
- **Part badges:** they broke mid-word ("Grad/e"). The row now wraps.
- **Request Part:** it kept its 210px desktop width on the vehicle page. Now full width.
- **Similar Parts empty message (CLI-665):** it was white text on white.
- **Policy lists:** the bullets sat inside the text, so wrapped lines ran back under the
  bullet. Now hanging bullets, with 16/26 copy on phones.

The Make an Offer, Request Part, Sell My Car and Returns modals and the cart drawer were
fine at 375. Pattern behind most of these: **Total Commercial's dark colour schemes are
still on sections whose 417 design is white.** Anything that renders inside those
schemes (popups, drawers, empty states) comes out white-on-white or black-on-black.

## Testing

The shared Playwright suite is at `../store-tests`. Copy
`stores/totalcommercial.ts` to `stores/417motoring.ts`, register it in
`stores/index.ts`, add a `test:417motoring` script, then:

```bash
cd ../store-tests && npm run test:417motoring
```

If the storefront is password-protected, the config reads the password from an env
var. Without it, every page lands on `/password`.

## The one process rule worth repeating

**Pull before you push.** On the sibling stores the repo fell behind the live theme
more than once because people worked in the theme editor, and a push would have
reverted their photos and styling. Before any `theme push`, pull the live theme into
a scratch folder (`shopify theme pull --theme=<live id> --path=<scratch>`) and review
the diff. Pulling into the repo itself rebinds `.shopify/` and kills a running
`theme dev`.
