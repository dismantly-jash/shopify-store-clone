# 417 Motoring Shopify theme

The storefront theme for 417 Motoring (`417motoring-zahnadke.myshopify.com`), a Dismantly client
store. It is also the **source theme that store-builder copies** when it generates a new client
store, so changes here flow into every store built from it.

Built on Shopify's Dawn 15.4.1 and the shared Dismantly "Find A Part" base. Forked from
TotalCommercial-Custom on 27 Sep 2026. The theme reads parts and vehicles from the product
metafields `custom.year`, `custom.make`, `custom.model`, `custom.part_type` and `custom.type`,
and the search pages rely on Search & Discovery filters with exactly those labels:
Select Year, Select Make, Select Model, Select Part Type, Type.

## Layout

| Folder | What is in it |
| -- | -- |
| `layout/` | `theme.liquid`, with the brand colour variables in `:root` |
| `sections/` | Home page sections (hero, make logos, make tabs, part tabs, testimonials), header, footer, product page, search, policy pages |
| `snippets/` | Shared pieces, including `page-copy-*.liquid` (the built-in policy page copy) and `badge-dismantly.liquid` |
| `templates/` | JSON templates per page type; the policy pages use `page.shipping-policy`, `page.guarantee-after-sales` and `page.contact` |
| `assets/` | CSS, JS, icons and the brand images that live in the theme (`brand-hero.jpg`, `make-*.png`, …) |
| `config/` | `settings_schema.json` and `settings_data.json` (colour schemes, logo and favicon references) |
| `locales/` | Translations |

`CLAUDE.md` is the working log for this store: what was pushed when, the theme ids, and the
gotchas. `PAGE-CONTENT.md` is the readable source of the policy page copy.

## Working on it

Install the Shopify CLI, then:

```bash
shopify theme dev --store=417motoring-zahnadke
```

The storefront is password-protected, so `theme dev` asks for the store password.

To push, use the theme id recorded in `CLAUDE.md`. The 417 Motoring theme is live, so a push
needs `--allow-live`, and you should pull before you push. Push new sections before the
templates that use them: if a template arrives before its section's schema defines a setting,
Shopify silently drops that setting.

## As the store-builder source

[store-builder](https://github.com/dismantly-jash/store-builder) builds a new client
store by copying this repo, rebranding it from a config file (colours, images, contact details,
country, home page lists, page copy, menus, SEO) and pushing the result as an unpublished theme.
It clones this repo into a folder named `417-motors` and refers to it as `source = "417-motors"`
in the store config. Keep the following stable, because the rebrand looks for them:

- the four brand colour variables in `layout/theme.liquid`
- the make logos, make tabs, part tabs and testimonial blocks on the home page
- the footer menus `shop` and `contact`
- the `page-copy-*.liquid` snippets and the policy page templates

Nothing in this repo should contain a token, a password or a `.shopify/` folder. The CLI's
store binding is deliberately left out so a clone never points at the wrong store.
