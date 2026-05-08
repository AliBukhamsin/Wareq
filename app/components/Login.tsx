import { useState } from 'react';
import { ArrowLeft, Leaf } from 'lucide-react';
import { toast } from 'sonner';

interface LoginProps {
  onLogin: (token: string, user: { id: number; name: string; email: string }) => void;
  language: string;
  onLanguageChange: (lang: string) => void;
}

export default function Login({ onLogin, language, onLanguageChange }: LoginProps) {
  const [isRegister, setIsRegister] = useState(false);
  const [name, setName] = useState('');
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({ name: '', identifier: '', password: '' });

  const isPhone = (value: string) => /^05\d{8}$/.test(value);
  const isEmail = (value: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);

  // Convert phone to a fake email so the backend can store it uniformly
  const toEmail = (value: string) =>
    isPhone(value) ? `${value}@wareq.phone` : value;

  const validateIdentifier = (value: string) => isEmail(value) || isPhone(value);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const newErrors = { name: '', identifier: '', password: '' };
    let hasError = false;

    if (isRegister && !name) {
      newErrors.name = language === 'ar' ? 'الرجاء إدخال الاسم' : 'Please enter your name';
      hasError = true;
    }
    if (!identifier) {
      newErrors.identifier = language === 'ar'
        ? 'الرجاء إدخال البريد الإلكتروني أو رقم الجوال'
        : 'Please enter your email or phone';
      hasError = true;
    } else if (!validateIdentifier(identifier)) {
      newErrors.identifier = language === 'ar'
        ? 'أدخل بريد إلكتروني صحيح أو رقم جوال (05xxxxxxxx)'
        : 'Enter a valid email or phone number (05xxxxxxxx)';
      hasError = true;
    }
    if (!password || password.length < 6) {
      newErrors.password = language === 'ar'
        ? 'كلمة المرور يجب أن تكون 6 أحرف على الأقل'
        : 'Password must be at least 6 characters';
      hasError = true;
    }

    setErrors(newErrors);
    if (hasError) return;

    setLoading(true);
    try {
      const endpoint = isRegister ? '/api/auth/register' : '/api/auth/login';
      const email = toEmail(identifier);
      const body = isRegister
        ? { name, email, password }
        : { email, password };

      const res = await fetch(`http://localhost:5000${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      const data = await res.json();

      if (!res.ok) {
        toast.error(data.error || (language === 'ar' ? 'حدث خطأ، حاول مرة أخرى' : 'Something went wrong'));
        return;
      }

      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));

      toast.success(isRegister
        ? (language === 'ar' ? 'تم إنشاء الحساب بنجاح! 🌿' : 'Account created! 🌿')
        : (language === 'ar' ? 'تم تسجيل الدخول بنجاح! 🌿' : 'Logged in! 🌿')
      );
      onLogin(data.token, data.user);

    } catch (err) {
      toast.error(language === 'ar'
        ? 'تعذر الاتصال بالخادم، تأكد أن السيرفر يعمل'
        : 'Cannot connect to server'
      );
    } finally {
      setLoading(false);
    }
  };

  const toggleLanguage = () => {
    onLanguageChange(language === 'ar' ? 'en' : 'ar');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-50 flex items-center justify-center px-4" dir={language === 'ar' ? 'rtl' : 'ltr'}>
      <button
        onClick={toggleLanguage}
        className="fixed top-1 right-4 z-50 bg-gradient-to-r from-green-400 to-emerald-500 text-white px-3 py-1.5 rounded-lg hover:from-green-500 hover:to-emerald-600 transition-all shadow-lg font-medium text-sm"
      >
        EN/ع
      </button>

      <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="bg-green-500 p-4 rounded-full inline-block mb-4">
            <Leaf className="text-white" size={48} />
          </div>
          <h1 className="text-3xl font-bold text-gray-800 mb-2">وارق</h1>
          <p className="text-gray-500">{language === 'ar' ? 'تطبيق العناية بالنباتات' : 'Plant Care App'}</p>
        </div>

        {/* Tab Toggle */}
        <div className="flex mb-6 bg-gray-100 rounded-lg p-1">
          <button
            type="button"
            onClick={() => setIsRegister(false)}
            className={`flex-1 py-2 rounded-md text-sm font-medium transition-all ${
              !isRegister ? 'bg-white shadow text-green-600' : 'text-gray-500'
            }`}
          >
            {language === 'ar' ? 'تسجيل دخول' : 'Login'}
          </button>
          <button
            type="button"
            onClick={() => setIsRegister(true)}
            className={`flex-1 py-2 rounded-md text-sm font-medium transition-all ${
              isRegister ? 'bg-white shadow text-green-600' : 'text-gray-500'
            }`}
          >
            {language === 'ar' ? 'حساب جديد' : 'Register'}
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Name (register only) */}
          {isRegister && (
            <div>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder={language === 'ar' ? 'الاسم الكامل' : 'Full name'}
                className={`w-full px-4 py-3 border ${errors.name ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-right`}
              />
              {errors.name && <p className="text-red-500 text-sm mt-1 text-right">{errors.name}</p>}
            </div>
          )}

          {/* Email or Phone */}
          <div>
            <input
              type="text"
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value)}
              placeholder={language === 'ar' ? 'البريد الإلكتروني أو رقم الجوال' : 'Email or phone number'}
              className={`w-full px-4 py-3 border ${errors.identifier ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-right`}
            />
            {errors.identifier && <p className="text-red-500 text-sm mt-1 text-right">{errors.identifier}</p>}
            {/* Live hint */}
            {identifier && (
              <p className={`text-xs mt-1 text-right ${
                validateIdentifier(identifier) ? 'text-green-500' : 'text-gray-400'
              }`}>
                {isPhone(identifier)
                  ? '📱 ' + (language === 'ar' ? 'رقم جوال' : 'Phone number')
                  : isEmail(identifier)
                  ? '📧 ' + (language === 'ar' ? 'بريد إلكتروني' : 'Email')
                  : language === 'ar' ? 'أدخل بريد إلكتروني أو رقم يبدأ بـ 05' : 'Enter email or number starting with 05'
                }
              </p>
            )}
          </div>

          {/* Password */}
          <div>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder={language === 'ar' ? 'كلمة المرور' : 'Password'}
              className={`w-full px-4 py-3 border ${errors.password ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-right`}
            />
            {errors.password && <p className="text-red-500 text-sm mt-1 text-right">{errors.password}</p>}
          </div>

          {/* Submit */}
          <div className="flex justify-end">
            <button
              type="submit"
              disabled={loading}
              className="bg-green-500 text-white p-4 rounded-full hover:bg-green-600 transition-colors shadow-lg hover:shadow-xl disabled:opacity-50"
              aria-label="تسجيل الدخول"
            >
              {loading ? (
                <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <ArrowLeft size={24} />
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
