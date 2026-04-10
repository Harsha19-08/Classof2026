import { useState, useEffect, useRef, useMemo } from 'react';
import { getGalleryPhotos, uploadGalleryPhoto, deleteGalleryPhoto } from '../utils/auth';

export default function MediaVaultPage({ user }) {
  const [photos, setPhotos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('All Memories');
  const [sortNewest, setSortNewest] = useState(true);
  const [showUpload, setShowUpload] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadCaption, setUploadCaption] = useState('');
  const [uploadCategory, setUploadCategory] = useState('');
  const [newCategory, setNewCategory] = useState('');
  const [toast, setToast] = useState('');
  const fileInputRef = useRef(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);

  const isAdmin = user?.role === 'admin';

  useEffect(() => { loadPhotos(); }, []);

  const loadPhotos = async () => {
    setLoading(true);
    const data = await getGalleryPhotos();
    setPhotos(data);
    setLoading(false);
  };

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(''), 3000);
  };

  const compressImage = (file) => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = (event) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const MAX_WIDTH = 1000;
          const MAX_HEIGHT = 1000;
          let width = img.width;
          let height = img.height;

          if (width > height) {
            if (width > MAX_WIDTH) {
              height = Math.round(height * (MAX_WIDTH / width));
              width = MAX_WIDTH;
            }
          } else {
            if (height > MAX_HEIGHT) {
              width = Math.round(width * (MAX_HEIGHT / height));
              height = MAX_HEIGHT;
            }
          }

          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          ctx.drawImage(img, 0, 0, width, height);

          canvas.toBlob((blob) => {
            const newFile = new File([blob], file.name.replace(/\.[^/.]+$/, "") + ".jpg", {
              type: 'image/jpeg',
              lastModified: Date.now(),
            });
            resolve(newFile);
          }, 'image/jpeg', 0.8);
        };
        img.src = event.target.result;
      };
      reader.readAsDataURL(file);
    });
  };

  // Build categories from existing photos
  const categories = useMemo(() => {
    const cats = new Set(photos.map((p) => p.category));
    return ['All Memories', ...Array.from(cats).sort()];
  }, [photos]);

  const filtered = useMemo(() => {
    let items = selectedCategory === 'All Memories'
      ? [...photos]
      : photos.filter((m) => m.category === selectedCategory);
    if (!sortNewest) items.reverse();
    return items;
  }, [photos, selectedCategory, sortNewest]);

  const handleFileSelect = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) return;
    const cat = uploadCategory === '__new__' ? newCategory.trim() : uploadCategory;
    if (!cat) { showToast('❌ Please select or enter a category.'); return; }

    setUploading(true);
    showToast('⏳ Optimizing photo...');
    const compressedFile = await compressImage(selectedFile);
    
    const result = await uploadGalleryPhoto(compressedFile, uploadCaption, cat);
    setUploading(false);

    if (result.success) {
      showToast('✅ Photo added to gallery!');
      setShowUpload(false);
      setSelectedFile(null);
      setPreviewUrl(null);
      setUploadCaption('');
      setUploadCategory('');
      setNewCategory('');
      loadPhotos();
    } else {
      showToast(`❌ ${result.error}`);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Remove this photo from the gallery?')) return;
    const result = await deleteGalleryPhoto(id);
    if (result.success) {
      showToast('✅ Photo removed.');
      loadPhotos();
    } else {
      showToast(`❌ ${result.message}`);
    }
  };

  return (
    <div className="min-h-screen bg-stone-950">
      {/* Toast */}
      {toast && (
        <div className="fixed top-20 right-4 z-50 px-5 py-3 bg-stone-900/95 border border-stone-700 rounded-xl text-stone-200 text-sm shadow-xl backdrop-blur-xl">
          {toast}
        </div>
      )}

      {/* Header */}
      <div className="max-w-5xl mx-auto px-4 md:px-8 pt-16 pb-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <h1 className="text-5xl md:text-6xl font-serif italic text-stone-100 tracking-tight mb-4">
              The Archive
            </h1>
            <p className="text-stone-400 font-light max-w-lg leading-relaxed">
              A cinematic collection of fleeting moments, frozen in time. From the first lecture to the final goodbye.
            </p>
          </div>

          <div className="flex items-center gap-3 self-start md:self-auto">
            {/* Sort button */}
            <button
              onClick={() => setSortNewest(!sortNewest)}
              className="inline-flex items-center gap-2 px-5 py-2.5 border border-stone-700 rounded-full text-stone-300 text-sm hover:border-gold-500/30 hover:text-stone-100 transition-all duration-300"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
              </svg>
              {sortNewest ? 'Newest First' : 'Oldest First'}
            </button>

            {/* Admin: Add Photo Button */}
            {isAdmin && (
              <button
                onClick={() => setShowUpload(true)}
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-gold-500 text-stone-900 font-semibold text-sm rounded-full hover:bg-gold-400 transition-all shadow-[0_4px_20px_rgba(236,164,19,0.3)]"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Add Photo
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Category Filters */}
      <div className="max-w-5xl mx-auto px-4 md:px-8 mb-10">
        <div className="flex flex-wrap gap-2">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-4 py-1.5 text-sm rounded-full border transition-all duration-300 ${
                selectedCategory === cat
                  ? 'bg-gold-500/10 border-gold-500 text-gold-500'
                  : 'border-stone-700 text-stone-400 hover:border-gold-500/30 hover:text-stone-200'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Photo Grid */}
      <div className="max-w-5xl mx-auto px-4 md:px-8 pb-24">
        {loading ? (
          <div className="text-center py-20">
            <svg className="w-8 h-8 animate-spin text-gold-500 mx-auto mb-4" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
            <p className="text-stone-500">Loading gallery...</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-stone-500 font-handwriting text-2xl">No memories found</p>
            {isAdmin && (
              <button
                onClick={() => setShowUpload(true)}
                className="mt-4 text-gold-500 text-sm hover:underline"
              >
                + Add the first photo
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filtered.map((item) => (
              <div
                key={item._id}
                className="group relative overflow-hidden rounded-xl border border-stone-800/50 hover:border-gold-500/30 transition-all duration-500"
              >
                <div className="aspect-[4/3] overflow-hidden">
                  <img
                    src={item.photoData}
                    alt={item.caption}
                    className="w-full h-full object-cover group-hover:scale-[1.02] transition-transform duration-700"
                    loading="lazy"
                  />
                </div>

                {/* Caption overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-stone-950/90 via-stone-950/20 to-transparent opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity duration-500">
                  <div className="absolute bottom-0 left-0 right-0 p-4 md:p-5">
                    <p className="text-stone-100 font-serif text-base md:text-lg drop-shadow-md">{item.caption}</p>
                    <span className="text-gold-500/90 text-[10px] md:text-xs uppercase tracking-wider mt-1 block font-semibold drop-shadow">
                      {item.category}
                    </span>
                  </div>
                </div>

                {/* Admin: Delete button */}
                {isAdmin && (
                  <button
                    onClick={(e) => { e.stopPropagation(); handleDelete(item._id); }}
                    className="absolute top-3 right-3 w-8 h-8 rounded-full bg-red-500/20 border border-red-500/30 text-red-400 hover:bg-red-500/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 z-10"
                    title="Remove photo"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Upload Modal (Admin Only) */}
      {showUpload && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center">
          <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={() => setShowUpload(false)} />
          <div className="relative w-full max-w-lg mx-4 bg-stone-900/95 backdrop-blur-xl border border-stone-700/50 rounded-2xl p-8 shadow-2xl">
            <button
              onClick={() => { setShowUpload(false); setSelectedFile(null); setPreviewUrl(null); }}
              className="absolute top-4 right-4 text-stone-500 hover:text-stone-200 transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            <h3 className="text-xl font-serif text-gold-500 mb-2">Add to Gallery</h3>
            <p className="text-stone-500 text-sm mb-6">Upload a memory to the archive</p>

            <div className="space-y-4">
              {/* Image Preview / Select */}
              <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleFileSelect} />
              {previewUrl ? (
                <div className="relative aspect-[4/3] rounded-lg overflow-hidden border border-stone-700">
                  <img src={previewUrl} alt="Preview" className="w-full h-full object-cover" />
                  <button
                    onClick={() => { setSelectedFile(null); setPreviewUrl(null); }}
                    className="absolute top-2 right-2 w-7 h-7 bg-stone-900/80 rounded-full text-stone-300 flex items-center justify-center hover:text-white"
                  >×</button>
                </div>
              ) : (
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full aspect-[4/3] border-2 border-dashed border-stone-700 rounded-lg text-stone-500 hover:border-gold-500/50 hover:text-gold-500 transition-all flex flex-col items-center justify-center gap-2"
                >
                  <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <span className="text-sm">Click to select image</span>
                </button>
              )}

              {/* Caption */}
              <input
                type="text"
                value={uploadCaption}
                onChange={(e) => setUploadCaption(e.target.value)}
                placeholder="Caption (e.g., Farewell ceremony 2026)"
                className="w-full px-4 py-3 bg-stone-800/50 border border-stone-700/80 rounded-lg text-stone-100 placeholder:text-stone-500 text-sm focus:outline-none focus:border-gold-500/50"
              />

              {/* Category */}
              <select
                value={uploadCategory}
                onChange={(e) => setUploadCategory(e.target.value)}
                className="w-full px-4 py-3 bg-stone-800/50 border border-stone-700/80 rounded-lg text-stone-100 text-sm focus:outline-none focus:border-gold-500/50 appearance-none cursor-pointer"
              >
                <option value="">Select Category</option>
                {categories.filter(c => c !== 'All Memories').map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
                <option value="__new__">+ Create New Category</option>
              </select>

              {uploadCategory === '__new__' && (
                <input
                  type="text"
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value)}
                  placeholder="New category name (e.g., Fiesta'25)"
                  className="w-full px-4 py-3 bg-stone-800/50 border border-stone-700/80 rounded-lg text-stone-100 placeholder:text-stone-500 text-sm focus:outline-none focus:border-gold-500/50"
                />
              )}

              <button
                onClick={handleUpload}
                disabled={!selectedFile || uploading}
                className="w-full py-3 bg-gold-500/90 hover:bg-gold-400 text-stone-900 font-semibold rounded-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {uploading ? (
                  <>
                    <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    Uploading...
                  </>
                ) : 'Add to Gallery'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
