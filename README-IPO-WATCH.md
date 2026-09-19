# Igris Capital - IPO Watch data layer

The website is separated into two parts:

1. `unlisted.html` = presentation/UI.
2. `ipo-data.json` = data feed consumed by the page.

This lets GitHub Pages remain static while a permitted data process updates one JSON file.

## Data sources

For IPO issue details, use permitted primary/official sources such as NSE/BSE and SEBI offer documents. GMP is an unofficial grey-market observation and should only be populated when Igris has a permitted source for that observation.

## GMP

The UI calculates:

`GMP % = GMP / Issue Price × 100`

It does not manufacture a GMP when no source quote exists. Store `gmpSource`, `sourceUrl`, and `updatedAt` for auditability.

## Automation

Set the GitHub Actions secret `IPO_FEED_URL` to a permitted/licensed JSON feed that returns the Igris schema. Until that is configured, `ipo-data.json` remains empty rather than displaying fabricated market data.

Do not hide or disguise a scraper to evade a third-party site's terms, robots controls, authentication, or detection. If a third-party GMP provider permits API/data use, use its permitted API/feed and follow its attribution requirements.
