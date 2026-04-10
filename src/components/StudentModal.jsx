import { useState, useEffect } from 'react';
import { getStudentMessages, postStudentMessage, deleteStudentMessage } from '../utils/auth';

export default function StudentModal({ student, students, onClose, onNavigate, user, photo }) {
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState([]);
  const [sending, setSending] = useState(false);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      const msgs = await getStudentMessages(student.id);
      if (!cancelled) setMessages(msgs);
    }
    load();
    return () => { cancelled = true; };
  }, [student.id]);

  if (!student) return null;

  const currentIndex = students.findIndex((s) => s.id === student.id);

  const goTo = (dir) => {
    const newIndex = dir === 'prev'
      ? (currentIndex - 1 + students.length) % students.length
      : (currentIndex + 1) % students.length;
    onNavigate(students[newIndex]);
  };

  const initials = student.name.split(' ').map((n) => n[0]).join('').slice(0, 2);

  const handleSend = async () => {
    if (!message.trim() || sending) return;
    setSending(true);
    const result = await postStudentMessage(student.id, message);
    setSending(false);
    if (result.success) {
      setMessage('');
      // Refresh messages
      const msgs = await getStudentMessages(student.id);
      setMessages(msgs);
    }
  };

  const handleDeleteMessage = async (msgId) => {
    if (!confirm('Delete this message?')) return;
    const result = await deleteStudentMessage(msgId);
    if (result.success) {
      setMessages((prev) => prev.filter(m => m._id !== msgId));
    } else {
      alert('Failed to delete message: ' + (result.error || result.message));
    }
  };

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={onClose} />

      {/* Previous Button */}
      <button
        onClick={() => goTo('prev')}
        className="absolute left-2 md:left-6 top-1/2 -translate-y-1/2 z-[220] w-10 h-10 md:w-12 md:h-12 rounded-full bg-stone-800/50 border border-stone-700/50 text-stone-300 hover:text-gold-500 hover:border-gold-500/30 flex items-center justify-center transition-all duration-300"
      >
        <svg className="w-5 h-5 md:w-6 md:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
      </button>

      {/* Next Button */}
      <button
        onClick={() => goTo('next')}
        className="absolute right-2 md:right-6 top-1/2 -translate-y-1/2 z-[220] w-10 h-10 md:w-12 md:h-12 rounded-full bg-stone-800/50 border border-stone-700/50 text-stone-300 hover:text-gold-500 hover:border-gold-500/30 flex items-center justify-center transition-all duration-300"
      >
        <svg className="w-5 h-5 md:w-6 md:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
      </button>

      {/* Modal Content */}
      <div className="relative w-full max-w-4xl mx-4 h-[85dvh] max-h-[85dvh] bg-stone-900/90 backdrop-blur-xl rounded-2xl md:rounded-3xl overflow-hidden border border-stone-700/50 shadow-2xl shadow-black/50 flex flex-col md:flex-row">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-[250] w-9 h-9 rounded-full bg-stone-800/50 border border-stone-700/50 text-stone-400 hover:text-stone-100 flex items-center justify-center transition-colors"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        {/* Left: Student Photo */}
        <div className="relative md:w-5/12 h-64 md:h-full flex-shrink-0 bg-stone-950">
          {photo ? (
            <img src={photo} alt={student.name} className="w-full h-full object-cover grayscale-[30%]" />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-stone-800 to-stone-900">
              <span className="text-6xl md:text-8xl font-serif text-stone-600 opacity-50">{initials}</span>
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-stone-900 via-transparent to-transparent" />
          <div className="absolute bottom-0 left-0 p-6 md:p-8">
            <h2 className="text-2xl md:text-3xl font-serif text-stone-100 leading-tight">{student.name}</h2>
            <div className="flex items-center gap-2 mt-2">
              <span className="text-gold-500 font-semibold text-sm tracking-wider uppercase">{student.major}</span>
              <span className="text-stone-600">|</span>
              <span className="text-stone-400 text-sm font-mono">{student.rollNo}</span>
            </div>
          </div>
        </div>

        {/* Right: Messages Section */}
        <div className="flex-1 flex flex-col md:w-7/12 border-t md:border-t-0 md:border-l border-stone-700/50 min-h-0">
          <div className="px-6 pt-4">
            <span className="text-gold-500/60 font-serif text-4xl leading-none">❝</span>
          </div>
          <div className="px-6 pb-4 flex items-center justify-between">
            <h3 className="text-lg font-serif text-stone-200">Messages from the Batch</h3>
            <span className="text-xs text-stone-500 uppercase tracking-widest border border-stone-700 rounded-full px-3 py-1">
              {messages.length} {messages.length === 1 ? 'reply' : 'replies'}
            </span>
          </div>

          <div className="flex-1 overflow-y-auto px-6 space-y-4 custom-scrollbar min-h-0">
            {messages.length > 0 ? (
              messages.map((msg, i) => (
                <div key={msg._id || i} className="bg-stone-800/30 border border-stone-700/50 rounded-xl p-4">
                  <p className="font-handwriting text-xl text-stone-200 italic leading-relaxed">{msg.text}</p>
                  <div className="flex items-center justify-between mt-3">
                    <span className="text-stone-500 text-sm">~ {msg.author}</span>
                    <div className="flex items-center gap-3">
                      {user?.role === 'admin' && (
                        <button 
                          onClick={() => handleDeleteMessage(msg._id)}
                          className="text-red-500/50 hover:text-red-400 p-1 transition-colors"
                          title="Delete message"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                        </button>
                      )}
                      <span className="text-stone-600 text-xs">
                        {msg.createdAt ? new Date(msg.createdAt).toLocaleDateString() : ''}
                      </span>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-12 text-stone-600">
                <p className="font-handwriting text-xl">No messages yet</p>
                <p className="text-sm mt-2">Be the first to leave a farewell note</p>
              </div>
            )}
          </div>

          {/* Message Input */}
          <div className="p-4 border-t border-stone-800/50">
            {user ? (
              <div className="flex items-end gap-2 bg-stone-800/40 rounded-xl p-3 border border-stone-700/50">
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Write a farewell message..."
                  rows={2}
                  className="flex-1 bg-transparent text-stone-200 placeholder:text-stone-600 font-handwriting text-lg resize-none focus:outline-none"
                />
                <button
                  onClick={handleSend}
                  disabled={!message.trim() || sending}
                  className="flex-shrink-0 w-10 h-10 rounded-full bg-gold-600/20 text-gold-500 hover:bg-gold-500 hover:text-stone-900 flex items-center justify-center transition-all duration-300 disabled:opacity-30"
                >
                  {sending ? (
                    <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                  ) : (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                    </svg>
                  )}
                </button>
              </div>
            ) : (
              <div className="text-center py-3 text-stone-500 text-sm">
                <span className="text-gold-500/60">🔒</span> Sign in to leave a message
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
