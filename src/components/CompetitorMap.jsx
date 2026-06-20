import { useEffect, useRef } from 'react';
import L from 'leaflet';
import { useFormatPrice } from '@/lib/utils';

// Auto-discovery radiusi — backend AUTO_DISCOVERY_RADIUS_KM (0.3 km) bilan bir xil.
// Shu doira ichidagi eng yaqin raqiblar avtomatik olinadi.
const COMPETITOR_RADIUS_M = 300;

// ─── Helpers ─────────────────────────────────────────
function relevanceScore(comp, myStars) {
  const starScore = (() => {
    if (!comp.stars || !myStars) return 0.5;
    const diff = Math.abs(comp.stars - myStars);
    if (diff === 0) return 1.0;
    if (diff === 1) return 0.7;
    if (diff === 2) return 0.4;
    return 0.15;
  })();
  const distScore = (() => {
    const km = comp.distanceKm || 99;
    if (km <= 0.5) return 1.0;
    if (km <= 1.5) return 0.9;
    if (km <= 3)   return 0.75;
    if (km <= 5)   return 0.55;
    if (km <= 10)  return 0.35;
    return 0.15;
  })();
  return starScore * 0.6 + distScore * 0.4;
}

function scoreColor(score) {
  if (score >= 0.75) return '#10b981';
  if (score >= 0.45) return '#f59e0b';
  return '#94a3b8';
}

function getGooglePrice(comp) {
  if (!comp.latestPrices) return 0;
  return comp.latestPrices.google || comp.latestPrices.get?.('google') || 0;
}

function myHotelIcon() {
  return L.divIcon({
    html: `<div style="
      width:40px;height:40px;border-radius:50%;
      background:linear-gradient(135deg,#6366f1,#8b5cf6);
      border:3px solid white;
      display:flex;align-items:center;justify-content:center;
      font-size:18px;
      box-shadow:0 4px 14px rgba(99,102,241,0.55);
    ">★</div>`,
    className: '',
    iconSize: [40, 40],
    iconAnchor: [20, 20],
  });
}

function compIcon(score, priceText) {
  const color = scoreColor(score);
  const text = priceText || '?';
  const w = Math.max(36, text.length * 8 + 18);
  return L.divIcon({
    html: `<div style="
      background:${color};width:${w}px;height:24px;border-radius:12px;
      border:2px solid white;display:flex;align-items:center;justify-content:center;
      font-size:10px;font-weight:700;color:white;
      box-shadow:0 2px 8px rgba(0,0,0,0.25);cursor:pointer;white-space:nowrap;
    ">${text}</div>`,
    className: '',
    iconSize: [w, 24],
    iconAnchor: [Math.round(w / 2), 12],
  });
}

// Discover (xaritada bosish bilan) topilgan mehmonxonalar uchun marker.
// Yashil = qo'shilmagan, ko'k = allaqachon qo'shilgan.
function discoverIcon(isAdded) {
  const color = isAdded ? '#6366f1' : '#10b981';
  return L.divIcon({
    html: `<div style="
      width:28px;height:28px;border-radius:50%;
      background:${color};color:white;
      border:2px solid white;display:flex;align-items:center;justify-content:center;
      font-size:14px;font-weight:700;
      box-shadow:0 2px 8px rgba(0,0,0,0.3);cursor:pointer;
    ">${isAdded ? '✓' : '+'}</div>`,
    className: '',
    iconSize: [28, 28],
    iconAnchor: [14, 14],
  });
}

