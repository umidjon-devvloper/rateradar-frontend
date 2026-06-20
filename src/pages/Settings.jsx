import { useState, useEffect } from 'react';
import { useOutletContext, useNavigate } from 'react-router-dom';
import {
  User as UserIcon,
  Building2,
  Globe,
  LogOut,
  Loader2,
  Check,
  AlertCircle,
  Sparkles,
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/lib/auth';
import { useT, useLang } from '@/lib/i18n';
import { authApi, hotelApi } from '@/lib/api';

export default function Settings() {
  const t = useT();
  const navigate = useNavigate();
  const user = useAuth((s) => s.user);
  const updateUser = useAuth((s) => s.updateUser);
  const logout = useAuth((s) => s.logout);
  const { hotel, setHotel } = useOutletContext();
  const lang = useLang((s) => s.lang);
  const setLang = useLang((s) => s.setLang);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <div className="space-y-6 animate-fade-in max-w-3xl">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">{t('settings')}</h1>
        <p className="text-sm text-muted-foreground mt-1">
          {t('accountDesc')}
        </p>
      </div>

      <ProfileSection user={user} updateUser={updateUser} t={t} />
      {hotel && <HotelSection hotel={hotel} setHotel={setHotel} t={t} />}
      <LanguageSection lang={lang} setLang={setLang} t={t} />
      <AccountSection user={user} onLogout={handleLogout} t={t} />
    </div>
  );
}

