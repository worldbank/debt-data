Static pages that rebuild the International Debt Statistics analytical country tables (https://www.worldbank.org/en/programs/debt-statistics/ids) from the World Bank API. Data is fetched live in the browser, so there is no build step or server code.

index.html, standard/index.html: the two pages
ids-dashboard.js, ids-dashboard.css: code and styling shared by both pages
ids-tables.js: analytical table rows, formulas and number formatting
ids-standard-table.js: standard table rows
tools/verify.mjs: compares both tables with the published pages
Both pages also cover the regions and income groups with published regional tables. Link to a country or group by adding ?country=KEN or ?country=SSA to either page.

Built with Claude Code
