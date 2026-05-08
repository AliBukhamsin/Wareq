import { useState, useRef, useEffect } from 'react';
import { ArrowLeft, ArrowRight, Heart, MessageCircle, Pin, Image, X, Send, Trash2 } from 'lucide-react';

interface Comment {
  id: string;
  author: string;
  text: string;
  createdAt: string;
}

interface Post {
  id: string;
  author: string;
  text: string;
  imageUrl?: string;
  createdAt: string;
  likes: number;
  liked: boolean;
  pinned: boolean;
  comments: Comment[];
}

interface PostsPageProps {
  language: 'ar' | 'en';
  onBack: () => void;
  username: string;
  onViewAccount: () => void;
}

export default function PostsPage({ language, onBack, username, onViewAccount }: PostsPageProps) {
  const isAr = language === 'ar';
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [posts, setPosts] = useState<Post[]>([
    {
      id: '1',
      author: 'أحمد النباتي',
      text: isAr ? 'نبتتي المونستيرا أنتجت ورقة جديدة اليوم! 🌿 لا يوجد شعور أجمل من رؤية نباتاتك تنمو.' : 'My Monstera grew a new leaf today! 🌿 Nothing better than watching your plants thrive.',
      createdAt: '2h',
      likes: 24,
      liked: false,
      pinned: false,
      comments: [
        { id: 'c1', author: 'سارة', text: 'ما شاء الله! كيف تعتني بها؟', createdAt: '1h' }
      ],
    },
    {
      id: '2',
      author: 'فاطمة الخضراء',
      text: isAr ? 'نصيحة اليوم: الصبار لا يحتاج ري كثير، أسبوعين بين كل ري كافٍ في الصيف 🌵' : "Today's tip: Cacti don't need much water, every two weeks is enough in summer 🌵",
      imageUrl: 'https://plantorbit.com/cdn/shop/files/OpuntiaMicrodasysVar.PallidaBunnyEarCactus_2.webp',
      createdAt: '5h',
      likes: 41,
      liked: false,
      pinned: false,
      comments: [],
    },
  ]);

  const [savedIds, setSavedIds] = useState<Set<string>>(new Set());
  const [newPostText, setNewPostText] = useState('');
  const [newPostImage, setNewPostImage] = useState('');
  const [newPostImagePreview, setNewPostImagePreview] = useState('');
  const [expandedComments, setExpandedComments] = useState<string[]>([]);
  const [commentInputs, setCommentInputs] = useState<Record<string, string>>({});

  const token = localStorage.getItem('token');

  // Load saved post IDs on mount
  useEffect(() => {
    const fetchSavedIds = async () => {
      try {
        const res = await fetch('http://localhost:5000/api/saved/ids', {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (res.ok) {
          const ids: number[] = await res.json();
          setSavedIds(new Set(ids.map(id => id.toString())));
          // Mark posts as pinned if they're saved
          setPosts(prev => prev.map(p => ({ ...p, pinned: ids.map(id => id.toString()).includes(p.id) })));
        }
      } catch (err) {
        console.error('Failed to fetch saved ids:', err);
      }
    };
    fetchSavedIds();
  }, []);

  const labels = isAr ? {
    title: 'المجتمع',
    subtitle: 'شارك تجربتك مع النباتات',
    placeholder: 'ما الجديد في حديقتك؟',
    post: 'نشر',
    comment: 'أضف تعليقاً...',
    pinned: 'محفوظ',
    addPhoto: 'أضف صورة',
  } : {
    title: 'Community',
    subtitle: 'Share your plant experience',
    placeholder: "What's new in your garden?",
    post: 'Post',
    comment: 'Add a comment...',
    pinned: 'Saved',
    addPhoto: 'Add Photo',
  };

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => {
      const result = reader.result as string;
      setNewPostImage(result);
      setNewPostImagePreview(result);
    };
    reader.readAsDataURL(file);
  };

  const handlePost = async () => {
    if (!newPostText.trim() && !newPostImage) return;
    try {
      const res = await fetch('http://localhost:5000/api/posts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ content: newPostText.trim(), image_url: newPostImage || null }),
      });
      const data = await res.json();
      if (!res.ok) return;

      // Use real DB id returned from server
      const post: Post = {
        id: data.id.toString(),
        author: username,
        text: newPostText.trim(),
        imageUrl: newPostImage || undefined,
        createdAt: isAr ? 'الآن' : 'now',
        likes: 0,
        liked: false,
        pinned: false,
        comments: [],
      };
      setPosts([post, ...posts]);
      setNewPostText('');
      setNewPostImage('');
      setNewPostImagePreview('');
    } catch (err) {
      console.error('Failed to create post:', err);
    }
  };

  const handleLike = (id: string) => {
    setPosts(posts.map(p => p.id === id
      ? { ...p, liked: !p.liked, likes: p.liked ? p.likes - 1 : p.likes + 1 }
      : p
    ));
  };

  // Pin = Save to DB
  const handlePin = async (id: string) => {
    const isSaved = savedIds.has(id);
    try {
      if (isSaved) {
        // Unsave
        await fetch(`http://localhost:5000/api/saved/${id}`, {
          method: 'DELETE',
          headers: { Authorization: `Bearer ${token}` }
        });
        setSavedIds(prev => { const s = new Set(prev); s.delete(id); return s; });
        setPosts(prev => prev.map(p => p.id === id ? { ...p, pinned: false } : p));
      } else {
        // Save
        await fetch(`http://localhost:5000/api/saved/${id}`, {
          method: 'POST',
          headers: { Authorization: `Bearer ${token}` }
        });
        setSavedIds(prev => new Set([...prev, id]));
        setPosts(prev => prev.map(p => p.id === id ? { ...p, pinned: true } : p));
      }
    } catch (err) {
      console.error('Failed to save post:', err);
    }
  };

  const handleDelete = (id: string) => {
    setPosts(posts.filter(p => p.id !== id));
  };

  const handleComment = (postId: string) => {
    const text = commentInputs[postId]?.trim();
    if (!text) return;
    const comment: Comment = {
      id: Date.now().toString(),
      author: username,
      text,
      createdAt: isAr ? 'الآن' : 'now',
    };
    setPosts(posts.map(p => p.id === postId
      ? { ...p, comments: [...p.comments, comment] }
      : p
    ));
    setCommentInputs({ ...commentInputs, [postId]: '' });
  };

  const toggleComments = (id: string) => {
    setExpandedComments(prev =>
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
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
            <p className="text-sm text-gray-500">{labels.subtitle}</p>
          </div>
          <button
            onClick={onViewAccount}
            className="w-9 h-9 rounded-full bg-gradient-to-br from-green-600 to-lime-700 text-white flex items-center justify-center font-bold text-sm shadow"
          >
            {username?.[0]?.toUpperCase() || '?'}
          </button>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-4 space-y-4">
        {/* New Post Box */}
        <div className="bg-white rounded-2xl shadow-md p-4 space-y-3">
          <div className="flex gap-3 items-start">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-green-600 to-lime-700 text-white flex items-center justify-center font-bold shrink-0">
              {username?.[0]?.toUpperCase() || '?'}
            </div>
            <textarea
              value={newPostText}
              onChange={(e) => setNewPostText(e.target.value)}
              placeholder={labels.placeholder}
              className={`flex-1 resize-none border-none outline-none text-gray-800 placeholder-gray-400 text-sm min-h-[60px] bg-transparent ${isAr ? 'text-right' : 'text-left'}`}
            />
          </div>

          {newPostImagePreview && (
            <div className="relative rounded-xl overflow-hidden">
              <img src={newPostImagePreview} alt="preview" className="w-full max-h-64 object-cover" />
              <button
                onClick={() => { setNewPostImage(''); setNewPostImagePreview(''); }}
                className="absolute top-2 right-2 bg-black/50 text-white p-1 rounded-full"
              >
                <X size={16} />
              </button>
            </div>
          )}

          <div className="flex items-center justify-between border-t border-gray-100 pt-3">
            <button
              onClick={() => fileInputRef.current?.click()}
              className="flex items-center gap-1.5 text-green-600 hover:text-green-700 text-sm font-medium"
            >
              <Image size={18} />
              <span>{labels.addPhoto}</span>
            </button>
            <input ref={fileInputRef} type="file" accept="image/*" onChange={handleImageSelect} className="hidden" />
            <button
              onClick={handlePost}
              disabled={!newPostText.trim() && !newPostImage}
              className="bg-gradient-to-r from-green-600 to-lime-700 text-white px-5 py-1.5 rounded-full text-sm font-semibold hover:opacity-90 transition disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {labels.post}
            </button>
          </div>
        </div>

        {/* Posts Feed */}
        {posts.map(post => (
          <div key={post.id} className="bg-white rounded-2xl shadow-md overflow-hidden">
            {post.pinned && (
              <div className={`flex items-center gap-1.5 px-4 pt-3 text-xs text-amber-600 font-medium ${isAr ? 'flex-row-reverse' : ''}`}>
                <Pin size={13} />
                <span>{labels.pinned}</span>
              </div>
            )}

            <div className="p-4">
              <div className={`flex items-center gap-3 mb-3 ${isAr ? 'flex-row-reverse' : ''}`}>
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-amber-500 to-orange-600 text-white flex items-center justify-center font-bold shrink-0">
                  {post.author?.[0]?.toUpperCase()}
                </div>
                <div className={`flex-1 ${isAr ? 'text-right' : 'text-left'}`}>
                  <p className="font-semibold text-gray-800 text-sm">{post.author}</p>
                  <p className="text-xs text-gray-400">{post.createdAt}</p>
                </div>
                {post.author === username && (
                  <button onClick={() => handleDelete(post.id)} className="text-gray-300 hover:text-red-500 transition-colors">
                    <Trash2 size={16} />
                  </button>
                )}
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
                <button
                  onClick={() => handleLike(post.id)}
                  className={`flex items-center gap-1.5 text-sm transition-colors ${post.liked ? 'text-red-500' : 'text-gray-400 hover:text-red-400'}`}
                >
                  <Heart size={18} fill={post.liked ? 'currentColor' : 'none'} />
                  <span>{post.likes}</span>
                </button>

                <button
                  onClick={() => toggleComments(post.id)}
                  className="flex items-center gap-1.5 text-sm text-gray-400 hover:text-green-600 transition-colors"
                >
                  <MessageCircle size={18} />
                  <span>{post.comments.length}</span>
                </button>

                {/* Pin button — now saves to DB */}
                <button
                  onClick={() => handlePin(post.id)}
                  className={`flex items-center gap-1.5 text-sm transition-colors ${savedIds.has(post.id) ? 'text-amber-500' : 'text-gray-400 hover:text-amber-400'}`}
                  title={savedIds.has(post.id) ? (isAr ? 'إلغاء الحفظ' : 'Unsave') : (isAr ? 'حفظ المنشور' : 'Save post')}
                >
                  <Pin size={18} fill={savedIds.has(post.id) ? 'currentColor' : 'none'} />
                </button>
              </div>

              {expandedComments.includes(post.id) && (
                <div className="mt-3 space-y-2">
                  {post.comments.map(c => (
                    <div key={c.id} className={`flex gap-2 ${isAr ? 'flex-row-reverse' : ''}`}>
                      <div className="w-7 h-7 rounded-full bg-gradient-to-br from-stone-400 to-stone-600 text-white flex items-center justify-center text-xs font-bold shrink-0">
                        {c.author?.[0]?.toUpperCase()}
                      </div>
                      <div className={`bg-gray-50 rounded-xl px-3 py-2 flex-1 ${isAr ? 'text-right' : 'text-left'}`}>
                        <p className="text-xs font-semibold text-gray-700">{c.author}</p>
                        <p className="text-xs text-gray-600">{c.text}</p>
                      </div>
                    </div>
                  ))}

                  <div className={`flex gap-2 mt-2 ${isAr ? 'flex-row-reverse' : ''}`}>
                    <div className="w-7 h-7 rounded-full bg-gradient-to-br from-green-600 to-lime-700 text-white flex items-center justify-center text-xs font-bold shrink-0">
                      {username?.[0]?.toUpperCase()}
                    </div>
                    <div className="flex-1 flex gap-2">
                      <input
                        type="text"
                        value={commentInputs[post.id] || ''}
                        onChange={(e) => setCommentInputs({ ...commentInputs, [post.id]: e.target.value })}
                        onKeyDown={(e) => e.key === 'Enter' && handleComment(post.id)}
                        placeholder={labels.comment}
                        className={`flex-1 bg-gray-50 rounded-full px-3 py-1.5 text-xs outline-none border border-gray-200 focus:border-green-400 ${isAr ? 'text-right' : 'text-left'}`}
                      />
                      <button
                        onClick={() => handleComment(post.id)}
                        className="bg-green-600 text-white p-1.5 rounded-full hover:bg-green-700 transition-colors"
                      >
                        <Send size={13} />
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
