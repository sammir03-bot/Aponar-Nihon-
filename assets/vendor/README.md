# Open source browser libraries

Pinned browser bundles are served from this site so camera and map initialization
do not depend on third-party script CDNs.

- ZXing Browser **0.1.5**, MIT: https://github.com/zxing-js/browser .
  `zxing/zxing-browser.min.js` from the published npm UMD distribution.
- Leaflet **1.9.4**, BSD-2-Clause: https://github.com/Leaflet/Leaflet .
  `leaflet/` contains the published npm distribution and license.

The ZXing UMD distribution embeds ZXing JS Library (Apache-2.0); its distributed
license is included in `zxing/LIBRARY-LICENSE`.

Product data is provided by Open Food Facts (ODbL), including community-entered
ingredient and label information. A reported halal label is not a verified
certificate. https://world.openfoodfacts.org/data

Place data is from OpenStreetMap contributors (ODbL), queried through Overpass.
The VK Maps public Overpass instance is used first, with Private.coffee as a
fallback; requests are sequential and stop on rate limiting.
Halal place listings reflect explicit map tags or names, not an independent
certification. Attribution is visible on the map and in the place list.
https://www.openstreetmap.org/copyright

Standard OpenStreetMap raster tiles are requested only for visible map views,
with browser caching and attribution; no tile scraping or offline prefetch.
https://operations.osmfoundation.org/policies/tiles/

The read-only Worker API validates bounded inputs, identifies the application to
upstream services, caches public data for 24 hours, handles timeouts/rate limits,
and never accepts arbitrary upstream URLs or user-provided Overpass queries.
