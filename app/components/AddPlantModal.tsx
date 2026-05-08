import { useState, useRef } from 'react';
import { X, ImagePlus } from 'lucide-react';

interface AddPlantModalProps {
  onClose: () => void;
  language?: 'ar' | 'en';
  onAdd: (plant: {
    name: string;
    type: string;
    wateringFrequency: number;
    location: string;
    sandType?: string;
    imageUrl?: string;
  }) => void;
}

export default function AddPlantModal({ onClose, onAdd, language = 'ar' }: AddPlantModalProps) {
  const isAr = language === 'ar';
  const [name, setName] = useState('');
  const [type, setType] = useState('');
  const [wateringFrequency, setWateringFrequency] = useState(7);
  const [location, setLocation] = useState('');
  const [sandType, setSandType] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [imagePreview, setImagePreview] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => {
      const result = reader.result as string;
      setImagePreview(result);
      setImageUrl(result);
    };
    reader.readAsDataURL(file);
  };

  const labels = isAr ? {
    title: 'إضافة نبتة جديدة',
    plantName: 'اسم النبتة',
    plantNamePlaceholder: 'مثال: مونستيرا الخاصة بي',
    plantType: 'نوع النبتة',
    selectType: 'اختر النوع',
    other: 'أخرى',
    wateringFreq: 'تكرار الري (بالأيام)',
    location: 'المكان',
    locationPlaceholder: 'مثال: نافذة غرفة المعيشة',
    sandType: 'نوع التربة',
    selectSand: 'اختر نوع التربة',
    imageUrl: 'الصورة',
    add: 'إضافة النبتة',
    cancel: 'إلغاء',
  } : {
    title: 'Add New Plant',
    plantName: 'Plant Name',
    plantNamePlaceholder: 'e.g. My Monstera',
    plantType: 'Plant Type',
    selectType: 'Select type',
    other: 'Other',
    wateringFreq: 'Watering Frequency (days)',
    location: 'Location',
    locationPlaceholder: 'e.g. Living room window',
    sandType: 'Soil Type',
    selectSand: 'Select soil type',
    imageUrl: 'Image',
    add: 'Add Plant',
    cancel: 'Cancel',
  };

  const commonPlants = isAr ? [
    { name: 'صبار', days: 14 },
    { name: 'نبات الثعبان', days: 14 },
    { name: 'بوتس', days: 7 },
    { name: 'مونستيرا', days: 7 },
    { name: 'زنبقة السلام', days: 5 },
    { name: 'سرخس', days: 3 },
  ] : [
    { name: 'Succulent', days: 14 },
    { name: 'Snake Plant', days: 14 },
    { name: 'Pothos', days: 7 },
    { name: 'Monstera', days: 7 },
    { name: 'Peace Lily', days: 5 },
    { name: 'Fern', days: 3 },
  ];

  const sandTypes = isAr ? [
    'رملية', 'طينية', 'خثية', 'طمية', 'صخرية', 'مختلطة'
  ] : [
    'Sandy', 'Clay', 'Peat', 'Loamy', 'Rocky', 'Mixed'
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name && type && location) {
      onAdd({ name, type, wateringFrequency, location, sandType: sandType || undefined, imageUrl: imageUrl || undefined });
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-md w-full p-6" dir={isAr ? 'rtl' : 'ltr'}>
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">{labels.title}</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className={`block text-sm font-medium mb-1 ${isAr ? 'text-right' : 'text-left'}`}>{labels.plantName}</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className={`w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 ${isAr ? 'text-right' : 'text-left'}`}
              placeholder={labels.plantNamePlaceholder}
              required
            />
          </div>

          <div>
            <label className={`block text-sm font-medium mb-1 ${isAr ? 'text-right' : 'text-left'}`}>{labels.plantType}</label>
            <select
              value={type}
              onChange={(e) => {
                setType(e.target.value);
                const plant = commonPlants.find(p => p.name === e.target.value);
                if (plant) setWateringFrequency(plant.days);
              }}
              className={`w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 ${isAr ? 'text-right' : 'text-left'}`}
              required
            >
              <option value="">{labels.selectType}</option>
              {commonPlants.map(plant => (
                <option key={plant.name} value={plant.name}>{plant.name}</option>
              ))}
              <option value={labels.other}>{labels.other}</option>
            </select>
          </div>

          <div>
            <label className={`block text-sm font-medium mb-1 ${isAr ? 'text-right' : 'text-left'}`}>{labels.sandType}</label>
            <select
              value={sandType}
              onChange={(e) => setSandType(e.target.value)}
              className={`w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 ${isAr ? 'text-right' : 'text-left'}`}
            >
              <option value="">{labels.selectSand}</option>
              {sandTypes.map(s => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>

          <div>
            <label className={`block text-sm font-medium mb-1 ${isAr ? 'text-right' : 'text-left'}`}>{labels.wateringFreq}</label>
            <input
              type="number"
              value={wateringFrequency}
              onChange={(e) => setWateringFrequency(parseInt(e.target.value))}
              min="1"
              max="30"
              className={`w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 ${isAr ? 'text-right' : 'text-left'}`}
              required
            />
          </div>

          <div>
            <label className={`block text-sm font-medium mb-1 ${isAr ? 'text-right' : 'text-left'}`}>{labels.location}</label>
            <input
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className={`w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 ${isAr ? 'text-right' : 'text-left'}`}
              placeholder={labels.locationPlaceholder}
              required
            />
          </div>

          <div>
            <label className={`block text-sm font-medium mb-1 ${isAr ? 'text-right' : 'text-left'}`}>{labels.imageUrl}</label>
            <div
              onClick={() => fileInputRef.current?.click()}
              className="w-full border-2 border-dashed border-gray-300 rounded-md hover:border-green-500 transition-colors cursor-pointer overflow-hidden"
            >
              {imagePreview ? (
                <img src={imagePreview} alt="preview" className="w-full h-40 object-cover" />
              ) : (
                <div className="flex flex-col items-center justify-center py-6 gap-2 text-gray-400">
                  <ImagePlus size={32} />
                  <p className="text-sm">{isAr ? 'اضغط لاختيار صورة من المعرض' : 'Tap to choose a photo from gallery'}</p>
                </div>
              )}
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              className="hidden"
            />
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="submit"
              className="flex-1 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
            >
              {labels.add}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
            >
              {labels.cancel}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
