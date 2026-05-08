import { useState, useEffect } from 'react';
import { Cloud, Sun, CloudRain, Wind, Droplets, AlertTriangle, Loader2 } from 'lucide-react';

interface WeatherAdviceProps {
  location: string;
  language: 'ar' | 'en';
}

const CITY_COORDINATES: Record<string, { lat: number; lng: number }> = {
  'الرياض': { lat: 24.7136, lng: 46.6753 },
  'riyadh': { lat: 24.7136, lng: 46.6753 },
  'جدة': { lat: 21.4858, lng: 39.1925 },
  'jeddah': { lat: 21.4858, lng: 39.1925 },
  'مكة': { lat: 21.3891, lng: 39.8579 },
  'mecca': { lat: 21.3891, lng: 39.8579 },
  'المدينة': { lat: 24.5247, lng: 39.5692 },
  'medina': { lat: 24.5247, lng: 39.5692 },
  'الدمام': { lat: 26.3927, lng: 49.9777 },
  'dammam': { lat: 26.3927, lng: 49.9777 },
  'القصيم': { lat: 26.3260, lng: 43.9750 },
  'qassim': { lat: 26.3260, lng: 43.9750 },
  'الطائف': { lat: 21.2854, lng: 40.4149 },
  'taif': { lat: 21.2854, lng: 40.4149 },
  'default': { lat: 24.7136, lng: 46.6753 },
};

function getCoordinatesFromLocation(location: string): { lat: number; lng: number } {
  const lower = location.toLowerCase().trim();
  for (const [key, coords] of Object.entries(CITY_COORDINATES)) {
    if (lower.includes(key.toLowerCase())) return coords;
  }
  return CITY_COORDINATES['default'];
}

function toArabicNumerals(num: number | string): string {
  return String(num).replace(/\d/g, d => '٠١٢٣٤٥٦٧٨٩'[+d]);
}

// Open-Meteo weather code mapping
function getConditionFromCode(code: number): string {
  if (code === 0) return 'CLEAR';
  if (code <= 2) return 'PARTLY_CLOUDY';
  if (code === 3) return 'CLOUDY';
  if ([45, 48].includes(code)) return 'FOG';
  if ([51, 53, 55, 56, 57].includes(code)) return 'DRIZZLE';
  if ([61, 63, 65, 66, 67, 80, 81, 82].includes(code)) return 'RAIN';
  if ([71, 73, 75, 77, 85, 86].includes(code)) return 'SNOW';
  if ([95, 96, 99].includes(code)) return 'THUNDERSTORM';
  return 'CLEAR';
}

function getConditionText(code: number, language: 'ar' | 'en'): string {
  const isAr = language === 'ar';
  if (code === 0) return isAr ? 'صافٍ' : 'Clear';
  if (code <= 2) return isAr ? 'غائم جزئياً' : 'Partly Cloudy';
  if (code === 3) return isAr ? 'غائم' : 'Cloudy';
  if ([45, 48].includes(code)) return isAr ? 'ضبابي' : 'Foggy';
  if ([51, 53, 55].includes(code)) return isAr ? 'رذاذ' : 'Drizzle';
  if ([61, 63, 65].includes(code)) return isAr ? 'ممطر' : 'Rainy';
  if ([80, 81, 82].includes(code)) return isAr ? 'زخات مطر' : 'Rain Showers';
  if ([95, 96, 99].includes(code)) return isAr ? 'عاصفة رعدية' : 'Thunderstorm';
  return isAr ? 'مشمس' : 'Sunny';
}

function getWeatherIcon(conditionType: string) {
  if (conditionType.includes('RAIN') || conditionType.includes('DRIZZLE')) return CloudRain;
  if (conditionType.includes('CLOUD') || conditionType.includes('FOG')) return Cloud;
  if (conditionType.includes('WIND') || conditionType.includes('STORM')) return Wind;
  return Sun;
}

