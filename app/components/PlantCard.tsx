import { Droplet, Calendar, MapPin, Stethoscope, Trash2 } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { ar } from 'date-fns/locale';

interface Plant {
  id: string;
  name: string;
  type: string;
  wateringFrequency: number;
  lastWatered: string;
  location: string;
  imageUrl?: string;
}

interface PlantCardProps {
  plant: Plant;
  onWater: (id: string) => void;
  onDelete: (id: string) => void;
  onDiagnose: (id: string) => void;
  language?: 'ar' | 'en';
}

export default function PlantCard({ plant, onWater, onDelete, onDiagnose, language = 'ar' }: PlantCardProps) {
  const isAr = language === 'ar';
  const nextWateringDate = new Date(plant.lastWatered);
  nextWateringDate.setDate(nextWateringDate.getDate() + plant.wateringFrequency);

  const isOverdue = nextWateringDate < new Date();
  const daysUntilWatering = Math.ceil((nextWateringDate.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));

  const labels = isAr ? {
    every: `كل ${plant.wateringFrequency} أيام`,
    overdue: `متأخر ${Math.abs(daysUntilWatering)} يوم!`,
    daysLeft: `الري بعد ${daysUntilWatering} يوم`,
    lastWatered: 'آخر ري منذ',
    diagnose: 'تشخيص',
    water: 'الري الآن',
  } : {
    every: `Every ${plant.wateringFrequency} days`,
    overdue: `Overdue by ${Math.abs(daysUntilWatering)} day(s)!`,
    daysLeft: `Water in ${daysUntilWatering} day(s)`,
    lastWatered: 'Last watered',
    diagnose: 'Diagnose',
    water: 'Water Now',
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow" dir={isAr ? 'rtl' : 'ltr'}>
      {plant.imageUrl && (
        <img src={plant.imageUrl} alt={plant.name} className="w-full h-48 object-cover rounded-md mb-4" />
      )}

      <div className={`flex justify-between items-start mb-3`}>
        <button onClick={() => onDelete(plant.id)} className="text-red-500 hover:text-red-700 p-2">
          <Trash2 size={18} />
        </button>
        <div className={isAr ? 'text-right' : 'text-left'}>
          <h3 className="font-semibold text-xl">{plant.name}</h3>
          <p className="text-gray-500 text-sm">{plant.type}</p>
        </div>
      </div>

      <div className="space-y-2 mb-4">
        <div className={`flex items-center gap-2 text-sm text-gray-600 ${isAr ? 'justify-end' : 'justify-start'}`}>
          {isAr && <span>{plant.location}</span>}
          <MapPin size={16} />
          {!isAr && <span>{plant.location}</span>}
        </div>

        <div className={`flex items-center gap-2 text-sm text-gray-600 ${isAr ? 'justify-end' : 'justify-start'}`}>
          {isAr && <span>{labels.every}</span>}
          <Droplet size={16} />
          {!isAr && <span>{labels.every}</span>}
        </div>

        <div className={`flex items-center gap-2 text-sm ${isAr ? 'justify-end' : 'justify-start'}`}>
          {isAr && <span className={isOverdue ? 'text-red-600 font-medium' : 'text-gray-600'}>{isOverdue ? labels.overdue : labels.daysLeft}</span>}
          <Calendar size={16} />
          {!isAr && <span className={isOverdue ? 'text-red-600 font-medium' : 'text-gray-600'}>{isOverdue ? labels.overdue : labels.daysLeft}</span>}
        </div>

        <p className={`text-xs text-gray-400 ${isAr ? 'text-right' : 'text-left'}`}>
          {labels.lastWatered} {formatDistanceToNow(new Date(plant.lastWatered), { addSuffix: true, locale: isAr ? ar : undefined })}
        </p>
      </div>

      <div className="flex gap-2">
        <button
          onClick={() => onDiagnose(plant.id)}
          className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition-colors flex items-center justify-center gap-2"
        >
          <span>{labels.diagnose}</span>
          <Stethoscope size={16} />
        </button>
        <button
          onClick={() => onWater(plant.id)}
          className="flex-1 bg-amber-500 text-white px-4 py-2 rounded-md hover:bg-amber-600 transition-colors flex items-center justify-center gap-2"
        >
          <span>{labels.water}</span>
          <Droplet size={16} />
        </button>
      </div>
    </div>
  );
}
