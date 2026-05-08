import { ArrowRight, ArrowLeft, Plus, Search } from 'lucide-react';
import { useState } from 'react';
import PlantCard from './PlantCard';

interface Plant {
  id: string;
  name: string;
  type: string;
  wateringFrequency: number;
  lastWatered: string;
  location: string;
  imageUrl?: string;
}

interface MyPlantsPageProps {
  plants: Plant[];
  onBack: () => void;
  onWater: (id: string) => void;
  onDelete: (id: string) => void;
  onDiagnose: (id: string) => void;
  onAddPlant: () => void;
  language?: 'ar' | 'en';
}

export default function MyPlantsPage({
  plants, onBack, onWater, onDelete, onDiagnose, onAddPlant, language = 'ar'
}: MyPlantsPageProps) {
  const isAr = language === 'ar';
  const [searchQuery, setSearchQuery] = useState('');

  const labels = isAr ? {
    title: 'نباتاتي',
    plants: 'نبتة',
    search: 'ابحث عن نبتة...',
    noPlants: 'لا توجد نباتات بعد',
    noResults: 'لم يتم العثور على نباتات',
    addFirst: 'أضف نبتتك الأولى',
    totalPlants: 'إجمالي النباتات',
    healthyPlants: 'نباتات سليمة',
    needWatering: 'تحتاج ري',
  } : {
    title: 'My Plants',
    plants: 'plants',
    search: 'Search for a plant...',
    noPlants: 'No plants yet',
    noResults: 'No plants found',
    addFirst: 'Add your first plant',
    totalPlants: 'Total Plants',
    healthyPlants: 'Healthy Plants',
    needWatering: 'Need Watering',
  };

  const filteredPlants = plants.filter(plant =>
    plant.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    plant.type.toLowerCase().includes(searchQuery.toLowerCase()) ||
    plant.location.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-stone-100 to-green-100" dir={isAr ? 'rtl' : 'ltr'}>
      <div className="bg-white shadow-sm border-b border-green-100 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-2 sm:px-4 py-4">
          <div className="flex items-center gap-3">
            <button onClick={onBack} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
              {isAr ? <ArrowRight size={24} className="text-gray-700" /> : <ArrowLeft size={24} className="text-gray-700" />}
            </button>
            <div className="flex-1">
              <h1 className="text-xl sm:text-2xl font-bold text-gray-800">{labels.title}</h1>
              <p className="text-sm text-gray-500">{plants.length} {labels.plants}</p>
            </div>
            <button onClick={onAddPlant} className="bg-green-600 text-white p-2 sm:p-3 rounded-lg hover:bg-green-700 transition-colors shadow-md">
              <Plus size={20} />
            </button>
          </div>
          <div className="mt-4 relative">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={labels.search}
              className={`w-full px-4 py-3 ${isAr ? 'pr-12 text-right' : 'pl-12 text-left'} border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500`}
            />
            <Search className={`absolute ${isAr ? 'right-4' : 'left-4'} top-1/2 -translate-y-1/2 text-gray-400`} size={20} />
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-2 sm:px-4 py-4 sm:py-6">
        {filteredPlants.length === 0 ? (
          <div className="bg-white rounded-lg p-8 text-center shadow-md">
            <p className="text-gray-500 mb-4">{searchQuery ? labels.noResults : labels.noPlants}</p>
            {!searchQuery && (
              <button onClick={onAddPlant} className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-colors inline-flex items-center gap-2">
                <span>{labels.addFirst}</span>
                <Plus size={20} />
              </button>
            )}
          </div>
        ) : (
          <>
            <div className="grid grid-cols-3 gap-3 mb-6">
              <div className="bg-white rounded-lg p-4 shadow-md text-center">
                <p className="text-2xl font-bold text-green-600">{plants.length}</p>
                <p className="text-xs text-gray-600">{labels.totalPlants}</p>
              </div>
              <div className="bg-white rounded-lg p-4 shadow-md text-center">
                <p className="text-2xl font-bold text-amber-500">
                  {plants.filter(p => { const n = new Date(p.lastWatered); n.setDate(n.getDate() + p.wateringFrequency); return n > new Date(); }).length}
                </p>
                <p className="text-xs text-gray-600">{labels.healthyPlants}</p>
              </div>
              <div className="bg-white rounded-lg p-4 shadow-md text-center">
                <p className="text-2xl font-bold text-red-600">
                  {plants.filter(p => { const n = new Date(p.lastWatered); n.setDate(n.getDate() + p.wateringFrequency); return n <= new Date(); }).length}
                </p>
                <p className="text-xs text-gray-600">{labels.needWatering}</p>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              {filteredPlants.map(plant => (
                <PlantCard key={plant.id} plant={plant} onWater={onWater} onDelete={onDelete} onDiagnose={onDiagnose} language={language} />
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
