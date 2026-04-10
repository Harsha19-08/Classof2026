import { useState, useEffect } from 'react';
import { getWallMessages, postWallMessage, deleteWallMessage } from '../utils/auth';

const cardColors = [
  'bg-[#fdfbf7]',
  'bg-[#e3d5b8]',
  'bg-[#fffdf0]',
  'bg-[#f4e4bc]',
];

const tapeColors = [
  'bg-stone-300/80',
  'bg-stone-400/60',
  'bg-[#d4c5a8]',
  'bg-stone-200/70',
];

export default function WallPage({ user }) {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [newMessage, setNewMessage] = useState('');
  const [sending, setSending] = useState(false);

  useEffect(() => {
    loadMessages();
  }, []);

  const loadMessages = async () => {
    setLoading(true);
    const msgs = await getWallMessages();
    setMessages(msgs);
    setLoading(false);
  };

  const handleSubmit = async () => {
    if (!newMessage.trim() || sending) return;
    setSending(true);
    const result = await postWallMessage(newMessage);
    setSending(false);
    if (result.success) {
      setNewMessage('');
      setShowForm(false);
      loadMessages();
    }
  };

  const handleDeleteMessage = async (msgId) => {
    if (!confirm('Delete this message from the wall?')) return;
    const result = await deleteWallMessage(msgId);
    if (result.success) {
      setMessages((prev) => prev.filter(m => m._id !== msgId));
    } else {
      alert('Failed to delete message: ' + (result.error || result.message));
    }
  };

  return (
    <div className="min-h-screen bg-stone-950 relative">
      {/* Ambient background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-20%] left-1/4 w-[50vw] h-[50vw] bg-gold-600/5 rounded-full blur-[120px]" />
        <div className="absolute bottom-1/4 right-[-10%] w-[40vw] h-[40vw] bg-yellow-900/10 rounded-full blur-[100px]" />
      </div>

      {/* Header */}
      <div className="relative text-center pt-16 pb-12 px-4">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-gold-600/10 border border-gold-500/30 rounded-full mb-6">
          <span className="text-gold-500">💛</span>
          <span className="text-gold-500 text-xs font-semibold tracking-[0.2em] uppercase">
            Final Goodbyes
          </span>
        </div>
        <h1 className="text-3xl md:text-5xl font-serif font-bold text-stone-100 tracking-tight mb-4">
          Message Wall of Reflection
        </h1>
        <p className="text-stone-400 font-light text-sm md:text-base max-w-xl mx-auto leading-relaxed">
          A space to leave your final words, memories, and wishes. These notes will remain here as a testament to our journey.
        </p>
      </div>

      {/* Messages Grid */}
      <div className="relative max-w-5xl mx-auto px-4 md:px-8 pb-32">
        {loading ? (
          <div className="text-center py-20">
            <svg className="w-8 h-8 animate-spin text-gold-500 mx-auto mb-4" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
            <p className="text-stone-500">Loading messages...</p>
          </div>
        ) : messages.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-stone-600 font-handwriting text-2xl">No messages yet on the wall</p>
            <p className="text-stone-700 text-sm mt-2">Be the first to write something!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {messages.map((msg, idx) => {
              const colorClass = cardColors[idx % cardColors.length];
              const tapeClass = tapeColors[idx % tapeColors.length];
              const rotation = idx % 4 === 0 ? 'rotate-1' : idx % 4 === 1 ? '-rotate-1' : idx % 3 === 0 ? 'rotate-1' : '';

              return (
                <div
                  key={msg._id}
                  className={`relative ${colorClass} ${rotation} rounded-sm shadow-md shadow-black/20 p-6 pb-8 transition-all duration-500 hover:rotate-0 hover:scale-[1.02] hover:shadow-lg`}
                >
                  <div className={`absolute -top-3 ${idx % 2 === 0 ? 'left-1/4' : 'right-1/4'} w-16 h-6 ${tapeClass} rounded-sm opacity-70 transform rotate-1`} />
                  <p className="font-handwriting text-xl md:text-2xl text-stone-800 italic leading-relaxed mb-6">
                    "{msg.text}"
                  </p>
                  <p className="font-sans font-bold text-sm text-stone-900">{msg.author}</p>
                  <div className="flex items-center justify-between mt-1">
                    <p className="text-stone-500 text-xs">
                      {new Date(msg.createdAt).toLocaleDateString()}
                    </p>
                    {user?.role === 'admin' && (
                      <button 
                        onClick={() => handleDeleteMessage(msg._id)}
                        className="text-red-500 hover:text-red-600 transition-colors bg-red-100/50 hover:bg-red-200 p-1.5 rounded-full"
                        title="Delete message"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Floating Write Button */}
      {user && (
        <button
          onClick={() => setShowForm(true)}
          className="fixed bottom-8 right-8 z-30 flex items-center gap-2 px-6 py-3 bg-gold-500 hover:bg-gold-400 text-stone-900 font-semibold rounded-full shadow-[0_4px_20px_rgba(236,164,19,0.4)] hover:shadow-[0_4px_30px_rgba(236,164,19,0.6)] transition-all duration-300"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
          </svg>
          Write a Message
        </button>
      )}

      {!user && (
        <div className="fixed bottom-8 right-8 z-30 px-5 py-3 bg-stone-800/80 backdrop-blur border border-stone-700/50 rounded-full text-stone-400 text-sm">
          🔒 Sign in to write on the wall
        </div>
      )}

      {/* Write Message Modal */}
      {showForm && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center">
          <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={() => setShowForm(false)} />
          <div className="relative w-full max-w-md mx-4 bg-stone-900/90 backdrop-blur-xl border border-stone-700/50 rounded-2xl p-8 shadow-2xl shadow-black/50">
            <button
              onClick={() => setShowForm(false)}
              className="absolute top-4 right-4 text-stone-500 hover:text-stone-200 transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            <h3 className="text-xl font-serif text-gold-500 mb-2">Leave Your Mark</h3>
            <p className="text-stone-500 text-sm mb-6">Write a farewell message for the batch</p>

            <div className="space-y-4">
              <textarea
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder="Your message..."
                rows={4}
                className="w-full px-4 py-3 bg-stone-800/50 border border-stone-700/80 rounded-lg text-stone-100 font-handwriting text-lg placeholder:text-stone-600 placeholder:font-sans placeholder:text-sm focus:outline-none focus:border-gold-500/50 resize-none"
              />
              <div className="text-xs text-stone-600">
                Posting as <span className="text-gold-500">{user?.name}</span>
              </div>
              <button
                onClick={handleSubmit}
                disabled={!newMessage.trim() || sending}
                className="w-full py-3 bg-gold-500/90 hover:bg-gold-400 text-stone-900 font-semibold rounded-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {sending ? (
                  <>
                    <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    Posting...
                  </>
                ) : 'Post Message'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
