import { useState, useEffect, useRef } from 'react';
import { Plus, Leaf, Bell, Sparkles, Camera } from 'lucide-react';
import { toast, Toaster } from 'sonner';
import PlantCard from './components/PlantCard';
import AddPlantModal from './components/AddPlantModal';
import DiagnosisModal from './components/DiagnosisModal';
import WeatherAdvice from './components/WeatherAdvice';
import Login from './components/Login';
import AIAssistant from './components/AIAssistant';
import MyPlantsPage from './components/MyPlantsPage';
import SubscribePage from './components/SubscribePage';
import CameraAnalysis from './components/CameraAnalysis';
import PostsPage from './components/PostsPage';
import AccountPage from './components/AccountPage';
import { translations, Language } from './translations';

interface Plant {
  id: string;
  name: string;
  type: string;
  wateringFrequency: number;
  lastWatered: string;
  location: string;
  imageUrl?: string;
}

interface User {
  id: number;
  name: string;
  email: string;
}

export default function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [language, setLanguage] = useState<Language>('ar');
  const t = translations[language];
  const [currentPage, setCurrentPage] = useState<'home' | 'myplants' | 'subscribe' | 'posts' | 'account'>('home');
  const [plants, setPlants] = useState<Plant[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [diagnosePlant, setDiagnosePlant] = useState<Plant | null>(null);
  const [userLocation, setUserLocation] = useState<{ar: string, en: string}>({
    ar: 'الرياض، السعودية',
    en: 'Riyadh, Saudi Arabia'
  });

  const displayLocation = userLocation[language];
  const [showMenu, setShowMenu] = useState(false);
  const [showAIAssistant, setShowAIAssistant] = useState(false);
  const [showCameraAnalysis, setShowCameraAnalysis] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Check if user is already logged in
  useEffect(() => {
    const savedLang = localStorage.getItem('language');
    if (savedLang) setLanguage(savedLang as Language);

    const token = localStorage.getItem('token');
    const user = localStorage.getItem('user');
    if (token && user) {
      setIsLoggedIn(true);
      setCurrentUser(JSON.parse(user));
    }
  }, []);

  // Load plants from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('plantCareApp');
    if (saved) {
      setPlants(JSON.parse(saved));
    } else {
      const samplePlants: Plant[] = [
        {
          id: '1',
          name: 'مونستيرا الجميلة',
          type: 'مونستيرا',
          wateringFrequency: 7,
          lastWatered: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
          location: 'غرفة المعيشة',
          imageUrl: 'https://images.unsplash.com/photo-1614594975525-e45190c55d0b?w=400'
        },
        {
          id: '2',
          name: 'نبات الثعبان',
          type: 'نبات الثعبان',
          wateringFrequency: 14,
          lastWatered: new Date(Date.now() - 16 * 24 * 60 * 60 * 1000).toISOString(),
          location: 'غرفة النوم',
          imageUrl: 'https://images.unsplash.com/photo-1593482892290-f54927ae1bb6?w=400'
        }
      ];
      setPlants(samplePlants);
      localStorage.setItem('plantCareApp', JSON.stringify(samplePlants));
    }
  }, []);

  // Save plants to localStorage
  useEffect(() => {
    if (plants.length > 0) {
      localStorage.setItem('plantCareApp', JSON.stringify(plants));
    }
  }, [plants]);

  // Check for watering reminders
  useEffect(() => {
    const checkReminders = () => {
      plants.forEach(plant => {
        const nextWateringDate = new Date(plant.lastWatered);
        nextWateringDate.setDate(nextWateringDate.getDate() + plant.wateringFrequency);
        if (nextWateringDate <= new Date()) {
          toast.warning(`حان وقت ري ${plant.name}!`, {
            description: `آخر ري منذ ${Math.floor((Date.now() - new Date(plant.lastWatered).getTime()) / (1000 * 60 * 60 * 24))} يوم`,
            action: {
              label: 'الري الآن',
              onClick: () => handleWater(plant.id)
            }
          });
        }
      });
    };
    checkReminders();
    const interval = setInterval(checkReminders, 60 * 60 * 1000);
    return () => clearInterval(interval);
  }, [plants]);

  const handleAddPlant = (newPlant: Omit<Plant, 'id' | 'lastWatered'>) => {
    const plant: Plant = {
      ...newPlant,
      id: Date.now().toString(),
      lastWatered: new Date().toISOString()
    };
    setPlants([...plants, plant]);
    toast.success(`تمت إضافة ${plant.name} بنجاح!`);
  };

  const handleWater = (id: string) => {
    setPlants(plants.map(plant =>
      plant.id === id ? { ...plant, lastWatered: new Date().toISOString() } : plant
    ));
    const plant = plants.find(p => p.id === id);
    toast.success(`تم ري ${plant?.name}! الري القادم بعد ${plant?.wateringFrequency} يوم.`);
  };

  const handleDelete = (id: string) => {
    const plant = plants.find(p => p.id === id);
    setPlants(plants.filter(p => p.id !== id));
    toast.success(`تم إزالة ${plant?.name} من مجموعتك`);
  };

  const handleDiagnose = (id: string) => {
    const plant = plants.find(p => p.id === id);
    if (plant) setDiagnosePlant(plant);
  };

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowMenu(false);
      }
    };
    if (showMenu) document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showMenu]);

  const handleClearData = () => {
    if (confirm('هل أنت متأكد من حذف جميع البيانات؟')) {
      localStorage.removeItem('plantCareApp');
      setPlants([]);
      setShowMenu(false);
      toast.success('تم مسح جميع البيانات');
    }
  };

  const handleLogin = (token: string, user: User) => {
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(user));
    setCurrentUser(user);
    setIsLoggedIn(true);
  };

  const handleLogout = () => {
    if (confirm('هل أنت متأكد من تسجيل الخروج؟')) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      setCurrentUser(null);
      setIsLoggedIn(false);
      setShowMenu(false);
      toast.success('تم تسجيل الخروج');
    }
  };

  const handleLanguageChange = (lang: Language) => {
    setLanguage(lang);
    localStorage.setItem('language', lang);
  };

  const toggleLanguage = () => {
    const newLang: Language = language === 'ar' ? 'en' : 'ar';
    handleLanguageChange(newLang);
  };

  // ── Pages ────────────────────────────────────────────────────

  if (!isLoggedIn) {
    return (
      <>
        <Toaster position="top-left" />
        <Login onLogin={handleLogin} language={language} onLanguageChange={handleLanguageChange} />
      </>
    );
  }

  if (currentPage === 'account') {
    return (
      <>
        <Toaster position="top-left" />
        <AccountPage
          language={language}
          onBack={() => setCurrentPage('home')}
          username={currentUser?.name || ''}
          email={currentUser?.email || ''}
          onLogout={handleLogout}
        />
      </>
    );
  }

  if (currentPage === 'posts') {
    return (
      <>
        <Toaster position="top-left" />
        <PostsPage
          language={language}
          onBack={() => setCurrentPage('home')}
          username={currentUser?.name || (language === 'ar' ? 'مستخدم' : 'User')}
          onViewAccount={() => setCurrentPage('account')}
        />
      </>
    );
  }

  if (currentPage === 'subscribe') {
    return (
      <>
        <Toaster position="top-left" />
        <SubscribePage
          language={language}
          onBack={() => setCurrentPage('home')}
          onSelect={(plan) => {
            toast.success(
              language === 'ar' ? `تم اختيار باقة ${plan}` : `${plan} plan selected`
            );
          }}
        />
      </>
    );
  }

  if (currentPage === 'myplants') {
    return (
      <>
        <Toaster position="top-left" />
        <MyPlantsPage
          plants={plants}
          onBack={() => setCurrentPage('home')}
          onWater={handleWater}
          onDelete={handleDelete}
          onDiagnose={handleDiagnose}
          onAddPlant={() => setShowAddModal(true)}
          language={language}
        />
        {showAddModal && (
          <AddPlantModal
            onClose={() => setShowAddModal(false)}
            onAdd={handleAddPlant}
            language={language}
          />
        )}
        {diagnosePlant && (
          <DiagnosisModal
            plantName={diagnosePlant.name}
            onClose={() => setDiagnosePlant(null)}
          />
        )}
        {showAIAssistant && (
          <AIAssistant onClose={() => setShowAIAssistant(false)} language={language} />
        )}
      </>
    );
  }

  // ── Home Page ────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-gradient-to-br from-stone-100 to-green-100" dir={language === 'ar' ? 'rtl' : 'ltr'}>
      <Toaster position="top-left" />

      {/* Header */}
      <div className="bg-white shadow-sm border-b border-green-100">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="bg-green-500 p-2 rounded-full">
              <Leaf className="text-white" size={24} />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-800">{t.appName}</h1>
              <p className="text-xs text-gray-500">{t.appSubtitle}</p>
            </div>
          </div>
          <div className="flex items-center gap-2" dir="ltr">
            {/* Account button — shows user initial */}
            {currentUser && (
              <button
                onClick={() => setCurrentPage('account')}
                className="w-9 h-9 rounded-full bg-gradient-to-br from-green-600 to-lime-700 text-white flex items-center justify-center font-bold text-sm shadow hover:opacity-90 transition"
                title={currentUser.name}
              >
                {currentUser.name?.[0]?.toUpperCase()}
              </button>
            )}
            <button onClick={handleLogout} className="bg-gradient-to-r from-red-700 to-orange-800 text-white px-3 py-1.5 rounded-lg hover:from-red-800 hover:to-orange-900 transition-all shadow font-medium text-sm">
              {language === 'ar' ? 'تسجيل خروج' : 'Logout'}
            </button>
            <button onClick={() => setCurrentPage('posts')} className="bg-gradient-to-br from-amber-500 to-orange-600 text-white px-3 py-1.5 rounded-lg hover:from-amber-600 hover:to-orange-700 transition-all shadow font-medium text-sm">
              {language === 'ar' ? 'المجتمع' : 'Community'}
            </button>
            <button onClick={() => setCurrentPage('subscribe')} className="bg-gradient-to-br from-green-700 to-green-900 text-white px-3 py-1.5 rounded-lg hover:from-green-800 hover:to-green-950 transition-all shadow font-medium text-sm">
              {language === 'ar' ? 'ادعمنا' : 'Subscribe'}
            </button>
            <button onClick={toggleLanguage} className="bg-gradient-to-r from-amber-500 to-yellow-600 text-white px-3 py-1.5 rounded-lg hover:from-amber-600 hover:to-yellow-700 transition-all shadow font-medium text-sm">
              EN/ع
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-2 sm:px-4 py-4 sm:py-8" dir={language === 'ar' ? 'rtl' : 'ltr'}>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
          {/* Left Column - Weather & Stats */}
          <div className="space-y-4 sm:space-y-6">
            <WeatherAdvice location={displayLocation} language={language} />

            <div className="bg-white rounded-lg p-6 shadow-md">
              <h3 className={`font-semibold mb-4 flex items-center gap-2 ${language === 'ar' ? 'flex-row-reverse justify-end' : 'justify-start'}`}>
                <Bell className="text-orange-500" size={20} />
                <span>{t.quickStats}</span>
              </h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">{t.totalPlants}</span>
                  <span className="font-semibold text-lg">{plants.length}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">{t.needWatering}</span>
                  <span className="font-semibold text-lg text-red-600">
                    {plants.filter(p => {
                      const next = new Date(p.lastWatered);
                      next.setDate(next.getDate() + p.wateringFrequency);
                      return next <= new Date();
                    }).length}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">{t.location}</span>
                  <input
                    type="text"
                    value={displayLocation}
                    onChange={(e) => setUserLocation({...userLocation, [language]: e.target.value})}
                    className={`text-sm border-b border-gray-300 focus:outline-none focus:border-green-500 max-w-[150px] ${language === 'ar' ? 'text-right' : 'text-left'}`}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Action Cards */}
          <div className="lg:col-span-2">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4 mb-4">
              {/* Ask AI Card */}
              <button
                onClick={() => setShowAIAssistant(true)}
                className="bg-gradient-to-br from-green-600 to-lime-700 text-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-all transform hover:scale-105 flex flex-col items-center justify-center gap-3"
              >
                <div className="bg-white/20 p-4 rounded-full">
                  <Sparkles className="text-white" size={32} />
                </div>
                <h3 className="text-xl font-bold">{t.askAITitle}</h3>
                <p className="text-lime-100 text-center text-xs">{t.askAIDesc}</p>
              </button>

              {/* Add Plants Card */}
              <button
                onClick={() => setShowAddModal(true)}
                className="bg-gradient-to-br from-amber-500 to-orange-700 text-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-all transform hover:scale-105 flex flex-col items-center justify-center gap-3"
              >
                <div className="bg-white/20 p-4 rounded-full">
                  <Plus className="text-white" size={32} />
                </div>
                <h3 className="text-xl font-bold">{t.addPlantTitle}</h3>
                <p className="text-amber-50 text-center text-xs">{t.addPlantDesc}</p>
              </button>
            </div>

            {/* Analyse Plants Card */}
            <button
              onClick={() => setShowCameraAnalysis(true)}
              className="w-full bg-gradient-to-br from-stone-600 to-yellow-900 text-white rounded-xl p-8 shadow-lg hover:shadow-xl transition-all transform hover:scale-105 flex flex-col items-center justify-center gap-4"
            >
              <div className="bg-white/20 p-6 rounded-full">
                <Camera className="text-white" size={48} />
              </div>
              <h3 className="text-2xl font-bold">{t.analysePlantsTitle}</h3>
              <p className="text-stone-200 text-center text-sm">{t.analysePlantsDesc}</p>
            </button>

            {/* Quick Stats */}
            {plants.length > 0 && (
              <div className="mt-6 bg-white rounded-xl p-6 shadow-md">
                <h3 className={`font-semibold text-gray-800 mb-4 ${language === 'ar' ? 'text-right' : 'text-left'}`}>{t.quickView}</h3>
                <div className="grid grid-cols-3 gap-4">
                  <div className="text-center">
                    <p className="text-3xl font-bold text-green-600">{plants.length}</p>
                    <p className="text-xs text-gray-600 mt-1">{t.totalPlants}</p>
                  </div>
                  <div className="text-center">
                    <p className="text-3xl font-bold text-amber-500">
                      {plants.filter(p => {
                        const next = new Date(p.lastWatered);
                        next.setDate(next.getDate() + p.wateringFrequency);
                        return next > new Date();
                      }).length}
                    </p>
                    <p className="text-xs text-gray-600 mt-1">{t.healthyPlants}</p>
                  </div>
                  <div className="text-center">
                    <p className="text-3xl font-bold text-red-600">
                      {plants.filter(p => {
                        const next = new Date(p.lastWatered);
                        next.setDate(next.getDate() + p.wateringFrequency);
                        return next <= new Date();
                      }).length}
                    </p>
                    <p className="text-xs text-gray-600 mt-1">{t.needWatering}</p>
                  </div>
                </div>
                <button
                  onClick={() => setCurrentPage('myplants')}
                  className="w-full mt-4 bg-green-500 text-white py-3 rounded-lg hover:bg-green-600 transition-colors flex items-center justify-center gap-2"
                >
                  <span>{t.viewAllPlants}</span>
                  <Leaf size={18} />
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Modals */}
      {showAddModal && (
        <AddPlantModal
          onClose={() => setShowAddModal(false)}
          onAdd={handleAddPlant}
          language={language}
        />
      )}

      {diagnosePlant && (
        <DiagnosisModal
          plantName={diagnosePlant.name}
          onClose={() => setDiagnosePlant(null)}
        />
      )}

      {showAIAssistant && (
        <AIAssistant onClose={() => setShowAIAssistant(false)} language={language} />
      )}

      {showCameraAnalysis && (
        <CameraAnalysis onClose={() => setShowCameraAnalysis(false)} language={language} />
      )}
    </div>
  );
}
