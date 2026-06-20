import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { LANGUAGES, getLangDir } from "../../lib/i18n";

export default function LangPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const hotelId = searchParams.get("h") || localStorage.getItem("guest_hotel_id");
  const savedLang = localStorage.getItem("guest_lang") || "en";
  const [selected, setSelected] = useState(savedLang);

  useEffect(() => {
    if (!hotelId) return;
    localStorage.setItem("guest_hotel_id", hotelId);
  }, [hotelId]);

  // RTL desteği
  useEffect(() => {
    document.documentElement.dir = getLangDir(selected);
    document.documentElement.lang = selected;
  }, [selected]);

  const handleContinue = () => {
    localStorage.setItem("guest_lang", selected);
    document.documentElement.dir = getLangDir(selected);
    navigate(`/service${hotelId ? `?h=${hotelId}` : ""}`);
  };

  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center p-5">
      <div className="w-full max-w-sm animate-fade-up">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="text-4xl mb-4">🏨</div>
          <h1 className="text-2xl font-semibold text-gray-900 tracking-tight">
            {LANGUAGES.find(l => l.code === selected)?.native
              ? (() => {
                  const map = {
                    en:"Select language",ru:"Выберите язык",zh:"请选择语言",ar:"اختر لغتك",
                    tr:"Dil seçin",de:"Sprache wählen",fr:"Choisissez la langue",it:"Seleziona lingua",
                    es:"Selecciona idioma",ko:"언어 선택",ja:"言語を選択",fa:"زبان انتخاب کنید",
                    uz:"Tilni tanlang",hi:"भाषा चुनें",pt:"Selecione o idioma",
                  };
                  return map[selected] || "Select language";
                })()
              : "Select language"}
          </h1>
        </div>

        {/* Language grid */}
        <div className="grid grid-cols-3 gap-2.5 mb-6">
          {LANGUAGES.map(({ code, native, flag }) => (
            <button
              key={code}
              onClick={() => setSelected(code)}
              className={`
                flex flex-col items-center gap-1.5 p-3 rounded-xl border-2
                transition-all duration-150 text-center
                ${selected === code
                  ? "border-blue-500 bg-blue-50"
                  : "border-gray-100 bg-white hover:border-gray-200 hover:bg-gray-50"
                }
              `}
            >
              <span className="text-2xl leading-none">{flag}</span>
              <span className={`text-[11px] font-medium leading-tight
                ${selected === code ? "text-blue-700" : "text-gray-600"}`}>
                {native}
              </span>
            </button>
          ))}
        </div>

        <button onClick={handleContinue} className="btn-primary">
          {(() => {
            const map = {
              en:"Continue",ru:"Продолжить",zh:"继续",ar:"متابعة",tr:"Devam",
              de:"Weiter",fr:"Continuer",it:"Continua",es:"Continuar",ko:"계속",
              ja:"続ける",fa:"ادامه",uz:"Davom etish",hi:"जारी रखें",pt:"Continuar",
            };
            return map[selected] || "Continue";
          })()}
        </button>
      </div>
    </div>
  );
}
