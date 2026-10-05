# 417 Motoring — Shopify theme

Store: **`417motoring-zahnadke`** (`417motoring-zahnadke.myshopify.com`)

```bash
shopify theme dev --store=417motoring-zahnadke
```

Nothing has been pushed to this store yet and no theme id is bound. The first
`theme dev` / `theme push` will ask which theme to use.

## Where this came from

Forked from `../TotalCommercial-Custom` (commit `39477a0`, 2026-09-27, clean
working tree, nothing uncommitted came across). Chosen at the user's request. It is
the newest base in the family: it has the mobile hero sizing (`7e1cd5f`), the
centred mobile logo (`56726fd`, CLI-874), the truck-banner divide-by-zero fix and
mobile cart icon fix (`a244ad0`), and the CLI-570 "never highlight Returns" nav fix
(`315963f`). Its repo was also synced with its live theme on 2026-09-2x
(`b1e49dc`, `86da064`), so it isn't stale against Shopify.

**Country: Total Commercial is New Zealand.** Phone fields default to NZ
(`snippets/country-code-list.liquid:1282` marks NZ `is-default`,
`assets/global.js` ~line 1780 falls back to `'NZ'`, and the country chips in
`snippets/blank-request-form.liquid`, `snippets/get-estimate.liquid` and
`snippets/return.liquid` show NZ). **The 417 Motoring country has not been
confirmed.** "417" is a US area code (south-west Missouri), so check the Figma
contact frame first. If it's the US, this is a full pass: default country, phone
placeholders/format (+1), address and ZIP wording, the "New Zealand-wide" /
"North Island / South Island" shipping copy, the fallback meta descriptions in
`layout/theme.liquid`, and currency/market in admin. `1c6b7ac` in
AustralianAutoParts (NZ default) and `c36b3c0` in SparesPlus (NZ→AU) show every
file such a pass touches.

The full git history came with the fork, so `git log` covers the sibling stores'
work too. All of these themes descend from the same Find A Part base, so when you
need a fix or a pattern, a sibling usually has it:

```bash
git fetch ../SparesPlus && git log --oneline FETCH_HEAD -20
```

⚠️ **Worth cherry-picking**: these landed in siblings after Total Commercial was
forked, so this repo does *not* have them:

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

Figma: **417-Motoring**: `https://www.figma.com/design/jiBJEOIgREJEpHSD8QtWVp/417-Motoring`
(fileKey `jiBJEOIgREJEpHSD8QtWVp`)

| | | | |
|---|---|---|---|
| `18046-6572` | `20020-3477` | `20020-3577` | `20020-3677` |
| `20020-3823` | `20020-3869` | `18046-7429` | `18046-7495` |
| `22009-4129` | `18046-7561` | `18046-7627` | `18046-7462` |
| `18046-7528` | `18046-7594` | `18046-6481` | `18046-7214` |
| `18046-7288` | `18046-7378` | `18046-9423` | `18046-9498` |
| `18046-9684` | `18046-8658` | `18046-8903` | `18046-7707` |
| `18046-7955` | `18046-8205` | `18046-8432` | `18046-9056` |
| `18046-9356` | `18046-9385` | `22038-3808` | `22039-4206` |
| `22038-3967` | `18046-9248` | | |

(Listed in the order the user gave them. MCP tools want colon form: `18046:6572`.)

**Only seen through the user's screenshot of the Figma app.** During setup the
Figma Dev Mode MCP tools kept saying the server wasn't enabled, even with the
file open (the Claude app needs a restart after the server is enabled), so the MCP
read nothing. The user's screenshot of the Figma app confirmed this much:
- The file **417 Motoring** (team "Web Shops") was open with all 34 frames selected.
  Figma estimated about 469k tokens for the lot, so pull design context **one frame
  at a time**.
- Logo: "417 MOTORING", black and red wordmark with a car silhouette (layer "ChatGPT
  Image Sep 24…"). Header bar looks white with the logo left, not Total
  Commercial's black header.
- Accent is **red**: buttons, the footer contact icons, and the "Quality Parts,
  Ready When You Are!" CTA button. Page heroes are dark photo banners (headlight,
  engine bay).
- Frames visible: **Returns**, **Privacy Policy**, **Terms of Service** and
  **Contact Us** (desktop, with a map embed). The layer list starts "Frame
  1597883340", "Home - Desktop", "Frame 1597883341…".

Exact hexes, the contact details and the country weren't readable, so
`get_variable_defs` is still needed. By node id, these look like the same set of
frames as the other stores (`18046-6572` was the home desktop frame in other
brands, and `18046-9253` was the contact block in SparesPlus). The `20020-*`,
`22009-*`, `22038-*` and `22039-*` nodes are newer than the base set, so they're
likely 417-specific additions. Look at those closely.

