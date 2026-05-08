import { useState, useEffect } from 'react';
import { ArrowRight, ArrowLeft, Leaf, Pin, Heart, MessageCircle, Trash2, User, Mail, Phone, Calendar } from 'lucide-react';

interface Post {
  id: string;
  author: string;
  text: string;
  imageUrl?: string;
  createdAt: string;
  likes: number;
  comments: { id: string; author: string; text: string; createdAt: string }[];
}

interface AccountPageProps {
  language: 'ar' | 'en';
  onBack: () => void;
  username: string;
  email: string;
  onLogout: () => void;
}

export default function AccountPage({ language, onBack, username, email, onLogout }: AccountPageProps) {
  const isAr = language === 'ar';
  const [myPosts, setMyPosts] = useState<Post[]>([]);
  const [savedPosts, setSavedPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'info' | 'posts' | 'pinned'>('info');

  const isPhone = email.endsWith('@wareq.phone');
  const displayContact = isPhone ? email.replace('@wareq.phone', '') : email;
  const token = localStorage.getItem('token');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      // Fetch my posts
      const postsRes = await fetch('http://localhost:5000/api/posts/mine', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (postsRes.ok) {
        const data = await postsRes.json();
        setMyPosts(data.map((p: any) => ({
          id: (p.post_id || p.id)?.toString(),
          author: username,
          text: p.content || '',
          imageUrl: p.image_url || undefined,
          createdAt: new Date(p.created_at).toLocaleDateString(isAr ? 'ar-SA' : 'en-US'),
          likes: 0,
          comments: [],
        })));
      }

      // Fetch saved posts
      const savedRes = await fetch('http://localhost:5000/api/saved', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (savedRes.ok) {
        const data = await savedRes.json();
        setSavedPosts(data.map((p: any) => ({
          id: (p.post_id || p.id)?.toString(),
          author: p.author_name || p.username || '?',
          text: p.content || '',
          imageUrl: p.image_url || undefined,
          createdAt: new Date(p.created_at).toLocaleDateString(isAr ? 'ar-SA' : 'en-US'),
          likes: 0,
          comments: [],
        })));
      }
    } catch (err) {
      console.error('Failed to fetch data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDeletePost = async (id: string) => {
    if (!confirm(isAr ? 'هل تريد حذف هذا المنشور؟' : 'Delete this post?')) return;
    try {
      await fetch(`http://localhost:5000/api/posts/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      setMyPosts(myPosts.filter(p => p.id !== id));
    } catch (err) {
      console.error('Failed to delete post:', err);
    }
  };

  const handleUnsavePost = async (id: string) => {
    try {
      await fetch(`http://localhost:5000/api/saved/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      setSavedPosts(savedPosts.filter(p => p.id !== id));
    } catch (err) {
      console.error('Failed to unsave post:', err);
    }
  };

  const labels = {
    title: isAr ? 'حسابي' : 'My Account',
    info: isAr ? 'المعلومات' : 'Info',
    posts: isAr ? 'منشوراتي' : 'My Posts',
    pinned: isAr ? 'المحفوظة' : 'Saved',
    logout: isAr ? 'تسجيل خروج' : 'Logout',
    noPosts: isAr ? 'لا توجد منشورات بعد' : 'No posts yet',
    noSaved: isAr ? 'لا توجد منشورات محفوظة' : 'No saved posts yet',
    memberSince: isAr ? 'عضو منذ' : 'Member since',
    contact: isAr ? (isPhone ? 'رقم الجوال' : 'البريد الإلكتروني') : (isPhone ? 'Phone' : 'Email'),
    totalPosts: isAr ? 'منشور' : 'Posts',
    savedCount: isAr ? 'محفوظ' : 'Saved',
    unsave: isAr ? 'إلغاء الحفظ' : 'Unsave',
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-stone-100 to-green-100" dir={isAr ? 'rtl' : 'ltr'}>
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-green-100 sticky top-0 z-10">
        <div className="max-w-2xl mx-auto px-4 py-4 flex items-center gap-3">
          <button onClick={onBack} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
            {isAr ? <ArrowRight size={24} className="text-gray-700" /> : <ArrowLeft size={24} className="text-gray-700" />}
          </button>
          <div className="flex-1">
            <h1 className="text-xl font-bold text-gray-800">{labels.title}</h1>
          </div>
          <button onClick={onLogout} className="bg-red-50 text-red-600 px-3 py-1.5 rounded-lg text-sm font-medium hover:bg-red-100 transition-colors">
            {labels.logout}
          </button>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-6 space-y-4">
        {/* Profile Card */}
        <div className="bg-white rounded-2xl shadow-md overflow-hidden">
          <div className="h-24 bg-gradient-to-r from-green-600 to-lime-500" />
          <div className="px-6 pb-6">
            <div className="flex items-end justify-between -mt-10 mb-4">
              <div className="w-20 h-20 rounded-full bg-gradient-to-br from-green-600 to-lime-700 text-white flex items-center justify-center text-3xl font-bold border-4 border-white shadow-lg">
                {username?.[0]?.toUpperCase() || '?'}
              </div>
              <div className={`flex gap-4 text-center ${isAr ? 'flex-row-reverse' : ''}`}>
                <div>
                  <p className="text-xl font-bold text-gray-800">{myPosts.length}</p>
                  <p className="text-xs text-gray-500">{labels.totalPosts}</p>
                </div>
                <div>
                  <p className="text-xl font-bold text-amber-500">{savedPosts.length}</p>
                  <p className="text-xs text-gray-500">{labels.savedCount}</p>
                </div>
              </div>
            </div>
            <h2 className={`text-xl font-bold text-gray-800 ${isAr ? 'text-right' : 'text-left'}`}>{username}</h2>
            <p className={`text-sm text-gray-500 flex items-center gap-1 mt-1 ${isAr ? 'flex-row-reverse justify-end' : ''}`}>
              <Leaf size={14} className="text-green-500" />
              {isAr ? 'عضو في وارق 🌿' : 'Wareq member 🌿'}
            </p>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex bg-white rounded-xl shadow-sm p-1 gap-1">
          {(['info', 'posts', 'pinned'] as const).map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all ${
                activeTab === tab
                  ? 'bg-gradient-to-r from-green-600 to-lime-700 text-white shadow'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              {tab === 'info' ? labels.info : tab === 'posts' ? labels.posts : labels.pinned}
            </button>
          ))}
        </div>

        {/* Info Tab */}
        {activeTab === 'info' && (
          <div className="bg-white rounded-2xl shadow-md p-6 space-y-4">
            <div className={`flex items-center gap-4 ${isAr ? 'flex-row-reverse' : ''}`}>
              <div className="w-10 h-10 rounded-full bg-green-50 flex items-center justify-center shrink-0">
                <User size={20} className="text-green-600" />
              </div>
              <div className={isAr ? 'text-right' : 'text-left'}>
                <p className="text-xs text-gray-400">{isAr ? 'الاسم' : 'Name'}</p>
                <p className="font-semibold text-gray-800">{username}</p>
              </div>
            </div>
            <div className="h-px bg-gray-100" />
            <div className={`flex items-center gap-4 ${isAr ? 'flex-row-reverse' : ''}`}>
              <div className="w-10 h-10 rounded-full bg-green-50 flex items-center justify-center shrink-0">
                {isPhone ? <Phone size={20} className="text-green-600" /> : <Mail size={20} className="text-green-600" />}
              </div>
              <div className={isAr ? 'text-right' : 'text-left'}>
                <p className="text-xs text-gray-400">{labels.contact}</p>
                <p className="font-semibold text-gray-800">{displayContact}</p>
              </div>
            </div>
            <div className="h-px bg-gray-100" />
            <div className={`flex items-center gap-4 ${isAr ? 'flex-row-reverse' : ''}`}>
              <div className="w-10 h-10 rounded-full bg-green-50 flex items-center justify-center shrink-0">
                <Calendar size={20} className="text-green-600" />
              </div>
              <div className={isAr ? 'text-right' : 'text-left'}>
                <p className="text-xs text-gray-400">{labels.memberSince}</p>
                <p className="font-semibold text-gray-800">
                  {new Date().toLocaleDateString(isAr ? 'ar-SA' : 'en-US', { year: 'numeric', month: 'long' })}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* My Posts Tab */}
        {activeTab === 'posts' && (
          <div className="space-y-4">
            {loading ? (
              <div className="bg-white rounded-2xl shadow-md p-8 text-center">
                <div className="w-8 h-8 border-2 border-green-500 border-t-transparent rounded-full animate-spin mx-auto" />
              </div>
            ) : myPosts.length === 0 ? (
              <div className="bg-white rounded-2xl shadow-md p-8 text-center text-gray-400">
                <Leaf size={40} className="mx-auto mb-2 text-gray-200" />
                <p>{labels.noPosts}</p>
              </div>
            ) : (
              myPosts.map(post => (
                <PostCard key={post.id} post={post} isAr={isAr} onAction={() => handleDeletePost(post.id)} actionLabel={isAr ? 'حذف' : 'Delete'} actionColor="text-red-500" showTrash />
              ))
            )}
          </div>
        )}

        {/* Saved Posts Tab */}
        {activeTab === 'pinned' && (
          <div className="space-y-4">
            {loading ? (
              <div className="bg-white rounded-2xl shadow-md p-8 text-center">
                <div className="w-8 h-8 border-2 border-green-500 border-t-transparent rounded-full animate-spin mx-auto" />
              </div>
            ) : savedPosts.length === 0 ? (
              <div className="bg-white rounded-2xl shadow-md p-8 text-center text-gray-400">
                <Pin size={40} className="mx-auto mb-2 text-gray-200" />
                <p>{labels.noSaved}</p>
              </div>
            ) : (
              savedPosts.map(post => (
                <PostCard key={post.id} post={post} isAr={isAr} onAction={() => handleUnsavePost(post.id)} actionLabel={labels.unsave} actionColor="text-amber-500" showPin />
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
}

// ── Post Card ────────────────────────────────────────────────
function PostCard({ post, isAr, onAction, actionLabel, actionColor, showTrash, showPin }: {
  post: Post;
  isAr: boolean;
  onAction: () => void;
  actionLabel: string;
  actionColor: string;
  showTrash?: boolean;
  showPin?: boolean;
}) {
  return (
    <div className="bg-white rounded-2xl shadow-md overflow-hidden">
      <div className="p-4">
        <div className={`flex items-center gap-3 mb-3 ${isAr ? 'flex-row-reverse' : ''}`}>
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-amber-500 to-orange-600 text-white flex items-center justify-center font-bold shrink-0">
            {post.author?.[0]?.toUpperCase()}
          </div>
          <div className={`flex-1 ${isAr ? 'text-right' : 'text-left'}`}>
            <p className="font-semibold text-gray-800 text-sm">{post.author}</p>
            <p className="text-xs text-gray-400">{post.createdAt}</p>
          </div>
          <button onClick={onAction} className={`transition-colors ${actionColor} hover:opacity-70`}>
            {showTrash && <Trash2 size={16} />}
            {showPin && <Pin size={16} fill="currentColor" />}
          </button>
        </div>

        {post.text && (
          <p className={`text-gray-800 text-sm leading-relaxed mb-3 ${isAr ? 'text-right' : 'text-left'}`}>{post.text}</p>
        )}

        {post.imageUrl && (
          <div className="rounded-xl overflow-hidden mb-3">
            <img src={post.imageUrl} alt="post" className="w-full object-cover max-h-80" />
          </div>
        )}

        <div className={`flex items-center gap-4 pt-2 border-t border-gray-100 ${isAr ? 'flex-row-reverse' : ''}`}>
          <div className="flex items-center gap-1.5 text-sm text-gray-400">
            <Heart size={16} />
            <span>{post.likes}</span>
          </div>
          <div className="flex items-center gap-1.5 text-sm text-gray-400">
            <MessageCircle size={16} />
            <span>{post.comments.length}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
