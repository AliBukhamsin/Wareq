import { useState, useRef } from 'react';
import { X, Upload, Loader2, Camera } from 'lucide-react';

interface DiagnosisModalProps { plantName: string; onClose: () => void; }

const API_URL = '/api/openai-proxy';

export default function DiagnosisModal({ plantName, onClose }: DiagnosisModalProps) {
  const [preview, setPreview] = useState('');
  const [base64Image, setBase64Image] = useState('');
  const [analyzing, setAnalyzing] = useState(false);
  const [diagnosis, setDiagnosis] = useState<any>(null);
  const [error, setError] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  const PROMPT = `أنت خبير نباتات متخصص. مهمتك الأولى: هل تحتوي هذه الصورة على نبتة حقيقية؟ إذا كانت الصورة تحتوي على أي شيء آخر غير نبات (إنسان، حيوان، سيارة، طعام، بطاقة هوية، مبنى) أعد JSON فقط: {"notAPlant":true}. فقط إذا كانت الصورة تحتوي بوضوح على نبتة اسمها "${plantName}"، حلّل صحتها وأعد JSON فقط: {"health":"سليمة أو تحتاج عناية أو مشاكل بسيطة","confidence":85,"issues":["مشكلة"],"recommendations":["توصية 1","توصية 2","توصية 3"]}`;

  const handleFileRead = (file: File) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const result = reader.result as string;
      setPreview(result); setBase64Image(result.split(',')[1]); setDiagnosis(null); setError('');
    };
    reader.readAsDataURL(file);
  };

  const analyzePlant = async () => {
    if (!base64Image) return;
    setAnalyzing(true); setError('');
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
        setError('هذه الصورة لا تحتوي على نبتة! الرجاء رفع صورة نبتة حقيقية. 🌿');
      } else {
        setDiagnosis(parsed);
      }
    } catch (err: any) { setError(err.message); }
    finally { setAnalyzing(false); }
  };

  const healthColor = (h: string) => h === 'سليمة' ? 'bg-green-100 text-green-800' : h === 'تحتاج عناية' ? 'bg-orange-100 text-orange-800' : 'bg-yellow-100 text-yellow-800';

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-2xl w-full p-6 max-h-[90vh] overflow-y-auto" dir="rtl">
        <div className="flex justify-between items-center mb-4">
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700"><X size={24} /></button>
          <div className="text-right">
            <h2 className="text-xl font-semibold">تشخيص ذكي — {plantName}</h2>
            <p className="text-xs text-gray-400">مدعوم بـ GPT-4o-mini</p>
          </div>
        </div>
        {!preview ? (
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-12 text-center">
            <Upload className="mx-auto mb-4 text-gray-400" size={48} />
            <p className="text-gray-600 mb-4">ارفع أو التقط صورة لنبتتك</p>
            <div className="flex gap-3 justify-center flex-wrap">
              <label className="inline-flex items-center gap-2 px-6 py-3 bg-blue-500 text-white rounded-md cursor-pointer hover:bg-blue-600">
                <span>اختر صورة</span><Upload size={18} />
                <input ref={fileInputRef} type="file" accept="image/*" onChange={e => e.target.files?.[0] && handleFileRead(e.target.files[0])} className="hidden" />
              </label>
              <label className="inline-flex items-center gap-2 px-6 py-3 bg-green-500 text-white rounded-md cursor-pointer hover:bg-green-600">
                <span>التقط صورة</span><Camera size={18} />
                <input ref={cameraInputRef} type="file" accept="image/*" capture="environment" onChange={e => e.target.files?.[0] && handleFileRead(e.target.files[0])} className="hidden" />
              </label>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <img src={preview} alt="Plant" className="w-full rounded-lg max-h-72 object-cover" />
            {!diagnosis && !analyzing && !error && (
              <button onClick={analyzePlant} className="w-full bg-green-500 text-white px-6 py-3 rounded-md hover:bg-green-600">تحليل صحة النبتة</button>
            )}
            {analyzing && (
              <div className="flex items-center justify-center py-8 gap-3 bg-gray-50 rounded-lg">
                <Loader2 className="animate-spin text-blue-500" size={28} /><span className="text-gray-600">جاري التحليل...</span>
              </div>
            )}
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-center">
                <p className="text-red-600 text-sm">حدث خطأ: {error}</p>
                <button onClick={analyzePlant} className="mt-2 px-4 py-2 bg-red-500 text-white rounded-md text-sm">إعادة المحاولة</button>
              </div>
            )}
            {diagnosis && (
              <div className="bg-gray-50 rounded-lg p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${healthColor(diagnosis.health)}`}>{diagnosis.health}</span>
                  <h3 className="text-lg font-semibold">نتائج التشخيص</h3>
                </div>
                <div>
                  <div className="flex justify-between text-sm text-gray-500 mb-1 flex-row-reverse">
                    <span>الدقة</span><span className="font-semibold">{diagnosis.confidence}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2"><div className="bg-blue-500 h-2 rounded-full" style={{width:`${diagnosis.confidence}%`}} /></div>
                </div>
                {diagnosis.issues?.length > 0 && (
                  <div>
                    <h4 className="font-medium mb-2 text-right">المشاكل المكتشفة</h4>
                    <ul className="space-y-1">{diagnosis.issues.map((i: string, idx: number) => (
                      <li key={idx} className="flex items-start gap-2 justify-end text-sm text-gray-700"><span>{i}</span><span className="text-orange-400">⚠</span></li>
                    ))}</ul>
                  </div>
                )}
                <div>
                  <h4 className="font-medium mb-2 text-right">التوصيات</h4>
                  <ul className="space-y-2">{diagnosis.recommendations?.map((r: string, idx: number) => (
                    <li key={idx} className="flex items-start gap-2 justify-end text-right text-sm text-gray-700"><span>{r}</span><span className="text-green-500">✓</span></li>
                  ))}</ul>
                </div>
                <button onClick={() => { setPreview(''); setBase64Image(''); setDiagnosis(null); setError(''); }} className="w-full bg-gray-200 text-gray-700 px-6 py-2 rounded-md hover:bg-gray-300">تحليل صورة أخرى</button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
