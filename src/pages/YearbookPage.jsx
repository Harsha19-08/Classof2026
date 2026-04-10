import { useState, useMemo, useEffect } from 'react';
import { students, majors } from '../data/students';
import StudentModal from '../components/StudentModal';
import { getAllStudentPhotos } from '../utils/auth';

export default function YearbookPage({ user }) {
  const [search, setSearch] = useState('');
  const [selectedMajor, setSelectedMajor] = useState('All Majors');
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [photos, setPhotos] = useState({});

  // Fetch all student photos on mount
  useEffect(() => {
    loadPhotos();
  }, []);

  const loadPhotos = async () => {
    const photoMap = await getAllStudentPhotos();
    setPhotos(photoMap);
  };

  const filtered = useMemo(() => {
    return students.filter((s) => {
      const matchesSearch =
        s.name.toLowerCase().includes(search.toLowerCase()) ||
        s.rollNo.toLowerCase().includes(search.toLowerCase());
      const matchesMajor = selectedMajor === 'All Majors' || s.major === selectedMajor;
      return matchesSearch && matchesMajor;
    });
  }, [search, selectedMajor]);

  const getInitials = (name) => name.split(' ').map((n) => n[0]).join('');

  // Get photo for a student (from API photos map by rollNo)
  const getPhoto = (rollNo) => photos[rollNo?.toUpperCase()] || null;

  return (
    <div className="min-h-screen bg-stone-950">
      {/* Header */}
      <div className="text-center pt-16 pb-8 px-4">
        <h1 className="text-4xl md:text-6xl font-serif text-stone-100 italic tracking-tight mb-4">
          The Class of '26
        </h1>
        <p className="text-stone-400 font-light text-sm md:text-base max-w-xl mx-auto">
          Faces that defined our journey. Moments that became memories. Click a card to sign their yearbook.
        </p>
      </div>

      {/* Search & Filters */}
      <div className="max-w-7xl mx-auto px-4 md:px-8 mb-10">
        <div className="flex flex-col md:flex-row items-center gap-4">
          {/* Search */}
          <div className="relative w-full md:w-auto flex-shrink-0">
            <svg
              className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-stone-500"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
            <input
              type="text"
              placeholder="Find a classmate..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full md:w-64 pl-10 pr-4 py-2.5 bg-stone-800/40 border border-stone-700/50 rounded-full text-stone-200 text-sm placeholder:text-stone-500 focus:outline-none focus:border-gold-500/50 transition-all"
            />
          </div>

          {/* Filter Chips */}
          <div className="flex flex-wrap gap-2 overflow-x-auto no-scrollbar">
            {majors.map((major) => (
              <button
                key={major}
                onClick={() => setSelectedMajor(major)}
                className={`px-4 py-1.5 text-sm rounded-full border transition-all duration-300 whitespace-nowrap ${
                  selectedMajor === major
                    ? 'bg-gold-500/10 border-gold-500 text-gold-500'
                    : 'border-stone-700 text-stone-400 hover:border-gold-500/30 hover:text-stone-200'
                }`}
              >
                {major}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Student Grid */}
      <div className="max-w-7xl mx-auto px-4 md:px-8 pb-24">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((student) => {
            const photo = getPhoto(student.rollNo);
            return (
              <div
                key={student.id}
                onClick={() => setSelectedStudent(student)}
                className="group cursor-pointer transition-all duration-500"
              >
                {/* Image Area */}
                <div className="relative aspect-[3/4] overflow-hidden rounded-xl border border-stone-800/50 group-hover:border-stone-700 transition-all duration-500 bg-stone-900">
                  {photo ? (
                    <img
                      src={photo}
                      alt={student.name}
                      className="w-full h-full object-cover grayscale group-hover:grayscale-0 group-hover:scale-110 transition-all duration-700"
                      loading="lazy"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-stone-800 to-stone-900">
                      <span className="text-6xl md:text-8xl font-serif text-stone-600/50 group-hover:text-stone-500/60 transition-colors duration-500">
                        {getInitials(student.name)}
                      </span>
                    </div>
                  )}

                  {/* Hover overlay with OPEN YEARBOOK button */}
                  <div className="absolute inset-0 bg-black/60 backdrop-blur-[2px] opacity-0 group-hover:opacity-100 transition-all duration-500 flex items-center justify-center">
                    <span className="px-6 py-2.5 border border-gold-500 rounded-full text-gold-500 text-xs font-semibold tracking-[0.2em] uppercase translate-y-4 group-hover:translate-y-0 transition-transform duration-500">
                      Open Yearbook
                    </span>
                  </div>
                </div>

                {/* Info Area - Below Image */}
                <div className="pt-4 pb-2 px-1">
                  <h3 className="text-lg font-serif text-stone-100 group-hover:text-gold-500 transition-colors duration-300 mb-1">
                    {student.name}
                  </h3>
                  <div className="border-t border-stone-800/50 pt-2 mt-1">
                    <span className="text-gold-500 text-xs font-semibold tracking-wider uppercase">
                      {student.major}
                    </span>
                    <p className="text-gold-500/60 text-xs font-mono mt-0.5">{student.rollNo}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {filtered.length === 0 && (
          <div className="text-center py-20">
            <p className="text-stone-500 font-handwriting text-2xl">No classmates found</p>
            <p className="text-stone-600 text-sm mt-2">Try a different search or filter</p>
          </div>
        )}
      </div>

      {/* Student Modal */}
      {selectedStudent && (
        <StudentModal
          student={selectedStudent}
          students={filtered}
          onClose={() => setSelectedStudent(null)}
          onNavigate={(s) => setSelectedStudent(s)}
          user={user}
          photo={getPhoto(selectedStudent.rollNo)}
        />
      )}
    </div>
  );
}
