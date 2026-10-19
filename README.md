# Zero_MarketingPixels

Meta Pixel (Facebook, Instagram), TikTok Pixel, Pinterest Tag and Microsoft
Clarity on the Zero storefront: an ID in the admin each, no code, no tag
manager.

## Install

Requires Magento Open Source 2.4.7–2.4.9 and PHP 8.2–8.4 with the GD extension built with WebP (`php -r 'var_dump(function_exists("imagewebp"));'` says `true`; Magento's own PHP requirements cover the rest). Without WebP in GD, Zero skips its WebP image copies and serves the originals.

```bash
composer require fixstacks/module-zero-marketing-pixels
bin/magento setup:upgrade
bin/magento setup:di:compile           # production mode
bin/magento setup:static-content:deploy # production mode
bin/magento cache:flush
```

Composer installs `fixstacks/module-zero-core`, `fixstacks/module-zero-consent`, `fixstacks/module-zero-google-analytics` with it.

Part of [`fixstacks/zero`](https://fixstacks.com/zero), which installs the Zero theme and every Zero module at once.

## Events

The pixels use the storefront's GA4 e-commerce events from
Zero_GoogleAnalytics (it collects them while a pixel is on, even with
Google Analytics off), translated to each network's standard events:

| Storefront | Meta | TikTok | Pinterest |
| --- | --- | --- | --- |
| every page | PageView | page | page |
| product page (`view_item`) | ViewContent | ViewContent | pagevisit |
| category (`view_item_list`) | | | viewcategory |
| search | Search | Search | search |
| add to cart | AddToCart | AddToCart | addtocart |
| add to wish list | AddToWishlist | AddToWishlist | |
| checkout opened | InitiateCheckout | InitiateCheckout | |
| payment chosen | AddPaymentInfo | AddPaymentInfo | |
| order placed (`purchase`) | Purchase | CompletePayment | checkout |
| account created (`sign_up`) | CompleteRegistration | CompleteRegistration | signup |

Products are sent by SKU, with price, quantity, value and currency. The
order's event carries an event ID (`purchase-<order number>`) for
deduplication with a server-side Conversions API, and is sent once (a
reload of the success page sends nothing). Clarity records pages itself.

## Consent

Nothing from any network loads before the visitor's choice in Zero_Consent's
banner: Meta, TikTok and Pinterest wait for marketing cookies, Clarity for
analytics cookies. The banner lists them under those purposes. Events of the
page before the choice are sent once the visitor accepts; withdrawing
consent later stops them (each network's consent revoke where it has one).
Global Privacy Control keeps marketing, so the ad pixels, off.

## Settings

Stores > Configuration > Zero > Marketing Pixels, per store view: each
network on or off with its ID (Meta and Pinterest: digits; TikTok: letters
and digits; Clarity: the project ID). The hosts they load from are in the
storefront's CSP (etc/csp_whitelist.xml).

## License

OSL-3.0 or AFL-3.0, your choice: see `NOTICE.md`.

---

<a href="https://vilmate.com"><picture>
  <source media="(prefers-color-scheme: dark)" srcset="https://raw.githubusercontent.com/Fixstacks/zero/main/docs/images/vilmate-logo-dark.svg">
  <img src="https://raw.githubusercontent.com/Fixstacks/zero/main/docs/images/vilmate-logo.svg" alt="Vilmate" height="34" align="right">
</picture></a>

Zero is made by [Fixstacks](https://fixstacks.com/zero) in partnership with [Vilmate](https://vilmate.com), a software development company.
Documentation: https://fixstacks.com/zero/docs. Demo store: https://zero.fixstacks.com.
