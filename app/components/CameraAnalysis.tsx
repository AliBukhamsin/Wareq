import { useState, useRef } from 'react';
import { X, Camera, Loader2 } from 'lucide-react';

interface CameraAnalysisProps {
  onClose: () => void;
  language: 'ar' | 'en';
}

// Uses Vercel API proxy — works on both localhost and vercel.app
const API_URL = '/api/openai-proxy';

export default function CameraAnalysis({ onClose, language }: CameraAnalysisProps) {
  const [preview, setPreview] = useState('');
  const [base64Image, setBase64Image] = useState('');
  const [analyzing, setAnalyzing] = useState(false);
  const [diagnosis, setDiagnosis] = useState<any>(null);
  const [error, setError] = useState('');
  const cameraInputRef = useRef<HTMLInputElement>(null);

  const labels = language === 'ar' ? {
    title: 'تحليل صحة النبتة', takePhoto: 'التقط أو اختر صورة',
    analyzing: 'جارٍ تحليل نبتتك...', analyzeHealth: 'تحليل صحة النبتة',
    diagnosisResults: 'نتائج التشخيص', confidence: 'الدقة',
    issuesDetected: 'المشاكل المكتشفة', recommendations: 'التوصيات',
    analyzeAnother: 'تحليل صورة أخرى', cameraPrompt: 'التقط صورة لنبتتك للحصول على تحليل فوري',
    poweredBy: 'مدعوم بـ GPT-4o-mini', noIssues: 'لا مشاكل مكتشفة', errorMsg: 'حدث خطأ أثناء التحليل.',
  } : {
    title: 'Plant Health Analysis', takePhoto: 'Take or Choose Photo',
    analyzing: 'Analyzing your plant...', analyzeHealth: 'Analyze Plant Health',
    diagnosisResults: 'Diagnosis Results', confidence: 'Confidence',
    issuesDetected: 'Issues Detected', recommendations: 'Recommendations',
    analyzeAnother: 'Analyze Another Photo', cameraPrompt: 'Take a photo for instant AI analysis',
    poweredBy: 'Powered by GPT-4o-mini', noIssues: 'No issues detected', errorMsg: 'An error occurred.',
  };

  const PROMPT = language === 'ar'
    ? `أنت خبير نباتات متخصص. مهمتك الأولى: هل تحتوي هذه الصورة على نبتة حقيقية (شجرة، زهرة، عشب، صبار، أو أي نبات)؟ إذا كانت الصورة تحتوي على أي شيء آخر (إنسان، حيوان، سيارة، طعام، مبنى، بطاقة هوية، أو أي شيء ليس نباتاً) أعد JSON فقط: {"notAPlant":true}. فقط إذا كانت الصورة تحتوي على نبتة حقيقية بوضوح، حلّل صحتها وأعد JSON فقط: {"health":"سليمة أو تحتاج عناية أو مشاكل بسيطة","confidence":85,"issues":["مشكلة"],"recommendations":["توصية 1","توصية 2","توصية 3"]}`
    : `You are a specialized plant expert. Your FIRST task: does this image contain a real plant (tree, flower, grass, cactus, or any vegetation)? If the image contains ANYTHING else (person, animal, car, food, building, ID card, or anything that is NOT a plant) return ONLY: {"notAPlant":true}. ONLY if the image clearly contains a real plant, analyze its health and return ONLY: {"health":"Healthy or Needs Attention or Minor Issues","confidence":85,"issues":["issue"],"recommendations":["rec 1","rec 2","rec 3"]}`;

  const handleImageCapture = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => {
      const result = reader.result as string;
      setPreview(result);
      setBase64Image(result.split(',')[1]);
      setDiagnosis(null);
      setError('');
    };
    reader.readAsDataURL(file);
  };

  const analyzePlant = async () => {
    if (!base64Image) return;
    setAnalyzing(true);
    setError('');
    try {
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: 'gpt-4o-mini',
          messages: [{ role: 'user', content: [
            { type: 'image_url', image_url: { url: `data:image/jpeg;base64,${base64Image}`, detail: 'low' } },
            { type: 'text', text: PROMPT }
          ]}],
          max_tokens: 400, temperature: 0.3,
        }),
      });
      if (!response.ok) { const err = await response.json(); throw new Error(err.error?.message || 'API error'); }
      const data = await response.json();
      const raw = data.choices[0].message.content.trim().replace(/```json|```/g, '');
      const match = raw.match(/\{[\s\S]*\}/);
      if (!match) throw new Error('Could not parse response');
      const parsed = JSON.parse(match[0]);
      if (parsed.notAPlant) {
        setError(language === 'ar' ? 'هذه الصورة لا تحتوي على نبتة! الرجاء رفع صورة نبتة حقيقية. 🌿' : 'This image does not contain a plant! Please upload a real plant photo. 🌿');
      } else {
        setDiagnosis(parsed);
      }
    } catch (err: any) { setError(err.message); }
    finally { setAnalyzing(false); }
  };

  const healthColor = (h: string) => ['سليمة','Healthy'].includes(h) ? 'bg-green-100 text-green-800' : ['تحتاج عناية','Needs Attention'].includes(h) ? 'bg-orange-100 text-orange-800' : 'bg-yellow-100 text-yellow-800';

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-2 sm:p-4">
      <div className="bg-white rounded-lg max-w-2xl w-full h-[90vh] sm:h-[620px] flex flex-col" dir={language === 'ar' ? 'rtl' : 'ltr'}>
        <div className="bg-gradient-to-r from-stone-600 to-yellow-900 text-white p-3 sm:p-4 rounded-t-lg flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2">
            <div className="bg-white p-1.5 rounded-full"><Camera className="text-stone-700" size={20} /></div>
            <div className={language === 'ar' ? 'text-right' : 'text-left'}>
              <h2 className="text-base sm:text-lg font-semibold">{labels.title}</h2>
              <p className="text-xs text-stone-200">{labels.poweredBy}</p>
            </div>
          </div>
          <button onClick={onClose} className="hover:bg-white/20 p-1.5 rounded-lg transition-colors"><X size={20} /></button>
        </div>
        <div className="flex-1 overflow-y-auto p-4">
          {!preview ? (
            <div className="border-2 border-dashed border-gray-300 rounded-xl p-12 text-center">
              <div className="bg-stone-50 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4"><Camera className="text-stone-400" size={40} /></div>
              <p className="text-gray-600 mb-6 text-sm">{labels.cameraPrompt}</p>
              <button onClick={() => cameraInputRef.current?.click()} className="inline-flex items-center gap-2 px-6 py-3 bg-stone-500 text-white rounded-xl hover:bg-stone-700 transition-colors font-medium">
                <Camera size={18} /><span>{labels.takePhoto}</span>
              </button>
              <input ref={cameraInputRef} type="file" accept="image/*" capture="environment" onChange={handleImageCapture} className="hidden" />
            </div>
          ) : (
            <div className="space-y-4">
              <div className="relative">
                <img src={preview} alt="Plant" className="w-full rounded-xl max-h-72 object-cover shadow-md" />
                <button onClick={() => cameraInputRef.current?.click()} className="absolute top-2 right-2 bg-white/90 text-gray-700 px-3 py-1.5 rounded-lg text-xs font-medium shadow">
                  {language === 'ar' ? 'تغيير الصورة' : 'Change Photo'}
                </button>
                <input ref={cameraInputRef} type="file" accept="image/*" capture="environment" onChange={handleImageCapture} className="hidden" />
              </div>
              {!diagnosis && !analyzing && !error && (
                <button onClick={analyzePlant} className="w-full bg-stone-500 text-white px-6 py-3 rounded-xl hover:bg-stone-700 transition-colors font-medium">{labels.analyzeHealth}</button>
              )}
              {analyzing && (
                <div className="flex items-center justify-center py-8 gap-3 bg-stone-50 rounded-xl">
                  <Loader2 className="animate-spin text-stone-700" size={28} /><span className="text-gray-600 text-sm">{labels.analyzing}</span>
                </div>
              )}
              {error && (
                <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-center">
                  <p className="text-red-600 text-sm">{labels.errorMsg}</p>
                  <p className="text-red-400 text-xs mt-1">{error}</p>
                  <button onClick={analyzePlant} className="mt-3 px-4 py-2 bg-red-500 text-white rounded-lg text-sm hover:bg-red-600">{language === 'ar' ? 'إعادة المحاولة' : 'Retry'}</button>
                </div>
              )}
              {diagnosis && (
                <div className="bg-gray-50 rounded-xl p-5 space-y-4 border border-gray-100">
                  <div className={`flex items-center ${language === 'ar' ? 'justify-between flex-row-reverse' : 'justify-between'}`}>
                    <h3 className="text-lg font-semibold">{labels.diagnosisResults}</h3>
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${healthColor(diagnosis.health)}`}>{diagnosis.health}</span>
                  </div>
                  <div>
                    <div className={`flex justify-between text-sm text-gray-500 mb-1 ${language === 'ar' ? 'flex-row-reverse' : ''}`}>
                      <span>{labels.confidence}</span><span className="font-semibold">{diagnosis.confidence}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2"><div className="bg-stone-500 h-2 rounded-full" style={{width:`${diagnosis.confidence}%`}} /></div>
                  </div>
                  {diagnosis.issues?.length > 0 && (
                    <div>
                      <h4 className={`font-medium mb-2 ${language === 'ar' ? 'text-right' : 'text-left'}`}>{labels.issuesDetected}</h4>
                      <ul className="space-y-1">{diagnosis.issues.map((i: string, idx: number) => (
                        <li key={idx} className={`flex items-start gap-2 text-sm text-gray-700 ${language === 'ar' ? 'justify-end text-right' : ''}`}>
                          {language === 'ar' && <span>{i}</span>}<span className="text-orange-400">⚠</span>{language === 'en' && <span>{i}</span>}
                        </li>
                      ))}</ul>
                    </div>
                  )}
                  <div>
                    <h4 className={`font-medium mb-2 ${language === 'ar' ? 'text-right' : 'text-left'}`}>{labels.recommendations}</h4>
                    <ul className="space-y-2">{diagnosis.recommendations?.map((r: string, idx: number) => (
                      <li key={idx} className={`flex items-start gap-2 text-sm text-gray-700 ${language === 'ar' ? 'justify-end text-right' : ''}`}>
                        {language === 'ar' && <span>{r}</span>}<span className="text-green-500">✓</span>{language === 'en' && <span>{r}</span>}
                      </li>
                    ))}</ul>
                  </div>
                  <button onClick={() => { setPreview(''); setBase64Image(''); setDiagnosis(null); setError(''); }} className="w-full bg-gray-200 text-gray-700 px-6 py-2.5 rounded-xl hover:bg-gray-300 text-sm font-medium">{labels.analyzeAnother}</button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
