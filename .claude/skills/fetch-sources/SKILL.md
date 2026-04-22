---
name: fetch-sources
description: Fetch the user-provided sources which will be used as the basis for the artist biography. Use only when supplied with an explicit list of URLs pertaining to the artist.
allowed-tools: WebFetch
---

# Fetch sources for artist bio

- The user will typically provide an artist name and some URLs to seed your context for writing the bio. You must use your web fetch tool to read those URLs before proceeding further

- If any of those URLs is the artist's own website, you may spider out from the homepage to read other relevant pages e.g. their artist statement or body of work. If doing so, report to the user what other pages you have read

- **IMPORTANT**: To avoid 404s make sure you visit pages that are actually in the site's navigation menu, rather than just guessing "/cv" or "/about"