function getPlantAdvice(conditionType: string, humidity: number, tempC: number, language: 'ar' | 'en'): string[] {
  const isAr = language === 'ar';
  const isHot = tempC > 35;
  const isCold = tempC < 15;
  const isHumid = humidity > 70;
  const isDry = humidity < 40;
  const isRainy = conditionType.includes('RAIN') || conditionType.includes('DRIZZLE');
  const isSunny = conditionType.includes('CLEAR');

  if (isRainy) return isAr ? [
    'الرطوبة عالية — قلّل تكرار ري النباتات الداخلية.',
    'تأكد من أن النباتات الخارجية لديها تصريف مناسب.',
    'وقت مناسب لجمع مياه الأمطار للري المستقبلي.'
  ] : [
    'High humidity — reduce indoor plant watering frequency.',
    'Ensure outdoor plants have proper drainage.',
    'Good time to collect rainwater for future watering.'
  ];

  if (isHot) return isAr ? [
    'الحرارة مرتفعة — زِد كمية الري خاصةً للنباتات الخارجية.',
    'تجنب الري في أشد ساعات الظهيرة حرارة.',
    'انقل النباتات الحساسة للحرارة بعيداً عن الشمس المباشرة.'
  ] : [
    'High temperature — increase watering especially for outdoor plants.',
    'Avoid watering during the hottest midday hours.',
    'Move heat-sensitive plants away from direct sunlight.'
  ];

  if (isSunny && isDry) return isAr ? [
    'ظروف مشمسة وجافة — تحقق من رطوبة التربة يومياً.',
    'النباتات القريبة من النوافذ قد تحتاج ري أكثر تكراراً.',
    'فكر في رش الأوراق برذاذ ماء لزيادة الرطوبة.'
  ] : [
    'Sunny and dry — check soil moisture daily.',
    'Plants near windows may need more frequent watering.',
    'Consider misting leaves to increase humidity.'
  ];

  if (isHumid) return isAr ? [
    'الرطوبة مرتفعة — انتبه لعلامات الفطريات أو تعفن الجذور.',
    'تأكد من وجود تهوية جيدة حول النباتات.',
    'قلّل الري قليلاً إذ التربة تجف ببطء.'
  ] : [
    'Humidity is high — watch for signs of mold or root rot.',
    'Ensure good air circulation around plants.',
    'Reduce watering slightly as soil dries slower.'
  ];

  if (isCold) return isAr ? [
    'الجو بارد — قلّل من الري لأن النباتات تنمو ببطء.',
    'حافظ على النباتات الاستوائية بعيداً عن النوافذ الباردة.',
    'ظروف مثالية لنقل النباتات أو تغيير الأصيص.'
  ] : [
    'Cool weather — reduce watering as plants grow slower.',
    'Keep tropical plants away from cold windows.',
    'Ideal conditions for transplanting or repotting.'
  ];

  return isAr ? [
    'ظروف مثالية لمعظم النباتات اليوم.',
    'جدول الري القياسي يجب أن يكون مناسباً.',
    'وقت رائع للعناية بنباتاتك وتقليمها.'
  ] : [
    'Ideal conditions for most plants today.',
    'Standard watering schedule should be sufficient.',
    'Great time to tend to your plants and trim them.'
  ];
}

