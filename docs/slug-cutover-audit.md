# Canonical slug cutover audit

Generated from live production (`lzoyzrsgjjhffuzgnglu`) on 2026-08-13, **after**
the app team shipped `health_locations.slug` and `health_practitioners.slug`.

Compares the website's temporary derived slug against the canonical column.

**Result: 16 MATCH · 15 MISMATCH · 0 MISSING (of 31).**

The canonical convention strips professional post-nominals from practitioner
slugs (`andrew-agoado`, not `andrew-agoado-ap-dom`). The website's derivation
kept them, because it had only the display name to work from.

**Nothing was published under the derived practitioner slugs** — the network
went live in this same session and no provider URL has been indexed — so the
mismatches cost nothing and no redirects are required. The website now uses the
canonical column everywhere and derivation is dead code on the resolution path.

| entity | display name | CANONICAL slug | temp derived slug | status |
|---|---|---|---|---|
| location | Acupuncture & Natural Health Solutions | `acupuncture-and-natural-health-solutions-naples` | `acupuncture-natural-health-solutions-naples` | **MISMATCH** |
| location | Acupuncture Center of Naples | `acupuncture-center-of-naples` | `acupuncture-center-of-naples` | **MATCH** |
| location | Arizona Wellness Medicine | `arizona-wellness-medicine-paradise-valley` | `arizona-wellness-medicine-paradise-valley` | **MATCH** |
| location | Boca Raton Acupuncture | `boca-raton-acupuncture` | `boca-raton-acupuncture` | **MATCH** |
| location | Centner Wellness — Brickell | `centner-wellness-brickell-miami` | `centner-wellness-brickell-miami` | **MATCH** |
| location | Eastern Medicine Center | `eastern-medicine-center-scottsdale` | `eastern-medicine-center-scottsdale` | **MATCH** |
| location | Essence for Wellness | `essence-for-wellness-miami` | `essence-for-wellness-miami` | **MATCH** |
| location | Maristany Medical | `maristany-medical-naples` | `maristany-medical-naples` | **MATCH** |
| location | Miami Beach Comprehensive Wellness Center | `miami-beach-comprehensive-wellness-center` | `miami-beach-comprehensive-wellness-center` | **MATCH** |
| location | Naples Center for Functional Medicine | `naples-center-for-functional-medicine` | `naples-center-for-functional-medicine` | **MATCH** |
| location | Palm Beach Healing Arts | `palm-beach-healing-arts-west-palm-beach` | `palm-beach-healing-arts-west-palm-beach` | **MATCH** |
| location | Shin Wellness | `shin-wellness-miami` | `shin-wellness-miami` | **MATCH** |
| location | South Florida Acupuncture Associates — Palm Beach Gardens | `south-florida-acupuncture-associates-palm-beach-gardens` | `south-florida-acupuncture-associates-palm-beach-gardens` | **MATCH** |
| location | Yihong Joy Hao, MD | `yihong-joy-hao-md-boca-raton` | `yihong-joy-hao-md-boca-raton` | **MATCH** |
| practitioner | Andrea Louden, DOM | `andrea-louden` | `andrea-louden-dom` | **MISMATCH** |
| practitioner | Andrew Agoado, AP, DOM | `andrew-agoado` | `andrew-agoado-ap-dom` | **MISMATCH** |
| practitioner | Carol Roberts, MD | `carol-roberts` | `carol-roberts-md` | **MISMATCH** |
| practitioner | Christopher Estes | `christopher-estes` | `christopher-estes` | **MATCH** |
| practitioner | Eduardo Maristany, MD | `eduardo-maristany` | `eduardo-maristany-md` | **MISMATCH** |
| practitioner | Emily Parke, DO | `emily-parke` | `emily-parke-do` | **MISMATCH** |
| practitioner | Emily Rowe | `emily-rowe` | `emily-rowe` | **MATCH** |
| practitioner | Jing Liu, LAc, OMD, PhD | `jing-liu` | `jing-liu-lac-omd-phd` | **MISMATCH** |
| practitioner | Katherine Borse, AP | `katherine-borse` | `katherine-borse-ap` | **MISMATCH** |
| practitioner | Landon Agoado, AP, DOM | `landon-agoado` | `landon-agoado-ap-dom` | **MISMATCH** |
| practitioner | Lina Sakr, MD | `lina-sakr` | `lina-sakr-md` | **MISMATCH** |
| practitioner | Matthew Enright, AP, DOM | `matthew-enright` | `matthew-enright-ap-dom` | **MISMATCH** |
| practitioner | Toni Eatros, MS, DiplAc, AP | `toni-eatros` | `toni-eatros-ms-diplac-ap` | **MISMATCH** |
| practitioner | Wendy Gallego | `wendy-gallego` | `wendy-gallego` | **MATCH** |
| practitioner | Xiu Qiong Cen, AP, DOM | `xiu-qiong-cen` | `xiu-qiong-cen-ap-dom` | **MISMATCH** |
| practitioner | Yihong Joy Hao, MD | `yihong-joy-hao` | `yihong-joy-hao-md` | **MISMATCH** |
| practitioner | Yinan (Kevin) Wang, LAc | `yinan-wang` | `yinan-kevin-wang-lac` | **MISMATCH** |
