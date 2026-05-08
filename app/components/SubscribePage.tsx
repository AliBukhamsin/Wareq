import { ArrowRight, ArrowLeft } from 'lucide-react';
import { Language } from '../translations';

interface SubscribePageProps {
  onBack: () => void;
  language: Language;
  onSelect: (plan: 'Free' | 'Basic' | 'Pro') => void;
}

interface Plan {
  key: 'Free' | 'Basic' | 'Pro';
  titleAr: string;
  titleEn: string;
  priceAr: string;
  priceEn: string;
  periodAr: string;
  periodEn: string;
  features: string[];
  grad: string;
  ring: string;
  badgeAr?: string;
  badgeEn?: string;
}

export default function SubscribePage({ onBack, language, onSelect }: SubscribePageProps) {
  const isAr = language === 'ar';

  const plans: Plan[] = [
    {
      key: 'Free',
      titleAr: 'مجاني', titleEn: 'Free',
      priceAr: '٠ ر.س', priceEn: '$0',
      periodAr: 'للأبد', periodEn: 'forever',
      features: isAr
        ? ['نبتتان أساسيتان فقط', 'تشخيصان يومياً', '٥ أسئلة مع الذكاء الاصطناعي', 'أنواع نباتات محدودة', 'يحتوي على إعلانات']
        : ['2 basic plants only', '2 diagnoses per day', '5 AI questions', 'Limited plant types', 'Includes ads'],
      grad: 'from-emerald-300 to-green-400',
      ring: 'ring-emerald-300',
    },
    {
      key: 'Basic',
      titleAr: 'الأساسية', titleEn: 'Basic',
      priceAr: '٧٤.٩٩ ر.س', priceEn: '$19.99',
      periodAr: 'شهرياً', periodEn: '/ month',
      features: isAr
        ? ['بدون إعلانات', '٢٠ تشخيصاً يومياً', '١٥ سؤالاً مع الذكاء الاصطناعي', 'جميع أنواع النباتات', 'إشعارات مخصصة']
        : ['No ads', '20 diagnoses per day', '15 AI questions', 'All plant types', 'Custom notifications'],
      grad: 'from-emerald-500 to-green-600',
      ring: 'ring-emerald-400',
      badgeAr: 'الأكثر شعبية',
      badgeEn: 'Most Popular',
    },
    {
      key: 'Pro',
      titleAr: 'الاحترافية', titleEn: 'Pro',
      priceAr: '١٤٩.٩٩ ر.س', priceEn: '$39.99',
      periodAr: 'شهرياً', periodEn: '/ month',
      features: isAr
        ? ['بدون إعلانات', 'نباتات وتشخيصات وأسئلة بلا حدود', 'مساعد ذكي بلا حدود', 'تحليلات نمو متقدمة', 'دعم أولوية ٢٤/٧']
        : ['No ads', 'Unlimited plants, diagnoses & AI', 'Unlimited AI assistant', 'Advanced growth analytics', 'Priority 24/7 support'],
      grad: 'from-green-700 to-emerald-800',
      ring: 'ring-green-600',
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-50" dir={isAr ? 'rtl' : 'ltr'}>
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-green-100 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center gap-3">
            <button
              onClick={onBack}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              {isAr
                ? <ArrowRight size={24} className="text-gray-700" />
                : <ArrowLeft size={24} className="text-gray-700" />}
            </button>
            <div className="flex-1">
              <h1 className="text-2xl font-bold text-gray-800">
                {isAr ? 'ادعمنا — اختر باقتك' : 'Subscribe — Choose your plan'}
              </h1>
              <p className="text-sm text-gray-500">
                {isAr ? 'دعمك يساعدنا على نموّ وارق 🌱' : 'Your support helps Wareq grow 🌱'}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Plans */}
      <div className="max-w-7xl mx-auto px-4 py-10">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6" dir="ltr">
          {plans.map(p => (
            <div
              key={p.key}
              className={`relative rounded-2xl bg-gradient-to-br ${p.grad} text-white p-8 shadow-xl ring-1 ${p.ring} ring-inset hover:shadow-2xl hover:-translate-y-1 transition-all overflow-hidden`}
              style={{ minHeight: 460 }}
            >
              {/* Polished sheen */}
              <div className="absolute inset-x-0 top-0 h-32 bg-gradient-to-b from-white/25 to-transparent pointer-events-none" />
              <div className="absolute -right-16 -top-16 w-48 h-48 rounded-full bg-white/10 blur-2xl pointer-events-none" />

              {p.badgeEn && (
                <div className="absolute top-4 right-4 bg-white text-emerald-700 text-xs font-semibold px-3 py-1 rounded-full shadow">
                  {isAr ? p.badgeAr : p.badgeEn}
                </div>
              )}

              <div dir={isAr ? 'rtl' : 'ltr'} className="relative">
                <h2 className="text-3xl font-bold mb-1">{isAr ? p.titleAr : p.titleEn}</h2>
                <p className="text-white/80 text-sm mb-6">
                  {p.key === 'Free' && (isAr ? 'ابدأ رحلتك مع نباتاتك' : 'Start your plant journey')}
                  {p.key === 'Basic' && (isAr ? 'كل ما تحتاجه لعناية أفضل' : 'Everything for better care')}
                  {p.key === 'Pro' && (isAr ? 'للهواة الجادين والمحترفين' : 'For serious growers')}
                </p>

                <div className="flex items-baseline gap-2 mb-8">
                  <span className="text-5xl font-bold">{isAr ? p.priceAr : p.priceEn}</span>
                  <span className="text-white/80 text-sm">{isAr ? p.periodAr : p.periodEn}</span>
                </div>

                <ul className="space-y-3 mb-8">
                  {p.features.map((f, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm">
                      <span className="mt-0.5 inline-flex items-center justify-center w-5 h-5 rounded-full bg-white/25 shrink-0">✓</span>
                      <span>{f}</span>
                    </li>
                  ))}
                </ul>

                <button
                  onClick={() => onSelect(p.key)}
                  className="w-full bg-white text-emerald-700 font-semibold py-3 rounded-xl hover:bg-emerald-50 transition-colors shadow-md"
                >
                  {p.key === 'Free'
                    ? (isAr ? 'ابدأ مجاناً' : 'Get Started')
                    : (isAr ? 'اشترك الآن' : 'Subscribe')}
                </button>
              </div>
            </div>
          ))}
        </div>

        <p className="text-center text-xs text-gray-500 mt-8">
          {isAr ? 'يمكنك الإلغاء في أي وقت — لا التزامات.' : 'Cancel anytime — no commitments.'}
        </p>
      </div>
    </div>
  );
}
