import { Link } from 'react-router-dom';
import { useEffect, useState, useRef } from 'react';
import { getJourneyEvents, uploadJourneyEvent, editJourneyEvent, deleteJourneyEvent } from '../utils/auth';

const MobilePhotoDeck = ({ event, photos }) => {
  const [topIndex, setTopIndex] = useState(0);

  const cyclePhotos = () => {
    setTopIndex((prev) => (prev + 1) % photos.length);
  };

  return (
    <div onClick={cyclePhotos} className="relative w-[85%] mx-auto h-[260px] sm:h-80 cursor-pointer md:hidden active:scale-[0.98] transition-transform flex items-end justify-center mb-8 px-4">
       {photos.map((photo, i) => {
         const offset = (i - topIndex + photos.length) % photos.length;
         const isTop = offset === 0;
         const isMiddle = offset === 1;
         
         const rotate = isTop ? 'rotate-0' : isMiddle ? (photos.length === 2 ? 'rotate-2' : 'rotate-3') : '-rotate-2';
         const zIndex = isTop ? 'z-30' : isMiddle ? 'z-20' : 'z-10';
         const scale = isTop ? 'scale-100 translate-y-0' : isMiddle ? 'scale-[0.93] -translate-y-5 opacity-90' : 'scale-[0.85] -translate-y-10 opacity-70';

         return (
           <div 
             key={i} 
             className={`absolute bottom-0 w-full transition-all duration-500 ease-[cubic-bezier(0.25,0.8,0.25,1)] origin-bottom ${zIndex} ${scale} ${rotate}`}
           >
             <div className="bg-stone-100 p-2 pb-10 shadow-2xl shadow-black/40 border border-stone-300 pointer-events-none">
                <img src={photo} alt={event.title} className="w-full aspect-[4/3] object-cover pointer-events-none" />
                {event.caption && isTop && (
                   <p className="absolute bottom-2 left-0 w-full text-center font-handwriting text-stone-800 text-lg px-2 truncate leading-tight animate-fade-in pointer-events-none">
                     {event.caption}
                   </p>
                )}
             </div>
           </div>
         );
       })}
       
       <div className="absolute top-2 right-2 z-40 bg-black/60 backdrop-blur-md rounded-full p-2 text-stone-300 animate-pulse pointer-events-none shadow-lg">
         <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5M7.188 2.239l.777 2.897M5.136 7.965l-2.898-.777M13.95 4.05l-2.122 2.122m-5.657 5.656l-2.12 2.122"/></svg>
       </div>
    </div>
  );
};

