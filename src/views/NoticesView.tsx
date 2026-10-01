import React, { useEffect, useState } from 'react';
import { AlertCircle, Calendar, Filter, Megaphone, Search } from 'lucide-react';
import { Notice } from '../types/index.ts';
import { safeFetchJson } from '../lib/api.ts';

export const NoticesView: React.FC = () => {
  const [notices, setNotices] = useState<Notice[]>([]);
  const [filteredNotices, setFilteredNotices] = useState<Notice[]>([]);
  const [selectedPriority, setSelectedPriority] = useState<string>('All');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    safeFetchJson<Notice[]>('/api/notices')
      .then((data) => {
        if (Array.isArray(data)) {
          setNotices(data);
          setFilteredNotices(data);
        }
      })
      .catch((err) => console.warn('Notices notice:', err?.message))
      .finally(() => setIsLoading(false));
  }, []);

  useEffect(() => {
    let result = notices;
    if (selectedPriority !== 'All') {
      result = result.filter((n) => n.priority.toLowerCase() === selectedPriority.toLowerCase());
    }
    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase();
      result = result.filter(
        (n) => n.title.toLowerCase().includes(q) || n.description.toLowerCase().includes(q)
      );
    }
    setFilteredNotices(result);
  }, [selectedPriority, searchTerm, notices]);

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Header */}
      <div className="text-center max-w-2xl mx-auto space-y-3">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 border border-blue-200 text-blue-900 text-xs font-bold uppercase tracking-wider">
          <Megaphone className="w-4 h-4 text-[#C5A059]" />
          <span>Official Batch Announcements</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold font-serif text-[#002147]">
          Notices & Circulars
        </h1>
        <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
          Stay updated with official statements, reunion schedules, souvenir announcements, and instructions from the BGPS SSC 2023 Committee.
        </p>
      </div>

      {/* Filter and Search */}
      <div className="bg-white p-4 sm:p-5 rounded-2xl shadow-sm border border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-4">
        {/* Search */}
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
          <input
            type="text"
            placeholder="Search notice content or keywords..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#002147]"
          />
        </div>

        {/* Priority Tabs */}
        <div className="flex items-center gap-1.5 w-full sm:w-auto overflow-x-auto text-xs">
          <span className="font-bold text-slate-400 mr-1 flex items-center gap-1">
            <Filter className="w-3 h-3 text-[#C5A059]" />
            Priority:
          </span>
          {['All', 'Urgent', 'Important', 'Normal'].map((p) => (
            <button
              key={p}
              onClick={() => setSelectedPriority(p)}
              className={`px-3 py-1.5 rounded-lg font-semibold transition-all ${
                selectedPriority === p
                  ? 'bg-[#002147] text-[#C5A059] shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {p}
            </button>
          ))}
        </div>
      </div>

      {/* Notices List */}
      {isLoading ? (
        <div className="py-20 text-center space-y-3">
          <div className="w-10 h-10 border-4 border-[#002147] border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-xs font-semibold text-slate-500">Loading notices...</p>
        </div>
      ) : filteredNotices.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 text-center border border-slate-200 space-y-3">
          <Megaphone className="w-12 h-12 text-slate-300 mx-auto" />
          <h3 className="text-base font-bold text-slate-700">No notices found</h3>
          <p className="text-xs text-slate-500">No circulars match your selected search or priority.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredNotices.map((n) => (
            <div
              key={n.id}
              className={`bg-white rounded-2xl p-6 shadow-sm border transition-all ${
                n.priority === 'urgent'
                  ? 'border-red-300 bg-red-50/10'
                  : n.priority === 'important'
                  ? 'border-amber-300 bg-amber-50/10'
                  : 'border-slate-200'
              }`}
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <span
                    className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider ${
                      n.priority === 'urgent'
                        ? 'bg-red-100 text-red-800 border border-red-300'
                        : n.priority === 'important'
                        ? 'bg-amber-100 text-amber-900 border border-amber-300'
                        : 'bg-blue-100 text-blue-800 border border-blue-200'
                    }`}
                  >
                    {n.priority} Notice
                  </span>
                  <span className="text-[11px] text-slate-500 font-medium">
                    Audience: <strong>{n.targetAudience?.toUpperCase() || 'ALL MEMBERS'}</strong>
                  </span>
                </div>

                <div className="flex items-center gap-1.5 text-xs text-slate-400">
                  <Calendar className="w-3.5 h-3.5 text-[#C5A059]" />
                  <span>{new Date(n.createdAt).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}</span>
                </div>
              </div>

              <div className="mt-4 space-y-2">
                <h3 className="text-xl font-bold text-[#002147] font-serif">{n.title}</h3>
                <p className="text-xs sm:text-sm text-slate-700 whitespace-pre-line leading-relaxed">
                  {n.description}
                </p>
              </div>

              {n.attachmentUrl && (
                <div className="mt-4 pt-3 border-t border-slate-100">
                  <a
                    href={n.attachmentUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 text-xs font-bold text-[#002147] hover:underline"
                  >
                    📎 Download Attached Notice Circular
                  </a>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
