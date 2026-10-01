import React, { useEffect, useState } from 'react';
import {
  AlertCircle,
  Camera,
  CheckCircle,
  Filter,
  Heart,
  Image as ImageIcon,
  Sparkles,
  Upload,
  User,
  X,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext.tsx';
import { MemoryGallery } from '../types/index.ts';
import { safeFetchJson } from '../lib/api.ts';

export const GalleryView: React.FC = () => {
  const { user, token } = useAuth();
  const [memories, setMemories] = useState<MemoryGallery[]>([]);
  const [filteredMemories, setFilteredMemories] = useState<MemoryGallery[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Lightbox Modal
  const [activePhoto, setActivePhoto] = useState<MemoryGallery | null>(null);

  // Upload Modal
  const [isUploadOpen, setIsUploadOpen] = useState<boolean>(false);
  const [uploadTitle, setUploadTitle] = useState<string>('');
  const [uploadCaption, setUploadCaption] = useState<string>('');
  const [uploadCategory, setUploadCategory] = useState<string>('School Days');
  const [uploadImageUrl, setUploadImageUrl] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [uploadMessage, setUploadMessage] = useState<string>('');

  const fetchGallery = async () => {
    setIsLoading(true);
    try {
      const data = await safeFetchJson<MemoryGallery[]>('/api/gallery');
      if (Array.isArray(data)) {
        setMemories(data);
        setFilteredMemories(data);
      }
    } catch (err: any) {
      console.warn('Gallery notice:', err?.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchGallery();
  }, []);

  useEffect(() => {
    if (selectedCategory === 'All') {
      setFilteredMemories(memories);
    } else {
      setFilteredMemories(
        memories.filter((m) => m.category.toLowerCase() === selectedCategory.toLowerCase())
      );
    }
  }, [selectedCategory, memories]);

  const [uploadError, setUploadError] = useState<string>('');

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      setUploadError('Photo file size exceeds 5MB limit.');
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setUploadImageUrl(reader.result as string);
      setUploadError('');
    };
    reader.readAsDataURL(file);
  };

  const handleUploadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setUploadError('');
    if (!uploadTitle.trim() || !uploadImageUrl.trim()) {
      setUploadError('Title and Image are required.');
      return;
    }

    setIsSubmitting(true);
    setUploadMessage('');

    try {
      const data = await safeFetchJson<{ message?: string }>('/api/gallery/upload', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          title: uploadTitle.trim(),
          caption: uploadCaption.trim(),
          category: uploadCategory,
          imageUrl: uploadImageUrl,
        }),
      });

      setIsSubmitting(false);
      setUploadMessage(data.message || 'Photo submitted successfully!');
      setTimeout(() => {
        setIsUploadOpen(false);
        setUploadTitle('');
        setUploadCaption('');
        setUploadImageUrl('');
        setUploadMessage('');
        setUploadError('');
        fetchGallery();
      }, 1500);
    } catch (err: any) {
      setIsSubmitting(false);
      setUploadError(err.message || 'Upload failed');
    }
  };

  const categories = [
    'All',
    'School Days',
    'Classroom & Teachers',
    'Sports & Events',
    'Campus Memories',
  ];

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-4 border-b border-slate-200">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 border border-amber-200 text-amber-900 text-xs font-bold uppercase tracking-wider">
            <Camera className="w-4 h-4 text-[#C5A059]" />
            <span>Cherished Nostalgia</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold font-serif text-[#002147]">
            Memories & School Photos
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 max-w-xl leading-relaxed">
            Relive our irreplaceable days at Border Guard Public School, Cox's Bazar. From class 10 farewell to sports competitions and casual moments.
          </p>
        </div>

        {user ? (
          <button
            onClick={() => setIsUploadOpen(true)}
            className="px-6 py-3 bg-[#002147] hover:bg-[#001733] text-[#C5A059] font-bold text-xs sm:text-sm rounded-2xl shadow-md transition-all flex items-center justify-center gap-2 shrink-0"
          >
            <Upload className="w-4 h-4" />
            <span>Upload a School Memory</span>
          </button>
        ) : (
          <div className="text-xs text-slate-500 bg-slate-100 px-4 py-2.5 rounded-xl border border-slate-200">
            Sign in to contribute your school photos to the alumni archive.
          </div>
        )}
      </div>

      {/* Category Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
        <span className="font-bold text-slate-400 mr-1 flex items-center gap-1">
          <Filter className="w-3.5 h-3.5 text-[#C5A059]" />
          Category:
        </span>
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`px-3.5 py-1.5 rounded-xl font-semibold transition-all whitespace-nowrap ${
              selectedCategory === cat
                ? 'bg-[#002147] text-[#C5A059] shadow-xs'
                : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Gallery Grid */}
      {isLoading ? (
        <div className="py-20 text-center space-y-3">
          <div className="w-10 h-10 border-4 border-[#002147] border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-xs font-semibold text-slate-500">Loading memories archive...</p>
        </div>
      ) : filteredMemories.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 text-center border border-slate-200 space-y-3">
          <ImageIcon className="w-12 h-12 text-slate-300 mx-auto" />
          <h3 className="text-base font-bold text-slate-700">No memories in this category yet</h3>
          <p className="text-xs text-slate-500">Be the first batchmate to share a nostalgic photo!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {filteredMemories.map((photo) => (
            <div
              key={photo.id}
              onClick={() => setActivePhoto(photo)}
              className="bg-white rounded-3xl overflow-hidden shadow-sm border border-slate-200 hover:shadow-xl transition-all cursor-pointer group flex flex-col justify-between"
            >
              <div className="relative h-60 overflow-hidden bg-slate-100">
                <img
                  src={photo.imageUrl}
                  alt={photo.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute top-3 left-3">
                  <span className="bg-[#002147]/80 backdrop-blur-sm text-[#C5A059] text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                    {photo.category}
                  </span>
                </div>
              </div>

              <div className="p-4 space-y-2">
                <h4 className="font-bold text-sm text-[#002147] line-clamp-1 group-hover:text-[#C5A059] transition-colors">
                  {photo.title}
                </h4>
                {photo.caption && (
                  <p className="text-xs text-slate-600 line-clamp-2 italic leading-relaxed">
                    "{photo.caption}"
                  </p>
                )}
                <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
                  <span className="flex items-center gap-1">
                    <User className="w-3 h-3 text-[#C5A059]" />
                    <span>{photo.uploadedByName || 'Batchmate'}</span>
                  </span>
                  <span>{new Date(photo.createdAt).toLocaleDateString()}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Lightbox Modal */}
      {activePhoto && (
        <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4">
          <div className="relative max-w-4xl w-full bg-slate-900 rounded-3xl overflow-hidden shadow-2xl border border-slate-800 flex flex-col">
            <button
              onClick={() => setActivePhoto(null)}
              className="absolute top-4 right-4 z-10 p-2 rounded-full bg-black/60 text-white hover:bg-black/90 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="max-h-[70vh] flex items-center justify-center bg-black/60 p-2">
              <img
                src={activePhoto.imageUrl}
                alt={activePhoto.title}
                className="max-h-[66vh] w-auto max-w-full object-contain rounded-lg"
              />
            </div>

            <div className="p-6 bg-slate-900 text-white space-y-2 border-t border-slate-800">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-[#C5A059] uppercase tracking-wider">
                  {activePhoto.category}
                </span>
                <span className="text-xs text-slate-400">
                  Shared by {activePhoto.uploadedByName || 'Alumnus'} • {new Date(activePhoto.createdAt).toLocaleDateString()}
                </span>
              </div>
              <h3 className="text-xl font-bold font-serif">{activePhoto.title}</h3>
              {activePhoto.caption && (
                <p className="text-sm text-slate-300 italic">{activePhoto.caption}</p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Upload Memory Modal */}
      {isUploadOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/75 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4">
          <div className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl border border-slate-100 overflow-hidden">
            <div className="bg-[#002147] px-6 py-4 text-white flex items-center justify-between border-b border-[#C5A059]/30">
              <div className="flex items-center gap-2">
                <Camera className="w-5 h-5 text-[#C5A059]" />
                <h3 className="font-bold text-base font-serif">Share a School Memory</h3>
              </div>
              <button
                onClick={() => setIsUploadOpen(false)}
                className="p-1.5 rounded-full text-slate-300 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleUploadSubmit} className="p-6 space-y-4">
              {uploadError && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0 text-red-500" />
                  <span>{uploadError}</span>
                </div>
              )}

              {uploadMessage ? (
                <div className="p-6 text-center space-y-2">
                  <CheckCircle className="w-10 h-10 text-emerald-600 mx-auto" />
                  <p className="text-sm font-bold text-slate-800">{uploadMessage}</p>
                </div>
              ) : (
                <>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Photo Title *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Class 10 Farewell Picnic 2023"
                      value={uploadTitle}
                      onChange={(e) => setUploadTitle(e.target.value)}
                      className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-[#002147]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Category *
                    </label>
                    <select
                      value={uploadCategory}
                      onChange={(e) => setUploadCategory(e.target.value)}
                      className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-[#002147]"
                    >
                      <option value="School Days">School Days</option>
                      <option value="Classroom & Teachers">Classroom & Teachers</option>
                      <option value="Sports & Events">Sports & Events</option>
                      <option value="Campus Memories">Campus Memories</option>
                      <option value="Reunion 2026">Reunion 2026</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Caption / Short Story (Optional)
                    </label>
                    <textarea
                      rows={2}
                      placeholder="Who was in this photo? What was happening?"
                      value={uploadCaption}
                      onChange={(e) => setUploadCaption(e.target.value)}
                      className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-xs focus:outline-none focus:ring-2 focus:ring-[#002147]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Photo (File or URL) *
                    </label>
                    {uploadImageUrl ? (
                      <div className="relative border rounded-xl overflow-hidden max-h-36 flex items-center justify-center bg-slate-50">
                        <img
                          src={uploadImageUrl}
                          alt="Upload Preview"
                          className="max-h-32 object-contain"
                        />
                        <button
                          type="button"
                          onClick={() => setUploadImageUrl('')}
                          className="absolute top-2 right-2 p-1 bg-red-600 text-white rounded-full"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        <label className="w-full p-4 border-2 border-dashed border-slate-300 rounded-xl flex flex-col items-center justify-center cursor-pointer hover:border-[#002147] transition-colors">
                          <Upload className="w-6 h-6 text-slate-400 mb-1" />
                          <span className="text-xs font-bold text-[#002147]">
                            Select Photo from Device
                          </span>
                          <span className="text-[10px] text-slate-400">JPG, PNG, WebP (Max 5MB)</span>
                          <input
                            type="file"
                            accept="image/*"
                            onChange={handleFileUpload}
                            className="hidden"
                          />
                        </label>
                        <input
                          type="url"
                          placeholder="Or paste an image web URL"
                          value={uploadImageUrl}
                          onChange={(e) => setUploadImageUrl(e.target.value)}
                          className="w-full px-3 py-1.5 rounded-lg border border-slate-300 text-xs"
                        />
                      </div>
                    )}
                  </div>

                  <div className="p-3 bg-blue-50 border border-blue-200 rounded-xl text-[11px] text-blue-900 leading-relaxed">
                    Note: Photos are reviewed by batch moderators before being published publicly to maintain authentic batch standards.
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmitting || !uploadImageUrl || !uploadTitle}
                    className="w-full py-2.5 px-4 bg-[#002147] hover:bg-[#001733] text-[#C5A059] font-bold text-xs sm:text-sm rounded-xl shadow transition-all disabled:opacity-50"
                  >
                    {isSubmitting ? 'Uploading...' : 'Submit Memory for Moderation'}
                  </button>
                </>
              )}
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