export default function WeatherAdvice({ location, language }: WeatherAdviceProps) {
  const [weather, setWeather] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const labels = language === 'ar' ? {
    title: 'نصائح العناية حسب الطقس',
    condition: 'الحالة', humidity: 'الرطوبة', temperature: 'الحرارة',
    careRecommendations: 'توصيات العناية',
    loading: 'جارٍ تحميل بيانات الطقس...',
    error: 'تعذّر تحميل بيانات الطقس',
  } : {
    title: 'Weather-Based Care Tips',
    condition: 'Condition', humidity: 'Humidity', temperature: 'Temperature',
    careRecommendations: 'Care Recommendations',
    loading: 'Loading weather data...',
    error: 'Could not load weather data',
  };

  useEffect(() => {
    const fetchWeather = async () => {
      setLoading(true);
      setError('');
      try {
        const coords = getCoordinatesFromLocation(location);
        const url = `https://api.open-meteo.com/v1/forecast?latitude=${coords.lat}&longitude=${coords.lng}&current=temperature_2m,relative_humidity_2m,weather_code&timezone=auto`;
        const res = await fetch(url);
        if (!res.ok) throw new Error(`API error: ${res.status}`);
        const data = await res.json();
        setWeather(data.current);
      } catch (err: any) {
        setError(err.message || 'Unknown error');
      } finally {
        setLoading(false);
      }
    };
    fetchWeather();
  }, [location]);

  const weatherCode = weather?.weather_code ?? 0;
  const tempC = weather?.temperature_2m ?? 0;
  const humidity = weather?.relative_humidity_2m ?? 0;
  const conditionType = getConditionFromCode(weatherCode);
  const conditionText = getConditionText(weatherCode, language);
  const WeatherIcon = getWeatherIcon(conditionType);
  const advice = getPlantAdvice(conditionType, humidity, tempC, language);

  return (
    <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg p-6 shadow-md" dir={language === 'ar' ? 'rtl' : 'ltr'}>
      <div className={`flex items-center gap-3 mb-4 ${language === 'ar' ? 'justify-end' : 'justify-start'}`}>
        <div className={language === 'ar' ? 'text-right' : 'text-left'}>
          <h3 className="font-semibold text-lg">{labels.title}</h3>
          <p className="text-sm text-gray-600">{location}</p>
        </div>
        <WeatherIcon className="text-blue-600 shrink-0" size={32} />
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-8 gap-3">
          <Loader2 className="animate-spin text-blue-500" size={24} />
          <span className="text-gray-500 text-sm">{labels.loading}</span>
        </div>
      ) : error ? (
        <div className="text-center py-6 text-red-500 text-sm">
          <p>{labels.error}</p>
          <p className="text-xs text-gray-400 mt-1">{error}</p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-3 gap-4 mb-4 pb-4 border-b border-blue-200">
            <div className="text-center">
              <p className="text-lg font-semibold text-gray-800 leading-tight">{conditionText}</p>
              <p className="text-xs text-gray-500">{labels.condition}</p>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center gap-1">
                <p className="text-2xl font-semibold text-gray-800">{language === 'ar' ? toArabicNumerals(humidity) : humidity}%</p>
                <Droplets size={18} className="text-blue-500" />
              </div>
              <p className="text-xs text-gray-500">{labels.humidity}</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-semibold text-gray-800" dir="ltr">{language === 'ar' ? `${toArabicNumerals(Math.round(tempC))}°C` : `${Math.round(tempC)}°C`}</p>
              <p className="text-xs text-gray-500">{labels.temperature}</p>
            </div>
          </div>

          <div className="space-y-2">
            <h4 className={`font-medium text-sm text-gray-700 flex items-center gap-2 ${language === 'ar' ? 'flex-row-reverse justify-end' : 'justify-start'}`}>
              {language === 'ar' && <><AlertTriangle size={16} className="text-orange-500" /><span>{labels.careRecommendations}</span></>}
              {language === 'en' && <><span>{labels.careRecommendations}</span><AlertTriangle size={16} className="text-orange-500" /></>}
            </h4>
            <ul className="space-y-2">
              {advice.map((tip, idx) => (
                <li key={idx} className={`flex items-start gap-2 text-sm text-gray-700 ${language === 'ar' ? 'flex-row-reverse justify-end text-right' : 'justify-start text-left'}`}>
                  {language === 'ar' && <><span>{tip}</span><span className="text-green-500 mt-0.5 shrink-0">•</span></>}
                  {language === 'en' && <><span className="text-green-500 mt-0.5 shrink-0">•</span><span>{tip}</span></>}
                </li>
              ))}
            </ul>
          </div>

          <div className="mt-4 pt-4 border-t border-blue-200">
            <p className="text-xs text-gray-400 text-center">
              {language === 'ar' ? 'مدعوم بـ Open-Meteo' : 'Powered by Open-Meteo'}
            </p>
          </div>
        </>
      )}
    </div>
  );
}