export default function JourneyPage({ user }) {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [visible, setVisible] = useState(new Set());
  
  const [showModal, setShowModal] = useState(false);
  const [editId, setEditId] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [toast, setToast] = useState('');
  
  const fileInputRef = useRef(null);
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [keptPhotos, setKeptPhotos] = useState([]);
  
  const [form, setForm] = useState({ year: '', title: '', description: '', caption: '', order: '' });

  const isAdmin = user?.role === 'admin';

  useEffect(() => { loadEvents(); }, []);

  useEffect(() => {
    if (events.length === 0) return;
    const timer = setTimeout(() => {
      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              setVisible((prev) => new Set([...prev, entry.target.dataset.idx]));
            }
          });
        },
        { threshold: 0.2 }
      );
      document.querySelectorAll('[data-idx]').forEach((el) => observer.observe(el));
      return () => observer.disconnect();
    }, 100);
    return () => clearTimeout(timer);
  }, [events]);

  const loadEvents = async () => {
    setLoading(true);
    const data = await getJourneyEvents();
    setEvents(data);
    setLoading(false);
  };

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(''), 3000);
  };

  const compressImage = (file) => {
    return new Promise((resolve) => {
      // Small files don't need heavy compression, but we convert all to jpeg to save base64 space
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
          }, 'image/jpeg', 0.8); // 80% quality
        };
        img.src = event.target.result;
      };
      reader.readAsDataURL(file);
    });
  };

  const openAddModal = () => {
    setEditId(null);
    setForm({ year: '', title: '', description: '', caption: '', order: '' });
    setSelectedFiles([]);
    setKeptPhotos([]);
    setShowModal(true);
  };

  const openEditModal = (event) => {
    setEditId(event._id);
    setForm({
      year: event.year,
      title: event.title,
      description: event.description || '',
      caption: event.caption || '',
      order: event.order || 0
    });
    setSelectedFiles([]);
    const existingPhotos = event.photos && event.photos.length > 0 ? event.photos : (event.photoData ? [event.photoData] : []);
    setKeptPhotos(existingPhotos);
    setShowModal(true);
  };

  const handleFileSelect = async (e) => {
    const rawFiles = Array.from(e.target.files);
    if (keptPhotos.length + selectedFiles.length + rawFiles.length > 3) {
      showToast('❌ Maximum 3 photos allowed combined.');
      return;
    }
    
    setUploading(true);
    showToast('⏳ Optimizing photos...');
    const compressedFiles = await Promise.all(rawFiles.map(file => compressImage(file)));
    setUploading(false);

    setSelectedFiles(prev => [...prev, ...compressedFiles]);
    // Reset input value so the same file can be selected again if needed
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const removePhotoForm = (idx) => {
    if (idx < keptPhotos.length) {
      // Removing a kept photo
      const newKept = [...keptPhotos];
      newKept.splice(idx, 1);
      setKeptPhotos(newKept);
    } else {
      // Removing a newly selected file
      const selectedIdx = idx - keptPhotos.length;
      const newFiles = [...selectedFiles];
      newFiles.splice(selectedIdx, 1);
      setSelectedFiles(newFiles);
    }
  };

  // Derive preview URLs dynamically
  const previewUrls = [...keptPhotos, ...selectedFiles.map(f => URL.createObjectURL(f))];

  const handleSave = async () => {
    if ((!selectedFiles.length && !keptPhotos.length) || !form.year || !form.title) {
      showToast('❌ Photo(s), year, and title are required.');
      return;
    }
    
    setUploading(true);
    let result;
    if (editId) {
      result = await editJourneyEvent(
        editId, keptPhotos, selectedFiles, form.year, form.title, form.description, form.caption, form.order
      );
    } else {
      result = await uploadJourneyEvent(
        selectedFiles, form.year, form.title, form.description, form.caption, form.order || events.length
      );
    }
    setUploading(false);

    if (result.success) {
      showToast(editId ? '✅ Event updated!' : '✅ Journey event added!');
      setShowModal(false);
      setSelectedFiles([]);
      setKeptPhotos([]);
      loadEvents();
    } else {
      showToast(`❌ ${result.error}`);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Remove this journey event completely?')) return;
    const result = await deleteJourneyEvent(id);
    if (result.success) {
      showToast('✅ Event removed.');
      loadEvents();
    } else {
      showToast(`❌ ${result.message}`);
    }
  };

  // Helper to render photo cards creatively based on count
  const renderPhotos = (event, isLeft) => {
    const photos = event.photos && event.photos.length > 0 ? event.photos : (event.photoData ? [event.photoData] : []);
    
    if (photos.length === 0) return null;

    if (photos.length === 1) {
      return (
        <div className="relative group">
          <div className={`bg-stone-100 p-2 pb-12 shadow-xl shadow-black/20 ${isLeft ? 'rotate-1' : '-rotate-1'} hover:rotate-0 transition-transform duration-500 max-w-sm mx-auto md:mx-0 ${isLeft ? 'md:ml-auto' : ''}`}>
            <img src={photos[0]} alt={event.title} className="w-full aspect-[4/3] object-cover" loading="lazy" />
            <p className="absolute bottom-3 left-4 font-handwriting text-stone-800 text-lg">{event.caption}</p>
          </div>
        </div>
      );
    }

    // Mobile Tap Deck View for Multiple Photos
    const mobileView = <MobilePhotoDeck event={event} photos={photos} />;

    if (photos.length === 2) {
      return (
        <>
          {mobileView}
          <div className={`hidden md:block relative group w-full max-w-sm h-80 ${isLeft ? 'ml-auto' : ''}`}>
            {/* Photo 1: Tilted Left */}
            <div className="absolute top-0 left-0 w-[85%] bg-stone-100 p-2 pb-12 shadow-xl shadow-black/20 -rotate-3 hover:rotate-0 hover:z-30 transition-transform duration-500 z-10">
              <img src={photos[0]} alt={event.title} className="w-full aspect-[4/3] object-cover" loading="lazy" />
            </div>
            {/* Photo 2: Tilted Right */}
            <div className="absolute top-4 right-0 w-[85%] bg-stone-100 p-2 pb-12 shadow-xl shadow-black/20 rotate-3 hover:rotate-0 hover:z-30 transition-transform duration-500 z-20">
              <img src={photos[1]} alt={event.title} className="w-full aspect-[4/3] object-cover" loading="lazy" />
              <p className="absolute bottom-3 right-4 font-handwriting text-stone-800 text-lg">{event.caption}</p>
            </div>
          </div>
        </>
      );
    }

    // 3 Photos
    return (
      <>
        {mobileView}
        <div className={`hidden md:flex relative group w-full max-w-md h-96 items-center justify-center ${isLeft ? 'ml-auto' : ''}`}>
          {/* Photo 1: Left */}
          <div className="absolute left-0 top-8 w-[60%] bg-stone-100 p-2 pb-10 shadow-xl shadow-black/20 -rotate-6 hover:rotate-0 hover:-translate-y-4 hover:z-40 transition-all duration-500 z-10">
            <img src={photos[0]} alt={event.title} className="w-full aspect-[4/3] object-cover" loading="lazy" />
          </div>
          {/* Photo 3: Right */}
          <div className="absolute right-0 top-8 w-[60%] bg-stone-100 p-2 pb-10 shadow-xl shadow-black/20 rotate-6 hover:rotate-0 hover:-translate-y-4 hover:z-40 transition-all duration-500 z-20">
            <img src={photos[2]} alt={event.title} className="w-full aspect-[4/3] object-cover" loading="lazy" />
          </div>
          {/* Photo 2: Center */}
          <div className="absolute left-1/2 -translate-x-1/2 top-0 w-[65%] bg-stone-100 p-2 pb-12 shadow-2xl shadow-black/40 rotate-0 hover:-translate-y-4 hover:z-40 transition-all duration-500 z-30">
            <img src={photos[1]} alt={event.title} className="w-full aspect-[4/3] object-cover" loading="lazy" />
            <p className="absolute bottom-3 left-0 w-full text-center font-handwriting text-stone-800 text-lg px-2 truncate leading-tight">{event.caption}</p>
          </div>
        </div>
      </>
    );
  };

  return (
    <div className="min-h-screen bg-stone-950">
      {toast && (
        <div className="fixed top-20 right-4 z-50 px-5 py-3 bg-stone-900/95 border border-stone-700 rounded-xl text-stone-200 text-sm shadow-xl backdrop-blur-xl">
          {toast}
        </div>
      )}

      {/* Header */}
      <div className="text-center pt-16 pb-12 px-4">
        <span className="inline-block px-4 py-1.5 text-xs font-semibold tracking-[0.3em] uppercase text-gold-500 border border-gold-500/30 rounded-full mb-6">
          Our History
        </span>
        <h1 className="text-4xl md:text-5xl font-serif text-stone-100 tracking-tight">
          The Journey: 2022–2026
        </h1>

        {isAdmin && (
          <button
            onClick={openAddModal}
            className="mt-6 inline-flex items-center gap-2 px-6 py-2.5 bg-gold-500 text-stone-900 font-semibold text-sm rounded-full hover:bg-gold-400 transition-all shadow-[0_4px_20px_rgba(236,164,19,0.3)]"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Add Journey Event
          </button>
        )}
      </div>

      {/* Timeline */}
      <div className="max-w-5xl mx-auto px-4 md:px-8 pb-32">
        {loading ? (
          <div className="text-center py-20">
            <svg className="w-8 h-8 animate-spin text-gold-500 mx-auto mb-4" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
          </div>
        ) : events.length === 0 ? (
          <div className="text-center py-20 text-stone-500 font-handwriting text-2xl">No journey events yet</div>
        ) : (
          <div className="relative pt-10">
            {/* Center line */}
            <div className="absolute left-4 md:left-1/2 top-0 bottom-0 w-px bg-gradient-to-b from-gold-500/30 via-stone-700 to-stone-800" />

            {/* Events */}
            <div className="space-y-40">
              {events.map((event, idx) => {
                const isLeft = idx % 2 === 0;
                const isVis = visible.has(String(idx));

                return (
                  <div
                    key={event._id}
                    data-idx={idx}
                    className={`relative transition-all duration-1000 ease-out ${
                      isVis ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
                    }`}
                  >
                    {/* Year marker */}
                    <div className="absolute left-4 md:left-1/2 -translate-x-[23px] md:-translate-x-1/2 -top-3 z-10 bg-stone-950 py-2">
                       <div className="w-12 h-12 rounded-full bg-stone-900 border-2 border-gold-500 flex items-center justify-center">
                        <span className="text-gold-500 text-xs font-bold">{event.year}</span>
                      </div>
                    </div>

                    {/* Content Row */}
                    <div className={`md:flex items-center gap-12 pl-16 md:pl-0 ${isLeft ? '' : 'md:flex-row-reverse'}`}>
                      {/* Photo Section */}
                      <div className={`w-full md:w-1/2 mb-8 md:mb-0 ${isLeft ? 'md:pr-12' : 'md:pl-12'}`}>
                        {renderPhotos(event, isLeft)}
                      </div>

                      {/* Text Section */}
                      <div className={`w-full md:w-1/2 ${isLeft ? 'md:pl-12' : 'md:pr-12'}`}>
                        <div className="flex items-center justify-between mb-4">
                          <h3 className="text-2xl md:text-3xl font-serif text-stone-100">
                            {event.title}
                          </h3>
                          {isAdmin && (
                            <div className="flex items-center gap-2">
                              <button onClick={() => openEditModal(event)} className="w-8 h-8 rounded-full bg-stone-800/50 border border-stone-700/50 text-stone-400 hover:text-gold-500 hover:border-gold-500/30 flex items-center justify-center transition-all" title="Edit event">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
                              </button>
                              <button onClick={() => handleDelete(event._id)} className="w-8 h-8 rounded-full bg-red-500/10 border border-red-500/20 text-red-400 hover:bg-red-500/20 hover:border-red-500/40 flex items-center justify-center transition-all" title="Delete event">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                              </button>
                            </div>
                          )}
                        </div>
                        <p className="text-stone-400 leading-relaxed font-light">
                          {event.description}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      <div className="text-center pb-24">
        <Link to="/yearbook" className="inline-flex items-center gap-2 text-stone-500 text-xs tracking-[0.2em] uppercase hover:text-gold-500 transition-colors duration-300">
          Meet the Class
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" /></svg>
        </Link>
      </div>

      {/* Upload/Edit Modal (Admin Only) */}
      {showModal && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center">
          <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={() => setShowModal(false)} />
          <div className="relative w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto bg-stone-900/95 backdrop-blur-xl border border-stone-700/50 rounded-2xl p-8 shadow-2xl custom-scrollbar">
            <button onClick={() => setShowModal(false)} className="absolute top-4 right-4 text-stone-500 hover:text-stone-200 transition-colors">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
            </button>

            <h3 className="text-xl font-serif text-gold-500 mb-2">{editId ? 'Edit Journey Event' : 'Add Journey Event'}</h3>
            <p className="text-stone-500 text-sm mb-6">Create or update a milestone in the timeline.</p>

            <div className="space-y-5">
              {/* Image Input */}
              <div>
                <label className="block text-stone-400 text-xs tracking-wider uppercase mb-2">Photos (Up to 3)</label>
                <input ref={fileInputRef} type="file" accept="image/*" multiple className="hidden" onChange={handleFileSelect} />
                
                {previewUrls.length > 0 ? (
                  <div className="flex gap-4 overflow-x-auto pb-2 custom-scrollbar">
                    {previewUrls.map((url, idx) => (
                      <div key={idx} className="relative shrink-0 w-32 aspect-[4/3] rounded-lg overflow-hidden border border-stone-700">
                        <img src={url} alt="Preview" className="w-full h-full object-cover" />
                        <button
                          onClick={() => removePhotoForm(idx)}
                          className="absolute top-1 right-1 w-6 h-6 bg-stone-900/80 rounded-full text-stone-300 flex items-center justify-center hover:text-white"
                        >×</button>
                      </div>
                    ))}
                    {previewUrls.length < 3 && (
                      <button onClick={() => fileInputRef.current?.click()} className="shrink-0 w-32 aspect-[4/3] border border-dashed border-stone-700 hover:border-gold-500/50 rounded-lg text-stone-500 flex items-center justify-center">
                        <span className="text-xl">+</span>
                      </button>
                    )}
                  </div>
                ) : (
                  <button onClick={() => fileInputRef.current?.click()} className="w-full aspect-[21/9] border-2 border-dashed border-stone-700 rounded-lg text-stone-500 hover:border-gold-500/50 hover:text-gold-500 transition-all flex flex-col items-center justify-center gap-2">
                    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <span className="text-sm">Click to select up to 3 photos</span>
                  </button>
                )}
              </div>

              {/* Year & Order */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-stone-400 text-xs tracking-wider uppercase mb-2">Year *</label>
                  <input type="text" value={form.year} onChange={(e) => setForm({ ...form, year: e.target.value })} placeholder="e.g., 2024" className="w-full px-4 py-3 bg-stone-800/50 border border-stone-700/80 rounded-lg text-stone-100 text-sm focus:outline-none focus:border-gold-500/50" />
                </div>
                <div>
                  <label className="block text-stone-400 text-xs tracking-wider uppercase mb-2">Timeline Order</label>
                  <input type="number" value={form.order} onChange={(e) => setForm({ ...form, order: e.target.value })} placeholder="0, 1, 2..." className="w-full px-4 py-3 bg-stone-800/50 border border-stone-700/80 rounded-lg text-stone-100 text-sm focus:outline-none focus:border-gold-500/50" />
                </div>
              </div>

              {/* Title & Caption */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-stone-400 text-xs tracking-wider uppercase mb-2">Title *</label>
                  <input type="text" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="Event Title" className="w-full px-4 py-3 bg-stone-800/50 border border-stone-700/80 rounded-lg text-stone-100 text-sm focus:outline-none focus:border-gold-500/50" />
                </div>
                <div>
                  <label className="block text-stone-400 text-xs tracking-wider uppercase mb-2">Photo Caption</label>
                  <input type="text" value={form.caption} onChange={(e) => setForm({ ...form, caption: e.target.value })} placeholder="Caption on polaroid..." className="w-full px-4 py-3 bg-stone-800/50 border border-stone-700/80 rounded-lg text-stone-100 text-sm focus:outline-none focus:border-gold-500/50" />
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block text-stone-400 text-xs tracking-wider uppercase mb-2">Description</label>
                <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Describe the event..." rows={4} className="w-full px-4 py-3 bg-stone-800/50 border border-stone-700/80 rounded-lg text-stone-100 text-sm focus:outline-none focus:border-gold-500/50 resize-y min-h-[100px]" />
              </div>

              <button
                onClick={handleSave}
                disabled={uploading}
                className="w-full py-3 bg-gold-500/90 hover:bg-gold-400 text-stone-900 font-semibold rounded-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {uploading ? 'Saving...' : (editId ? 'Save Changes' : 'Add to Journey')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
