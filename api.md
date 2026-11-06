# Microburbs Property Data API (v1.0.0)

## Endpoints
GET /v1/ping — Health check
GET /v1/me — Me
GET /v1/properties/{gnaf_id}/valuation/avm — AVM — automated valuation
GET /v1/properties/{gnaf_id}/basics/bed-count — Bedroom count
GET /v1/properties/{gnaf_id}/basics/bath-count — Bathroom count
GET /v1/properties/{gnaf_id}/basics/parking-count — Parking-space count
GET /v1/properties/{gnaf_id}/basics/dwelling-type — Dwelling type
GET /v1/properties/{gnaf_id}/basics/land-area-sqm — Land area (sqm)
GET /v1/properties/{gnaf_id}/profile — ABS geo profile
GET /v1/properties/{gnaf_id}/sale-history — Sale & for-sale history
GET /v1/properties/{gnaf_id}/sale-history-latest — Most-recent sale record
GET /v1/properties/{gnaf_id}/rent-history — Rental listing history
GET /v1/properties/{gnaf_id}/rent-history-latest — Most-recent rent observation
GET /v1/properties/{gnaf_id}/neighbours — Neighbours
GET /v1/properties/{gnaf_id}/comparables/cma-comp-set — CMA comparable set
GET /v1/properties/{gnaf_id}/comparables/cma-single-comp — CMA — single best comparable
GET /v1/properties/{gnaf_id}/comparables/recent-sales-nearby — Recent sales within a radius
GET /v1/properties/{gnaf_id}/development/zoning-code — Primary zoning code
GET /v1/properties/{gnaf_id}/development/zoning-overlays — Development overlays at this point
GET /v1/properties/{gnaf_id}/schools/nearby — Nearby schools
GET /v1/properties/{gnaf_id}/schools/ranking — Local school ranking
GET /v1/properties/{gnaf_id}/amenities/nearby — Nearby amenities
GET /v1/properties/{gnaf_id}/transport/nearby — Nearest transport by mode
GET /v1/properties/{gnaf_id}/risks/bushfire — Bushfire-prone overlay
GET /v1/properties/{gnaf_id}/risks/flood — Flood overlay
GET /v1/properties/{gnaf_id}/risks/historical-flood — Historical-flood overlay
GET /v1/properties/{gnaf_id}/risks/heritage — Heritage overlay
GET /v1/properties/{gnaf_id}/risks/public-housing — Public-housing overlay
GET /v1/properties/{gnaf_id}/risks/landslide — Landslide overlay
GET /v1/properties/{gnaf_id}/risks/erosion — Erosion overlay
GET /v1/properties/{gnaf_id}/risks/environment — Environmental-risk overlay
GET /v1/properties/{gnaf_id}/risks/hv-power-line — High-voltage power-line overlay
GET /v1/properties/{gnaf_id}/risks/mobile-black-spot — Mobile black-spot overlay
GET /v1/properties/{gnaf_id}/risks/all — All property risk overlays — bundle
GET /v1/properties/{gnaf_id}/valuation/all — All valuation outputs — bundle
GET /v1/properties/{gnaf_id}/basics/all — All basics — bundle
GET /v1/properties/{gnaf_id}/history/all — All sale + rent history — bundle
GET /v1/properties/{gnaf_id}/comparables/all — All comparables — bundle
GET /v1/properties/{gnaf_id}/development/all — All planning — bundle
GET /v1/properties/{gnaf_id}/schools/all — All schools — bundle
GET /v1/suburbs/{suburb_name}/profile — ABS geo profile
GET /v1/suburbs/list — List suburbs
GET /v1/suburbs/{suburb_name}/market/median-sale-price — Median sale price
GET /v1/suburbs/{suburb_name}/market/median-sale-price-series — Median sale price — full history (up to 20+ years)
GET /v1/suburbs/{suburb_name}/market/median-rent — Median weekly rent
GET /v1/suburbs/{suburb_name}/market/median-rent-series — Median rent — full history (including 2024–2025)
GET /v1/suburbs/{suburb_name}/market/price-growth-5y — 5-year price growth
GET /v1/suburbs/{suburb_name}/market/price-growth — Past price growth (1 / 3 / 5 / 10-year)
GET /v1/suburbs/{suburb_name}/market/yield-pct — Gross rental yield (%)
GET /v1/suburbs/{suburb_name}/market/days-on-market — Median days on market
GET /v1/suburbs/{suburb_name}/market/transaction-volume — Sale-transaction volume
GET /v1/suburbs/{suburb_name}/forecast/sale — Sale-price growth forecast
GET /v1/suburbs/{suburb_name}/listings/for-sale — Current for-sale listings
GET /v1/suburbs/{suburb_name}/listings/for-rent — Current rental listings
GET /v1/suburbs/{suburb_name}/demographics/age — Age-bracket breakdown
GET /v1/suburbs/{suburb_name}/demographics/income — Income-bracket breakdown
GET /v1/suburbs/{suburb_name}/ethnicity/ancestry — Ancestry breakdown
GET /v1/suburbs/{suburb_name}/ethnicity/birthplace — Country-of-birth breakdown
GET /v1/suburbs/{suburb_name}/schools/catchment — Public-school catchment polygons
GET /v1/suburbs/{suburb_name}/schools/nearby — Nearby schools
GET /v1/suburbs/{suburb_name}/development/da-count — Recent DA count
GET /v1/suburbs/{suburb_name}/development/da-list — Recent DA list
GET /v1/suburbs/{suburb_name}/risks/bushfire — Bushfire coverage
GET /v1/suburbs/{suburb_name}/risks/flood — Flood area coverage + optional polygon map
GET /v1/suburbs/{suburb_name}/similar — Similar suburbs
GET /v1/suburbs/{suburb_name}/market/all — Core market indicators — bundle
GET /v1/suburbs/{suburb_name}/demographics/all — Age + income — bundle
GET /v1/suburbs/{suburb_name}/ethnicity/all — All ethnicity — bundle
GET /v1/suburbs/{suburb_name}/schools/all — All schools — bundle
GET /v1/suburbs/{suburb_name}/development/all — DA count + DA list — bundle
GET /v1/suburbs/{suburb_name}/risks/all — Bushfire + flood — bundle
GET /v1/mbs/list — List mesh blocks (by suburb)
GET /v1/mbs/{mb_code}/profile — Profile (by mb_code)
GET /v1/suburbs/{suburb_name}/mesh-blocks/crime — Crime by mesh block — estimated rates and rank in suburb (by suburb) (beta)
GET /v1/suburbs/{suburb_name}/mesh-blocks/rent — Rent by mesh block — advertised rents, our estimate, yield (by suburb)
GET /v1/suburbs/{suburb_name}/mesh-blocks/signals — Signals by mesh block — recent price growth and turnover (by suburb) (beta)
GET /v1/suburbs/{suburb_name}/mesh-blocks/business — Business by mesh block — shops, cafes and services nearby (by suburb)
GET /v1/suburbs/{suburb_name}/mesh-blocks/building — Building by mesh block — the homes on each block (by suburb)
GET /v1/suburbs/{suburb_name}/mesh-blocks/parcels — Parcels by mesh block — lot sizes and shapes (by suburb) (beta)
GET /v1/suburbs/{suburb_name}/mesh-blocks/tenure — Tenure by mesh block — owned, mortgaged, rented (by suburb)
GET /v1/suburbs/{suburb_name}/mesh-blocks/income — Income by mesh block — household, personal and family incomes, salaries (by suburb)
GET /v1/suburbs/{suburb_name}/mesh-blocks/hazard — Hazard by mesh block — flood, bushfire, erosion, slope (by suburb)
GET /v1/suburbs/{suburb_name}/mesh-blocks/stress — Stress by mesh block — unemployment, arrears, insolvency (by suburb)
GET /v1/suburbs/{suburb_name}/mesh-blocks/transport — Transport by mesh block — stops, stations, commuting (by suburb)
GET /v1/suburbs/{suburb_name}/mesh-blocks/condition — Condition by mesh block — renovation signals from listings (by suburb)
GET /v1/suburbs/{suburb_name}/mesh-blocks/environment — Environment by mesh block — greenery, noise, solar (by suburb)
GET /v1/suburbs/{suburb_name}/mesh-blocks/forecast — Forecast by mesh block — modelled outlook (by suburb) (beta)
GET /v1/lga/list — List LGAs
GET /v1/lga/{lga_name}/profile — ABS geo profile
GET /v1/lga/{lga_name}/population — Population history
GET /v1/sa4/list — List SA4s
GET /v1/sa4/{sa4_name}/profile — ABS geo profile
GET /v1/geocode/address — Address → GNAF
GET /v1/geocode/suburb — Suburb autocomplete
GET /v1/area-stats/fields — Search area-statistics fields
GET /v1/area-stats/regions — List regions at a level
GET /v1/area-stats/{region_level}/{region}/values — Area statistics for a region
GET /v1/economics/series — List economic series
GET /v1/economics/series/{series_id} — Economic series history
GET /v1/economics/cpi — CPI history
GET /v1/economics/cpi/latest — Latest CPI by capital city
GET /v1/economics/cpi/adjust — Adjust a dollar amount for inflation
GET /v1/economics/cash-rate — Current RBA cash rate
GET /v1/economics/cash-rate/series — RBA cash rate history
GET /v1/suburbs/{suburb_name}/hero/summary — Suburb at a glance
GET /v1/suburbs/{suburb_name}/hero/neighbours — Neighbouring suburbs
GET /v1/suburbs/{suburb_name}/hero/price-growth-12mo — 12-month price growth
GET /v1/suburbs/{suburb_name}/market/mortgage-stress — Mortgage stress by mesh block (by suburb)
GET /v1/suburbs/{suburb_name}/market/investor-concentration — Investor concentration by mesh block (by suburb)
GET /v1/suburbs/{suburb_name}/market/built-year — Built-year profile by mesh block (by suburb)
GET /v1/suburbs/{suburb_name}/market/vacancy-map — Rental vacancy by mesh block (by suburb)
GET /v1/suburbs/{suburb_name}/market/land-values — Land values by mesh block (by suburb)
GET /v1/suburbs/{suburb_name}/market/strata-levies — Strata levies
GET /v1/suburbs/{suburb_name}/market/affordability — Affordability index
GET /v1/suburbs/{suburb_name}/market/bedroom-stats — Bedroom stats
GET /v1/suburbs/{suburb_name}/market/repeat-sales — Repeat sales
GET /v1/suburbs/{suburb_name}/market/supply-pressure — Supply pressure by mesh block (by suburb)
GET /v1/suburbs/{suburb_name}/market/days-on-market-benchmark — Days on market — regional benchmark
GET /v1/suburbs/{suburb_name}/market/comparable-suburbs — Comparable suburbs
GET /v1/suburbs/{suburb_name}/market/rent-map — Median weekly rent by mesh block (by suburb)
GET /v1/suburbs/{suburb_name}/market/yield-map — Gross rental yield by mesh block (by suburb)
GET /v1/suburbs/{suburb_name}/lifestyle/livability-map — Livability scores by mesh block (by suburb)
GET /v1/suburbs/{suburb_name}/market/growth-map — Past price growth (1, 3, 5, 10 years) by mesh block (by suburb)
GET /v1/suburbs/{suburb_name}/market/negative-gearing-map — Negative gearing by mesh block (by suburb)
GET /v1/suburbs/{suburb_name}/development/density-map — Dwelling density by mesh block (by suburb)
GET /v1/suburbs/{suburb_name}/development/new-dwellings-map — New-dwelling applications by mesh block (by suburb)
GET /v1/suburbs/{suburb_name}/demographics/voting-map — Projected voting by mesh block (by suburb)
GET /v1/suburbs/{suburb_name}/demographics/single-parents-map — Single-parent families by mesh block (by suburb)
GET /v1/suburbs/{suburb_name}/demographics/population-map — Population and dwellings by mesh block (by suburb)
GET /v1/suburbs/{suburb_name}/sales/recent — Recent sales (last 3 years)
GET /v1/suburbs/{suburb_name}/sales/summary — Sales summary (3-year count + median)
GET /v1/suburbs/{suburb_name}/crime/summary — Crime — suburb vs national benchmark
GET /v1/suburbs/{suburb_name}/crime/breakdown — Crime — breakdown by type
GET /v1/suburbs/{suburb_name}/crime/by-mesh-block — Crime rate by mesh block (by suburb)
GET /v1/suburbs/{suburb_name}/risks/property-hazard-counts — Property hazard counts
GET /v1/suburbs/{suburb_name}/risks/extras — Extra risk indicators by mesh block (by suburb)
GET /v1/suburbs/{suburb_name}/risks/counts — Hazard item counts
GET /v1/suburbs/{suburb_name}/risks/slope — Terrain slope profile
GET /v1/suburbs/{suburb_name}/risks/heritage-share — Heritage share of properties
GET /v1/suburbs/{suburb_name}/lifestyle/summary — Lifestyle summary — POIs, terrain, landmarks
GET /v1/suburbs/{suburb_name}/lifestyle/poi-impacts — Amenity price impacts
GET /v1/suburbs/{suburb_name}/lifestyle/livability — Livability scores + regional benchmark
GET /v1/suburbs/{suburb_name}/lifestyle/pois — POIs / amenities in the suburb (pubs, cafes, gyms, schools, …)
GET /v1/suburbs/{suburb_name}/lifestyle/landmarks — Nearest beach + hospital
GET /v1/suburbs/{suburb_name}/lifestyle/narrative — Livability narrative sentences
GET /v1/suburbs/{suburb_name}/lifestyle/cbd — Distance to the nearest city and to the nearest capital
GET /v1/suburbs/{suburb_name}/development/zoning-map — Zoning map (polygons)
GET /v1/suburbs/{suburb_name}/development/building-controls — Building controls — height & FSR
GET /v1/suburbs/{suburb_name}/development/construction-activity — Construction activity by mesh block (by suburb)
GET /v1/suburbs/{suburb_name}/development/supply — New supply, units vs houses, by mesh block (by suburb)
GET /v1/suburbs/{suburb_name}/development/profile — Development profile
GET /v1/suburbs/{suburb_name}/development/council-rates — Average council rates
GET /v1/suburbs/{suburb_name}/development/applications — Development applications
GET /v1/suburbs/{suburb_name}/demographics/population-history — Total population, history & projection
GET /v1/suburbs/{suburb_name}/demographics/business — Local business mix
GET /v1/suburbs/{suburb_name}/demographics/voting — Projected voting profile
GET /v1/suburbs/{suburb_name}/demographics/ancestry-map — Dominant ancestry by mesh block (by suburb)
GET /v1/suburbs/{suburb_name}/demographics/cultural-integration — Cultural-integration score by mesh block (by suburb)
GET /v1/suburbs/{suburb_name}/demographics/tenure — Housing tenure by mesh block (by suburb)
GET /v1/suburbs/{suburb_name}/demographics/cohorts — Regional & neighbour cohort ranks
GET /v1/suburbs/{suburb_name}/demographics/income-map — Income by mesh block (by suburb)
GET /v1/suburbs/{suburb_name}/street-forecasts — Street-level price forecasts
GET /v1/suburbs/{suburb_name}/shapes/boundary — Suburb boundary polygon
GET /v1/suburbs/{suburb_name}/shapes/neighbours — Neighbouring suburb boundaries
GET /v1/suburbs/{suburb_name}/shapes/mesh-blocks — Mesh-block polygons (by suburb)
GET /v1/suburbs/{suburb_name}/shapes/hazards — Hazard-overlay polygons by layer
GET /v1/suburbs/{suburb_name}/shapes/public-housing-sa1 — Public-housing share by SA1
GET /v1/suburbs/{suburb_name}/shapes/noise-heatmap — Noise-map regions
GET /v1/suburbs/{suburb_name}/shapes/easements — Easement geometries
GET /v1/suburbs/{suburb_name}/shapes/busy-roads — Busy-road segments
GET /v1/properties/{gnaf_id}/valuation/land-values — Council land values — 5-year series
GET /v1/properties/{gnaf_id}/valuation/value-series — AVM value over time
GET /v1/properties/{gnaf_id}/valuation/negative-gearing — Negative-gearing stat
GET /v1/properties/{gnaf_id}/valuation/agent-quoting — Agent quoting accuracy
GET /v1/properties/{gnaf_id}/surroundings/properties — Surrounding properties (200 m)
GET /v1/properties/{gnaf_id}/surroundings/tenure — Tenure by mesh block within 200 m (by gnaf_id)
GET /v1/properties/{gnaf_id}/surroundings/public-housing — Surrounding public-housing flags (200 m)
GET /v1/properties/{gnaf_id}/surroundings/parcels — Surrounding cadastral parcels (200 m)
GET /v1/properties/{gnaf_id}/surroundings/listing-history-signals — Surrounding listing-history signals (200 m)
GET /v1/properties/{gnaf_id}/context/mesh-blocks — Mesh-block stats within 1 km (by gnaf_id)
GET /v1/properties/{gnaf_id}/context/street-bedroom-series — Bedroom-band price series
GET /v1/properties/{gnaf_id}/context/nearby-for-sale — Nearby for-sale listings
GET /v1/suburbs/{suburb_name}/market/stock-on-market — Stock on market
GET /v1/suburbs/{suburb_name}/market/months-of-supply — Months of supply
GET /v1/suburbs/{suburb_name}/market/vacancy-rate — Rental vacancy rate — suburb headline
GET /v1/suburbs/{suburb_name}/market/yield-pct-series — Gross rental yield — full series
GET /v1/suburbs/{suburb_name}/market/vacancy-rate-series — Rental vacancy rate — full series
GET /v1/suburbs/{suburb_name}/market/recent-price-movement — Recent price movement (last 4 weeks)
GET /v1/suburbs/{suburb_name}/risks/hv-power-lines — High-voltage power lines
GET /v1/suburbs/{suburb_name}/risks/capital-growth-impact — Capital-growth impact per hazard
GET /v1/suburbs/{suburb_name}/market/growth-drivers — Capital-growth drivers
GET /v1/suburbs/{suburb_name}/demographics/underclass-drag — Underclass drag
GET /v1/suburbs/{suburb_name}/demographics/unemployment — Unemployment by mesh block (by suburb)
GET /v1/suburbs/{suburb_name}/demographics/single-parents — Single-parent families
GET /v1/suburbs/{suburb_name}/demographics/private-school — Private-school students by mesh block (by suburb)
GET /v1/suburbs/{suburb_name}/development/density — Dwelling & population density
GET /v1/suburbs/{suburb_name}/development/council-intelligence — Council intelligence signals
GET /v1/suburbs/{suburb_name}/market/median-price-map — Median sale price by mesh block (by suburb)
GET /v1/properties/{gnaf_id}/street/profile — Street profile — this property's street vs its suburb
GET /v1/suburbs/finder/fields — Finder field catalog
GET /v1/suburbs/finder/regions — Finder scope regions
GET /v1/suburbs/finder/count — Count matching suburbs
GET /v1/suburbs/finder/search — Search suburbs

