import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, ArrowRight, MapPin, Building2, Globe, Loader2, Check, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Logo } from '@/components/Logo';
import { LanguageSwitcher } from '@/components/LanguageSwitcher';
import { SearchSelect } from '@/components/ui/search-select';
import { useT } from '@/lib/i18n';
import { useAuth } from '@/lib/auth';
import { searchApi, hotelApi, authApi } from '@/lib/api';
import { cn } from '@/lib/utils';

export default function Onboarding() {
  const t = useT();
  const navigate = useNavigate();
  const user = useAuth((s) => s.user);
  const updateUser = useAuth((s) => s.updateUser);

  const [step, setStep] = useState(1);
  const [countries, setCountries] = useState([]);
  const [countryQuery, setCountryQuery] = useState('');
  const [country, setCountry] = useState(null);
  const [city, setCity] = useState(null);
  const [hotel, setHotel] = useState(null);
  const [hotelManual, setHotelManual] = useState({ name: '', address: '' });
  const [useManual, setUseManual] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    searchApi.countries().then(setCountries).catch(console.error);
  }, []);

  useEffect(() => {
    setCity(null);
    setHotel(null);
    setUseManual(false);
    setHotelManual({ name: '', address: '' });
  }, [country?.code]);

  useEffect(() => {
    setHotel(null);
    setUseManual(false);
    setHotelManual({ name: '', address: '' });
  }, [city?.name, city?.lat, city?.lng]);

  const hotelSearchCity = city
    ? { city: city.name, lat: city.lat, lng: city.lng }
    : {};

  // Davlat qidiruvi — nom, ISO kod yoki valyuta bo'yicha filtr.
  const filteredCountries = (() => {
    const q = countryQuery.trim().toLowerCase();
    if (!q) return countries;
    return countries.filter(
      (c) =>
        c.name?.toLowerCase().includes(q) ||
        c.code?.toLowerCase().includes(q) ||
        c.currency?.toLowerCase().includes(q)
    );
  })();

  const handleSubmit = async () => {
    setLoading(true);
    setError('');
    try {
      const hotelData = useManual
        ? {
            name: hotelManual.name,
            address: hotelManual.address,
            country: country.name,
            countryCode: country.code,
            city: city.name,
            lat: city.lat,
            lng: city.lng,
          }
        : {
            name: hotel.name,
            address: hotel.address,
            country: country.name,
            countryCode: country.code,
            city: city.name,
            lat: hotel.lat,
            lng: hotel.lng,
            googlePlaceId: hotel.placeId || '',
            osmId: hotel.osmId || '',
          };
      const created = await hotelApi.create(hotelData);

      // Yangi yaratilgan hotel'ni aktiv qilamiz — keyingi sahifalar shu hotel
      // ma'lumotlarini ko'rsatadi (X-Hotel-Id header orqali).
      if (created?._id) {
        localStorage.setItem('rr_active_hotel_id', String(created._id));
      }

      // Refresh user
      const { user: refreshedUser } = await authApi.me();
      updateUser(refreshedUser);
      navigate('/dashboard', { replace: true });
    } catch (err) {
      setError(err.response?.data?.error || err.message);
    } finally {
      setLoading(false);
    }
  };

  const canProceed =
    (step === 1 && country) ||
    (step === 2 && city) ||
    (step === 3 && (useManual ? hotelManual.name.length >= 2 : hotel));

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4 relative">
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-primary/5 pointer-events-none" />

      <div className="relative w-full max-w-[520px] mb-3 flex justify-between items-center">
        <Logo />
        <LanguageSwitcher />
      </div>

      <div className="relative w-full max-w-[520px] bg-card border rounded-2xl p-9 shadow-sm animate-fade-in">
        {/* Stepper */}
        <div className="flex gap-2 mb-7">
          {[1, 2, 3].map((s) => (
            <div
              key={s}
              className={cn(
                'h-1 flex-1 rounded-full transition-colors',
                s < step ? 'bg-primary' : s === step ? 'bg-primary/50' : 'bg-border'
              )}
            />
          ))}
        </div>

        <div className="mb-6">
          <div className="text-[11px] uppercase tracking-wider text-primary font-semibold mb-1.5">
            {t('onboarding')} · {step}/3
          </div>
          <h2 className="text-2xl font-semibold tracking-tight">
            {step === 1 && t('selectCountry')}
            {step === 2 && t('selectCity')}
            {step === 3 && t('findHotel')}
          </h2>
          <p className="text-sm text-muted-foreground mt-1.5">
            {step === 1 && t('selectCountryDesc')}
            {step === 2 && t('selectCityDesc')}
            {step === 3 && t('findHotelDesc')}
          </p>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-md bg-destructive/10 border border-destructive/20 text-sm text-destructive">
            {error}
          </div>
        )}

        {/* Step 1 — Country */}
        {step === 1 && (
          <div className="space-y-3">
            {/* Qidiruv */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
              <Input
                value={countryQuery}
                onChange={(e) => setCountryQuery(e.target.value)}
                placeholder={t('countrySearchPlaceholder')}
                className="pl-9"
                autoFocus
              />
            </div>

            <div className="space-y-2 max-h-[280px] overflow-y-auto pr-1">
              {countries.length === 0 ? (
                <div className="flex items-center justify-center py-8 text-muted-foreground">
                  <Loader2 className="h-5 w-5 animate-spin" />
                </div>
              ) : filteredCountries.length === 0 ? (
                <div className="text-center py-8 text-sm text-muted-foreground">
                  {t('noResults')}
                </div>
              ) : (
                filteredCountries.map((c) => (
                  <button
                    key={c.code}
                    type="button"
                    onClick={() => setCountry(c)}
                    className={cn(
                      'w-full flex items-center gap-3 p-3 rounded-lg border transition-colors text-left',
                      country?.code === c.code
                        ? 'border-primary bg-primary/5'
                        : 'border-border hover:border-input hover:bg-accent'
                    )}
                  >
                    <span className="text-2xl">{c.flag || '🌍'}</span>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium truncate">{c.name}</div>
                      <div className="text-[11px] text-muted-foreground">
                        {c.currency} · {c.languages?.[0] || 'N/A'}
                      </div>
                    </div>
                    {country?.code === c.code && <Check className="h-4 w-4 text-primary" />}
                  </button>
                ))
              )}
            </div>
          </div>
        )}

        {/* Step 2 — City */}
        {step === 2 && (
          <SearchSelect
            placeholder={t('cityPlaceholder')}
            fetchOptions={(q) => searchApi.cities(q, country?.code)}
            getKey={(c) => `${c.name}-${c.lat}`}
            getLabel={(c) => `${c.name}${c.region ? ', ' + c.region : ''}`}
            renderOption={(c) => (
              <div>
                <div className="text-sm font-medium">{c.name}</div>
                <div className="text-[11px] text-muted-foreground flex items-center gap-1">
                  <MapPin className="h-3 w-3" />
                  {c.region && `${c.region}, `}
                  {c.country}
                  {c.population && ` · ${c.population.toLocaleString()} aholisi`}
                </div>
              </div>
            )}
            selected={city}
            onSelect={setCity}
          />
        )}

        {/* Step 3 — Hotel */}
        {step === 3 && (
          <div className="space-y-3">
            {!useManual ? (
              <>
                <SearchSelect
                  placeholder={t('hotelPlaceholder')}
                  fetchOptions={(q) => searchApi.hotels(q, country?.code, hotelSearchCity)}
                  getKey={(h) => h.placeId || h.osmId || h.name}
                  getLabel={(h) => h.name}
                  renderOption={(h) => (
                    <div>
                      <div className="text-sm font-medium">{h.name}</div>
                      <div className="text-[11px] text-muted-foreground flex items-center gap-1">
                        <Building2 className="h-3 w-3" />
                        {h.address}
                      </div>
                    </div>
                  )}
                  selected={hotel}
                  onSelect={setHotel}
                />
                <button
                  type="button"
                  onClick={() => {
                    setUseManual(true);
                    setHotel(null);
                  }}
                  className="text-xs text-primary hover:underline"
                >
                  {t('notListed')} →
                </button>
              </>
            ) : (
              <div className="space-y-3">
                <div className="space-y-1.5">
                  <Label htmlFor="hname">Hotel nomi</Label>
                  <Input
                    id="hname"
                    placeholder="Hotel Tashkent"
                    value={hotelManual.name}
                    onChange={(e) =>
                      setHotelManual({ ...hotelManual, name: e.target.value })
                    }
                    autoFocus
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="haddr">Manzil</Label>
                  <Input
                    id="haddr"
                    placeholder="Amir Temur ko'chasi 1"
                    value={hotelManual.address}
                    onChange={(e) =>
                      setHotelManual({ ...hotelManual, address: e.target.value })
                    }
                  />
                </div>
                <button
                  type="button"
                  onClick={() => setUseManual(false)}
                  className="text-xs text-primary hover:underline"
                >
                  ← Ro'yxatdan tanlash
                </button>
              </div>
            )}
          </div>
        )}

        {/* Footer buttons */}
        <div className="flex justify-between gap-3 mt-7">
          <Button
            variant="outline"
            onClick={() => setStep(step - 1)}
            disabled={step === 1 || loading}
          >
            <ArrowLeft className="h-4 w-4" />
            {t('back')}
          </Button>

          {step < 3 ? (
            <Button onClick={() => setStep(step + 1)} disabled={!canProceed}>
              {t('next')}
              <ArrowRight className="h-4 w-4" />
            </Button>
          ) : (
            <Button onClick={handleSubmit} disabled={!canProceed || loading}>
              {loading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Check className="h-4 w-4" />
              )}
              {t('finish')}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