function ProfileSection({ user, updateUser, t }) {
  const [name, setName] = useState(user?.name || '');
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState('');

  const dirty = name !== user?.name;

  const save = async () => {
    setSaving(true);
    setError('');
    try {
      const data = await authApi.updateProfile({ name });
      updateUser(data.user);
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (err) {
      setError(err.response?.data?.error || err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
            <UserIcon className="h-4 w-4" />
          </div>
          <div>
            <CardTitle>{t('profile')}</CardTitle>
            <CardDescription>{t('profileDesc')}</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-1.5">
          <Label htmlFor="name">{t('name')}</Label>
          <Input
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder={t('name')}
          />
        </div>

        <div className="space-y-1.5">
          <Label>{t('email')}</Label>
          <Input value={user?.email || ''} disabled />
          <p className="text-[11px] text-muted-foreground">
            Email o'zgartirib bo'lmaydi
          </p>
        </div>

        {error && (
          <div className="flex items-start gap-2 p-3 rounded-md bg-destructive/10 border border-destructive/20 text-sm text-destructive">
            <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        <div className="flex items-center gap-2 pt-1">
          <Button onClick={save} disabled={!dirty || saving}>
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
            {t('saveChanges')}
          </Button>
          {saved && (
            <span className="flex items-center gap-1 text-xs text-success">
              <Check className="h-3.5 w-3.5" />
              {t('changesSaved')}
            </span>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

const OTA_URL_FIELDS = [
  { key: 'TripAdvisor', label: 'TripAdvisor', placeholder: 'https://www.tripadvisor.com/Hotel_Review-g...-d...-Reviews-...' },
  { key: 'Booking.com', label: 'Booking.com', placeholder: 'https://www.booking.com/hotel/uz/<slug>.html' },
  { key: 'Agoda', label: 'Agoda', placeholder: 'https://www.agoda.com/<slug>/hotel/...html' },
];

// TripAdvisor URL'dan Xotelo hotel_key (g{id}-d{id}) ajratib oladi —
// backend bilan bir xil mantiq. Foydalanuvchiga avtomatik aniqlangan
// key'ni ko'rsatish uchun.
function extractXoteloKey(url) {
  if (!url) return '';
  const m = String(url).match(/Hotel-Review-(g\d+)-d(\d+)/i) || String(url).match(/\b(g\d+)-d(\d+)\b/i);
  return m ? `${m[1].toLowerCase()}-d${m[2]}` : '';
}

function HotelSection({ hotel, setHotel, t }) {
  const [name, setName] = useState(hotel?.name || '');
  const [address, setAddress] = useState(hotel?.address || '');
  const [stars, setStars] = useState(hotel?.stars || 0);
  const [rooms, setRooms] = useState(hotel?.rooms || 0);
  const [currentPrice, setCurrentPrice] = useState(hotel?.currentPrice || 0);
  const [otaUrls, setOtaUrls] = useState(() => {
    const src = hotel?.otaUrls || {};
    return Object.fromEntries(OTA_URL_FIELDS.map((f) => [f.key, src[f.key] || '']));
  });
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [enriching, setEnriching] = useState(false);
  const [enriched, setEnriched] = useState(false);
  const [error, setError] = useState('');
  const [otaFinding, setOtaFinding] = useState('');
  const [otaMessage, setOtaMessage] = useState({});

  const autoFindOtaUrl = async (ota) => {
    setOtaFinding(ota);
    setOtaMessage((m) => ({ ...m, [ota]: '' }));
    setError('');
    try {
      const res = await hotelApi.findOtaUrl(ota, true);
      if (res.url) {
        setOtaUrls((prev) => ({ ...prev, [ota]: res.url }));
        const next = {
          ...hotel,
          otaUrls: { ...(hotel?.otaUrls || {}), [ota]: res.url },
        };
        setHotel(next);
        setOtaMessage((m) => ({ ...m, [ota]: `✓ Topildi: ${res.url}` }));
        setTimeout(() => setOtaMessage((m) => ({ ...m, [ota]: '' })), 5000);
      } else {
        setOtaMessage((m) => ({ ...m, [ota]: res.message || 'Topilmadi' }));
      }
    } catch (err) {
      setError(err.response?.data?.error || err.message);
    } finally {
      setOtaFinding('');
    }
  };

  const enrichFromInternet = async () => {
    setEnriching(true);
    setError('');
    try {
      const { hotel: updated } = await hotelApi.enrich();
      setHotel(updated);
      setName(updated.name || '');
      setAddress(updated.address || '');
      setStars(updated.stars || 0);
      setRooms(updated.rooms || 0);
      setCurrentPrice(updated.currentPrice || 0);
      setEnriched(true);
      setTimeout(() => setEnriched(false), 3000);
    } catch (err) {
      setError(err.response?.data?.error || err.message);
    } finally {
      setEnriching(false);
    }
  };

  useEffect(() => {
    setName(hotel?.name || '');
    setAddress(hotel?.address || '');
    setStars(hotel?.stars || 0);
    setRooms(hotel?.rooms || 0);
    setCurrentPrice(hotel?.currentPrice || 0);
    const src = hotel?.otaUrls || {};
    setOtaUrls(Object.fromEntries(OTA_URL_FIELDS.map((f) => [f.key, src[f.key] || ''])));
  }, [hotel?._id]);

  const dirty =
    name !== hotel?.name ||
    address !== (hotel?.address || '') ||
    Number(stars) !== Number(hotel?.stars || 0) ||
    Number(rooms) !== Number(hotel?.rooms || 0) ||
    Number(currentPrice) !== Number(hotel?.currentPrice || 0) ||
    OTA_URL_FIELDS.some((f) => otaUrls[f.key] !== ((hotel?.otaUrls || {})[f.key] || ''));

  const save = async () => {
    setSaving(true);
    setError('');
    try {
      // Bo'sh bo'lmagan URL'larni saqlash
      const cleanOtaUrls = Object.fromEntries(
        Object.entries(otaUrls).filter(([, v]) => v.trim())
      );
      const updated = await hotelApi.update({
        name,
        address,
        stars: Number(stars),
        rooms: Number(rooms),
        currentPrice: Number(currentPrice),
        otaUrls: cleanOtaUrls,
      });
      setHotel(updated);
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (err) {
      setError(err.response?.data?.error || err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
              <Building2 className="h-4 w-4" />
            </div>
            <div>
              <CardTitle>{t('hotelInfo')}</CardTitle>
              <CardDescription>{t('hotelInfoDesc')}</CardDescription>
            </div>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={enrichFromInternet}
            disabled={enriching}
            title={t('enrichDesc')}
          >
            {enriching ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <Sparkles className="h-3.5 w-3.5" />
            )}
            {enriching ? t('enriching') : t('enrichFromInternet')}
          </Button>
        </div>
        {enriched && (
          <div className="mt-2 flex items-center gap-1.5 text-xs text-green-600">
            <Check className="h-3.5 w-3.5" />
            {t('enrichSuccess')}
          </div>
        )}
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-1.5">
          <Label htmlFor="hotelName">{t('myHotel')}</Label>
          <Input
            id="hotelName"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="address">{t('address')}</Label>
          <Input
            id="address"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
          />
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="space-y-1.5">
            <Label htmlFor="stars">{t('starsCount')}</Label>
            <Input
              id="stars"
              type="number"
              min="0"
              max="5"
              value={stars}
              onChange={(e) => setStars(e.target.value)}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="rooms">{t('rooms')}</Label>
            <Input
              id="rooms"
              type="number"
              min="0"
              value={rooms}
              onChange={(e) => setRooms(e.target.value)}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="currentPrice">{t('myPrice')} ($)</Label>
            <Input
              id="currentPrice"
              type="number"
              min="0"
              value={currentPrice}
              onChange={(e) => setCurrentPrice(e.target.value)}
              placeholder="95"
            />
          </div>
        </div>

        {['Booking.com', 'Agoda'].map((ota) => (
          <div key={ota} className="space-y-1.5 pt-2 border-t">
            <div className="flex items-center justify-between gap-2">
              <Label className="flex items-center gap-2">
                {ota} URL
                <Badge variant="outline" className="text-[10px]">Sharhlar uchun</Badge>
              </Label>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => autoFindOtaUrl(ota)}
                disabled={otaFinding === ota}
                title={`Google qidiruv orqali ${ota} URL'ini topish`}
              >
                {otaFinding === ota ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                ) : (
                  <Sparkles className="h-3.5 w-3.5" />
                )}
                {otaFinding === ota ? 'Qidirilmoqda...' : 'Avtomatik topish'}
              </Button>
            </div>
            <Input
              value={otaUrls[ota] || ''}
              onChange={(e) => setOtaUrls((prev) => ({ ...prev, [ota]: e.target.value }))}
              placeholder={ota === 'Booking.com'
                ? 'https://www.booking.com/hotel/uz/<slug>.html'
                : 'https://www.agoda.com/<slug>/hotel/...html'}
              className="text-xs font-mono"
            />
            {otaMessage[ota] && (
              <p className="text-[11px] text-emerald-600 dark:text-emerald-400 break-all">{otaMessage[ota]}</p>
            )}
            <p className="text-[11px] text-muted-foreground">
              {ota} sharhlari shu URL'dan olinadi.
              "Avtomatik topish" Google'da qidiradi.
            </p>
          </div>
        ))}

        <div className="space-y-3 pt-2 border-t">
          <div className="flex items-center gap-2">
            <Label className="text-sm font-medium">TripAdvisor URL</Label>
            <Badge variant="outline" className="text-[10px]">Narx manbai uchun</Badge>
          </div>
          <p className="text-[11px] text-muted-foreground -mt-1">
            TripAdvisor URL orqali Booking.com, Agoda, Hotels.com va boshqa kanallardan narxlar avtomatik olinadi.
          </p>
          {OTA_URL_FIELDS.filter((f) => f.key !== 'Booking.com' && f.key !== 'Agoda').map((f) => (
            <div key={f.key} className="space-y-1">
              <Label htmlFor={`ota-${f.key}`} className="text-[11px] text-muted-foreground uppercase tracking-wider">
                {f.label}
              </Label>
              <Input
                id={`ota-${f.key}`}
                value={otaUrls[f.key]}
                onChange={(e) => setOtaUrls((prev) => ({ ...prev, [f.key]: e.target.value }))}
                placeholder={f.placeholder}
                className="text-xs font-mono"
              />
              {f.key === 'TripAdvisor' && (
                extractXoteloKey(otaUrls[f.key]) ? (
                  <p className="text-[11px] text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                    <Check className="h-3 w-3 shrink-0" />
                    Hotel Key avtomatik aniqlandi:{' '}
                    <code className="font-mono">{extractXoteloKey(otaUrls[f.key])}</code>
                  </p>
                ) : otaUrls[f.key] ? (
                  <p className="text-[11px] text-amber-600 dark:text-amber-400">
                    Bu URL'dan key ajratib bo'lmadi — to'g'ri TripAdvisor Hotel_Review URL ekanini tekshiring.
                  </p>
                ) : null
              )}
            </div>
          ))}
        </div>

        {error && (
          <div className="flex items-start gap-2 p-3 rounded-md bg-destructive/10 border border-destructive/20 text-sm text-destructive">
            <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        <div className="flex items-center gap-2 pt-1">
          <Button onClick={save} disabled={!dirty || saving}>
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
            {t('saveChanges')}
          </Button>
          {saved && (
            <span className="flex items-center gap-1 text-xs text-success">
              <Check className="h-3.5 w-3.5" />
              {t('changesSaved')}
            </span>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

function LanguageSection({ lang, setLang, t }) {
  const langs = [
    { code: 'uz', label: 'O\'zbek', flag: '🇺🇿' },
    { code: 'en', label: 'English', flag: '🇬🇧' },
    { code: 'ru', label: 'Русский', flag: '🇷🇺' },
  ];

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
            <Globe className="h-4 w-4" />
          </div>
          <div>
            <CardTitle>{t('language')}</CardTitle>
            <CardDescription>{t('languageDesc')}</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-3 gap-2">
          {langs.map((l) => (
            <button
              key={l.code}
              onClick={() => setLang(l.code)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-md border text-sm font-medium transition-colors ${
                lang === l.code
                  ? 'border-primary bg-primary/5 text-primary'
                  : 'hover:bg-accent text-muted-foreground hover:text-foreground'
              }`}
            >
              <span className="text-base">{l.flag}</span>
              {l.label}
            </button>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

function AccountSection({ user, onLogout, t }) {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-destructive/10 text-destructive flex items-center justify-center">
            <LogOut className="h-4 w-4" />
          </div>
          <div>
            <CardTitle>{t('account')}</CardTitle>
            <CardDescription>{t('accountDesc')}</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between p-3 rounded-md bg-muted/40 border">
          <div>
            <div className="text-sm font-medium">Plan</div>
            <div className="text-xs text-muted-foreground mt-0.5">
              Hozirgi tarif rejasi
            </div>
          </div>
          <Badge variant="outline" className="capitalize">
            {user?.plan || 'free'}
          </Badge>
        </div>

        <Button variant="destructive" onClick={onLogout} className="w-full sm:w-auto">
          <LogOut className="h-4 w-4" />
          {t('logout')}
        </Button>
      </CardContent>
    </Card>
  );
}