// ─── Component ────────────────────────────────────────
export default function CompetitorMap({
  hotel, competitors, myStars, onSelectComp,
  // Xaritani bosishni yoqish — discovery rejimi
  enableDiscover = false,
  onAddDiscovered,
}) {
  const formatPrice = useFormatPrice();
  const containerRef = useRef(null);
  const mapRef = useRef(null);
  const layerRef = useRef(null);
  const discoverLayerRef = useRef(null);

  const [myLng, myLat] = hotel?.location?.coordinates || [];
  const hasMyCoords = !!(myLat && myLng);

  const hasAnyCoords = hasMyCoords || competitors.some((c) => {
    const [, lat] = c.location?.coordinates || [];
    return !!lat;
  });

  // Initialize map once on mount
  useEffect(() => {
    if (!containerRef.current) return;

    const defaultCenter = hasMyCoords ? [myLat, myLng] : [41.3, 69.3];
    const map = L.map(containerRef.current, { center: defaultCenter, zoom: 13 });

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
      maxZoom: 19,
    }).addTo(map);

    const layer = L.layerGroup().addTo(map);
    const discoverLayer = L.layerGroup().addTo(map);
    mapRef.current = map;
    layerRef.current = layer;
    discoverLayerRef.current = discoverLayer;

    // Grid/flex ichida init paytida konteyner kengligi 0 bo'lishi mumkin —
    // Leaflet o'lchamni noto'g'ri hisoblab, plitkalarni yuklamaydi (bo'sh
    // kulrang xarita). invalidateSize + ResizeObserver bilan tuzatamiz.
    const invalidate = () => map.invalidateSize();
    const raf = requestAnimationFrame(invalidate);
    const t = setTimeout(invalidate, 250);
    const ro = new ResizeObserver(invalidate);
    ro.observe(containerRef.current);

    return () => {
      cancelAnimationFrame(raf);
      clearTimeout(t);
      ro.disconnect();
      layer.clearLayers();
      map.remove();
      mapRef.current = null;
      layerRef.current = null;
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Add / refresh markers when data changes
  useEffect(() => {
    const map = mapRef.current;
    const layer = layerRef.current;
    if (!map || !layer) return;

    layer.clearLayers();
    const bounds = [];

    // My hotel marker
    if (hasMyCoords) {
      bounds.push([myLat, myLng]);

      // 600 m raqib radiusi — shu doira ichidagilar auto-raqib bo'ladi.
      const radiusCircle = L.circle([myLat, myLng], {
        radius: COMPETITOR_RADIUS_M,
        color: '#6366f1',
        weight: 1.5,
        opacity: 0.6,
        fillColor: '#6366f1',
        fillOpacity: 0.08,
      })
        .addTo(layer)
        .bindTooltip(`${COMPETITOR_RADIUS_M} m raqib radiusi`, { direction: 'top', sticky: true });

      // Doira to'liq ko'rinishi uchun chegaralarini fitBounds'ga qo'shamiz.
      const cb = radiusCircle.getBounds();
      bounds.push([cb.getNorth(), cb.getEast()], [cb.getSouth(), cb.getWest()]);

      L.marker([myLat, myLng], { icon: myHotelIcon(), zIndexOffset: 1000 })
        .addTo(layer)
        .bindTooltip(
          `<div style="font-size:11px">
            <div style="color:#6366f1;font-weight:700">★ Sizning hotel</div>
            <div style="font-weight:600">${hotel?.name || ''}</div>
            ${hotel?.currentPrice > 0 ? `<div style="color:#10b981">${formatPrice(hotel.currentPrice)}</div>` : ''}
          </div>`,
          { direction: 'top', offset: [0, -22], opacity: 0.97 }
        );
    }

    // Competitor markers
    for (const c of competitors) {
      const [lng, lat] = c.location?.coordinates || [];
      if (!lat || !lng) continue;

      const score = relevanceScore(c, myStars);
      const price = getGooglePrice(c);
      const priceText = price > 0 ? formatPrice(price) : '';
      const stars = c.stars ? '★'.repeat(c.stars) : '';

      bounds.push([lat, lng]);

      L.marker([lat, lng], { icon: compIcon(score, priceText), riseOnHover: true })
        .addTo(layer)
        .bindTooltip(
          `<div style="font-size:12px;min-width:120px">
            <div style="font-weight:700;max-width:160px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${c.name}</div>
            ${stars ? `<div style="color:#f59e0b;letter-spacing:1px">${stars}</div>` : ''}
            <div style="display:flex;gap:8px;margin-top:3px;font-size:11px">
              ${c.rating > 0 ? `<span>⭐ ${c.rating.toFixed(1)}</span>` : ''}
              ${priceText ? `<span style="font-weight:700;color:#10b981">${priceText}</span>` : ''}
            </div>
            ${c.distanceKm > 0 ? `<div style="font-size:10px;color:#888;margin-top:2px">📍 ${c.distanceKm} km</div>` : ''}
            <div style="font-size:10px;color:#6366f1;margin-top:5px">Bosing → batafsil</div>
          </div>`,
          { direction: 'top', offset: [0, -10], opacity: 0.97 }
        )
        .on('click', () => onSelectComp(c));
    }

    // Fit all markers in view
    if (bounds.length > 1) {
      try { map.fitBounds(L.latLngBounds(bounds), { padding: [52, 52], maxZoom: 15 }); } catch {}
    } else if (bounds.length === 1) {
      map.setView(bounds[0], 14);
    }
  }, [competitors, hotel, myStars, hasMyCoords, myLat, myLng, onSelectComp, formatPrice]);

  // Discover rejimi — xaritani bosish + topilgan mehmonxonalarni ko'rsatish
  useEffect(() => {
    if (!enableDiscover) return;
    const map = mapRef.current;
    const discoverLayer = discoverLayerRef.current;
    if (!map || !discoverLayer) return;

    let cancelled = false;
    let scanning = false;

    async function handleClick(e) {
      if (scanning) return;
      const { lat, lng } = e.latlng;
      scanning = true;
      try {
        const { hotelApi } = await import('@/lib/api');
        const res = await hotelApi.discoverNearby(lat, lng, 1.5);
        if (cancelled) return;

        discoverLayer.clearLayers();

        // Qidiruv markazi (kichik ko'rsatkich)
        L.circleMarker([lat, lng], {
          radius: 5,
          color: '#6366f1',
          fillColor: '#6366f1',
          fillOpacity: 0.6,
        }).addTo(discoverLayer).bindTooltip('Qidiruv markazi', { direction: 'top' });

        for (const h of (res.hotels || [])) {
          if (!h.lat || !h.lng) continue;
          if (h.isOwn) continue;

          const marker = L.marker([h.lat, h.lng], {
            icon: discoverIcon(h.isAdded),
            riseOnHover: true,
          }).addTo(discoverLayer);

          const ratingHtml = h.rating > 0
            ? `<span>⭐ ${h.rating.toFixed(1)} (${h.reviewCount})</span>` : '';
          const statusHtml = h.isAdded
            ? `<div style="color:#6366f1;font-size:10px;margin-top:4px">✓ Allaqachon qo'shilgan</div>`
            : `<div style="color:#10b981;font-size:10px;margin-top:4px">+ Qo'shish uchun bosing</div>`;

          marker.bindTooltip(
            `<div style="font-size:12px;min-width:140px">
              <div style="font-weight:700;max-width:200px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${h.name}</div>
              ${h.address ? `<div style="font-size:10px;color:#666;margin-top:2px;max-width:200px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${h.address}</div>` : ''}
              <div style="display:flex;gap:8px;margin-top:3px;font-size:11px">${ratingHtml}</div>
              ${statusHtml}
            </div>`,
            { direction: 'top', offset: [0, -14], opacity: 0.97 }
          );

          marker.on('click', () => {
            if (h.isAdded || !onAddDiscovered) return;
            onAddDiscovered(h);
          });
        }
      } catch (err) {
        console.warn('Discover xato:', err.message);
      } finally {
        scanning = false;
      }
    }

    map.on('click', handleClick);
    return () => {
      cancelled = true;
      map.off('click', handleClick);
      discoverLayer.clearLayers();
    };
  }, [enableDiscover, onAddDiscovered]);

  if (!hasAnyCoords) {
    return (
      <div className="flex items-center justify-center h-80 rounded-2xl bg-muted/30 border border-border/60">
        <div className="text-center px-6">
          <p className="text-sm text-muted-foreground">Koordinatalar yo&apos;q</p>
          <p className="text-[11px] text-muted-foreground/70 mt-1">
            Hotel yaratishda joylashuv kiriting
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-border/60 shadow-soft" style={{ isolation: 'isolate' }}>
      <div className="rounded-t-2xl overflow-hidden">
        <div ref={containerRef} style={{ height: 420 }} />
      </div>
      <div className="flex items-center gap-4 flex-wrap px-4 py-2.5 bg-card/90 border-t border-border/60 text-[10px] text-muted-foreground rounded-b-2xl">
        <span className="flex items-center gap-1.5">
          <span style={{ background: '#6366f1' }} className="w-2.5 h-2.5 rounded-full inline-block" />
          Sizning hotel
        </span>
        <span className="flex items-center gap-1.5">
          <span style={{ background: '#10b981' }} className="w-2.5 h-2.5 rounded-full inline-block" />
          Yuqori moslik
        </span>
        <span className="flex items-center gap-1.5">
          <span style={{ background: '#f59e0b' }} className="w-2.5 h-2.5 rounded-full inline-block" />
          O&apos;rta moslik
        </span>
        <span className="flex items-center gap-1.5">
          <span style={{ background: '#94a3b8' }} className="w-2.5 h-2.5 rounded-full inline-block" />
          Past moslik
        </span>
        <span className="flex items-center gap-1.5">
          <span style={{ borderColor: '#6366f1', background: 'rgba(99,102,241,0.12)' }} className="w-2.5 h-2.5 rounded-full inline-block border" />
          {COMPETITOR_RADIUS_M} m radius
        </span>
        <span className="ml-auto opacity-70">Raqib ustiga bosing → batafsil</span>
      </div>
    </div>
  );
}