⚠️ **The Figma desktop MCP has no fileKey parameter.** It reads whichever file is
*open* in the Figma desktop app. The brand files in this family are duplicates of one
another and **share node IDs**, so asking for a node with the wrong file open
silently returns another brand's design. **Call `get_screenshot` first and confirm
the 417 Motoring branding before pulling anything.**

Invoke the `figma:figma-design-to-code` skill before `get_design_context`, and
export image assets into `assets/` early, because the localhost URLs Figma hands back
expire.

Most of these frames map to pages the source already implements (hero, tabbed grid,
Shop Parts By Makes, contact, policy pages). Diff each design against what is built
rather than rebuilding from scratch.

## Already done in the fork

`config/settings_data.json`: cleared `logo`
(`F522E7D1-3F32-41CF-9EF6-9E8BC5926400.png`), `favicon` (`tcs-logo.png`),
`social_facebook_link`, `social_instagram_link` and `storefront_api_token`. They
pointed at Total Commercial's own uploads and accounts. `.shopify/` (the CLI's
store binding) was not copied.

## Still to do — theme side

Suggested order: cherry-picks → confirm Figma → recolour → identity (and country)
→ frames one at a time.

**Colours.** Brand variables in [layout/theme.liquid:249-255](layout/theme.liquid)
still hold Total Commercial's palette:

```
--text-on-main-color  #000      label colour on the accent      (line 249)
--main-heading-color  #0F172A   headings                        (line 251)
--accent-color        #d7fd10   lime accent                     (line 252)
--brand-green         #3d6601   dark green, accent-as-text      (line 253)
--brand-dark          #050708   near-black header/footer        (line 254)
--badge-amber         #f9c543   badges                          (line 255)
--main-color          {{ primary_scheme.settings.primary_color }} (line 245, from the colour scheme in settings_data.json)
```

`--brand-green` keeps its misleading name on purpose: renaming it would conflict on
every cherry-pick from the siblings. It is the dark companion of the accent, the one
that is readable as text on white.

Hardcoded fallbacks are spread across `assets/`, `sections/`, `snippets/` and the JSON
templates: `#d7fd10` ×63 in 19 files, `#3d6601` ×45 in 17, `#050708` ×15 in 7,
`#f9c543` ×9 in 4. **Some are uppercase**, so grep case-insensitively:

```bash
grep -rIin "d7fd10\|3d6601\|050708\|f9c543" assets sections snippets layout config templates
```

Total Commercial's accent is *light* (lime, black text on it). The 417 accent
looks like a *dark* red with white labels, so this flips. Also sweep the label colours that pair with it: `--text-on-main-color` and
`var(--text-on-main-color, …)` fallbacks, `button_label` in the colour schemes whose
`button` is the accent, `form_button_text_color`, and every `*_button_text_color` in
the JSON templates.

**Identity**: still Total Commercial / Total Spares everywhere:

| | Current value |
|---|---|
| Phone | `+64 6359 2386`, href `tel:+6463592386` (7 links) |
| Email | `admin@totalspares.co.nz` (href) shown as `sales@…` / `info@…` |
| Address | `708 Napier Road, Whakarongo, Palmerston North 4470, New Zealand`, plus `31A Atkinson Avenue, Otahuhu, Auckland 1062` |

They live in `sections/header-group.json:21` (top bar), `sections/footer-group.json:55-57`,
`templates/page.contact.json:28-29` (and the Google Maps `q=` embed),
`sections/main-product.liquid:726` ("Ask a Specialist"), the schema defaults in
`sections/contact-info-section.liquid`, and the shipping policy copy (NZ-wide,
North/South Island delivery times, Palmerston North pickup). `PAGE-CONTENT.md`
(103 lines) is Total Commercial's admin page copy and needs rewriting too. The 417
Motoring details come from the Figma contact frame.

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

1. **Metafield definitions**: `python3 ../create_metafield_definitions.py` against this
   store. This has to happen before the first theme push, because Shopify rejects
   `templates/product.json` while a referenced definition is missing.
2. **Search & Discovery app**: install it and add filters for `custom.make`,
   `custom.model`, `custom.year`, `custom.part_type` and `custom.type`. Without it,
   every `filter.p.m.custom.*` URL is inert.
3. **Navigation**: Home / Parts / Vehicles / Contact Us / Sell My Car / Returns. Sell My
   Car and Returns are modal triggers: give them `#` as the URL, never a page, or the
   header highlights them on that page (CLI-570).
4. **Pages**: create the policy pages and the contact page, and assign the matching
   `page.*` templates.
5. **Dismantly connection**: section 4 of the Setup doc. Use the trimmed scope list, and
   the API host `api.dev.dismantly.ai` / `api.dismantly.ai`, not the frontend host.

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
