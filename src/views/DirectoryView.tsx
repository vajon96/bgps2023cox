import React, { useEffect, useState } from 'react';
import {
  AlertCircle,
  Award,
  BookOpen,
  CheckCircle,
  Filter,
  GraduationCap,
  MapPin,
  RefreshCw,
  Search,
  Sparkles,
  Users,
  X,
} from 'lucide-react';
import { safeFetchJson } from '../lib/api.ts';

interface DirectoryViewProps {
  onSelectMember: (member: any) => void;
}

export const DirectoryView: React.FC<DirectoryViewProps> = ({ onSelectMember }) => {
  const [members, setMembers] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [selectedGroup, setSelectedGroup] = useState('All');
  const [selectedSection, setSelectedSection] = useState('All');
  const [selectedCity, setSelectedCity] = useState('All');

  const fetchDirectory = async () => {
    setIsLoading(true);
    setFetchError(null);
    try {
      const params = new URLSearchParams();
      if (search.trim()) params.append('search', search.trim());
      if (selectedGroup !== 'All') params.append('group', selectedGroup);
      if (selectedSection !== 'All') params.append('section', selectedSection);
      if (selectedCity !== 'All') params.append('city', selectedCity);

      const qs = params.toString() ? `?${params.toString()}` : '';
      const data = await safeFetchJson<{ members: any[] }>(`/api/members/directory${qs}`);
      setMembers(data?.members || []);
    } catch (err: any) {
      console.warn('Directory notice:', err?.message);
      setFetchError(err?.message || 'Could not load classmate directory');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDirectory();
  }, [selectedGroup, selectedSection, selectedCity]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchDirectory();
  };

  const clearFilters = () => {
    setSearch('');
    setSelectedGroup('All');
    setSelectedSection('All');
    setSelectedCity('All');
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Header */}
      <div className="text-center max-w-3xl mx-auto space-y-3">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 border border-blue-200 text-[#002147] text-xs font-bold uppercase tracking-wider">
          <GraduationCap className="w-4 h-4 text-[#C5A059]" />
          <span>SSC 2023 Batch Directory</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold font-serif text-[#002147]">
          Verified Batchmates Directory
        </h1>
        <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
          Explore and reconnect with all officially verified classmates of Border Guard Public School, Cox's Bazar (SSC 2023). Only verified alumni profiles appear in this directory.
        </p>
      </div>

      {/* Search & Filters Card */}
      <div className="bg-white p-5 sm:p-6 rounded-3xl shadow-sm border border-slate-200 space-y-4">
        {/* Search Bar */}
        <form onSubmit={handleSearchSubmit} className="flex gap-2">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
            <input
              type="text"
              placeholder="Search by classmate name, roll number, profession, or city..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-[#002147]"
            />
          </div>
          <button
            type="submit"
            className="px-6 py-2.5 bg-[#002147] hover:bg-[#001733] text-[#C5A059] font-bold text-xs sm:text-sm rounded-xl transition-colors shrink-0"
          >
            Search
          </button>
        </form>

        {/* Filter Badges & Selects */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-slate-100 text-xs">
          {/* Group Streams Tabs */}
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="font-bold text-slate-500 mr-1 flex items-center gap-1">
              <Filter className="w-3.5 h-3.5 text-[#C5A059]" />
              Group:
            </span>
            {['All', 'Science', 'Humanities', 'Business Studies', 'Other'].map((g) => (
              <button
                key={g}
                onClick={() => setSelectedGroup(g)}
                className={`px-3 py-1 rounded-lg font-semibold transition-all ${
                  selectedGroup === g
                    ? 'bg-[#002147] text-[#C5A059] shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {g}
              </button>
            ))}
          </div>

          {/* Section & City Dropdowns */}
          <div className="flex items-center gap-2">
            <select
              value={selectedSection}
              onChange={(e) => setSelectedSection(e.target.value)}
              className="px-2.5 py-1.5 rounded-lg border border-slate-200 bg-slate-50 text-xs font-medium text-slate-700"
            >
              <option value="All">All Sections</option>
              <option value="A">Section A</option>
              <option value="B">Section B</option>
              <option value="C">Section C</option>
              <option value="Padma">Padma</option>
              <option value="Meghna">Meghna</option>
            </select>

            {(search || selectedGroup !== 'All' || selectedSection !== 'All' || selectedCity !== 'All') && (
              <button
                onClick={clearFilters}
                className="text-xs text-red-600 hover:underline flex items-center gap-1 font-semibold"
              >
                <X className="w-3.5 h-3.5" />
                <span>Reset</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Results Header */}
      <div className="flex items-center justify-between text-xs text-slate-500 px-1">
        <span>
          Showing <strong>{members.length}</strong> verified batch member{members.length !== 1 ? 's' : ''}
        </span>
        <span className="flex items-center gap-1 text-emerald-700 font-semibold">
          <CheckCircle className="w-3.5 h-3.5" />
          <span>Verified Profiles Only</span>
        </span>
      </div>

      {/* Directory Grid */}
      {isLoading ? (
        <div className="py-20 text-center space-y-3">
          <div className="w-10 h-10 border-4 border-[#002147] border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-xs font-semibold text-slate-500">Loading batch directory...</p>
        </div>
      ) : fetchError ? (
        <div className="bg-white rounded-3xl p-10 text-center border border-amber-200 space-y-3 max-w-md mx-auto shadow-xs">
          <AlertCircle className="w-10 h-10 text-amber-600 mx-auto" />
          <h3 className="text-base font-bold text-slate-800">Connection to Batch Directory</h3>
          <p className="text-xs text-slate-500 leading-relaxed">
            {fetchError}. Please verify your connection or click retry below.
          </p>
          <button
            onClick={() => fetchDirectory()}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#002147] hover:bg-[#001733] text-[#C5A059] font-bold text-xs rounded-xl shadow transition-colors"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Retry Loading Directory</span>
          </button>
        </div>
      ) : members.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 text-center border border-slate-200 space-y-3">
          <Users className="w-12 h-12 text-slate-300 mx-auto" />
          <h3 className="text-base font-bold text-slate-700">No verified members found</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Try adjusting your search criteria, or be the next batchmate to register and get verified!
          </p>
          <button
            onClick={clearFilters}
            className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition-colors"
          >
            Clear Filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {members.map((member) => (
            <div
              key={member.id}
              className="bg-white rounded-3xl p-5 shadow-sm border border-slate-200/90 flex flex-col justify-between hover:shadow-lg transition-all group"
            >
              <div>
                <div className="flex items-start gap-4">
                  {member.profilePhotoUrl ? (
                    <img
                      src={member.profilePhotoUrl}
                      alt={member.fullName}
                      className="w-16 h-16 rounded-2xl object-cover border-2 border-[#C5A059] shadow-sm shrink-0"
                    />
                  ) : (
                    <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#002147] to-[#C5A059] text-white font-serif font-bold text-xl flex items-center justify-center shrink-0">
                      {member.fullName?.charAt(0)}
                    </div>
                  )}

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5">
                      <h3 className="font-bold text-sm text-[#002147] truncate group-hover:text-[#C5A059] transition-colors">
                        {member.fullName}
                      </h3>
                      <span title="Verified Member">
                        <CheckCircle className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                      </span>
                    </div>

                    <div className="mt-1 flex flex-wrap items-center gap-1 text-[11px] font-semibold text-slate-600">
                      <span className="bg-slate-100 px-1.5 py-0.5 rounded text-slate-800">
                        Roll: {member.rollNumber}
                      </span>
                      <span className="bg-blue-50 text-blue-800 px-1.5 py-0.5 rounded">
                        {member.groupStream}
                      </span>
                      {member.section && (
                        <span className="bg-amber-50 text-amber-800 px-1.5 py-0.5 rounded">
                          Sec {member.section}
                        </span>
                      )}
                    </div>

                    <p className="text-xs text-slate-700 font-medium truncate mt-1.5">
                      {member.profession || 'BGPS Batchmate'}
                    </p>

                    {member.currentCity && (
                      <p className="text-[11px] text-slate-400 flex items-center gap-1 mt-0.5">
                        <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
                        <span className="truncate">{member.currentCity}</span>
                      </p>
                    )}
                  </div>
                </div>

                {member.bio && (
                  <p className="mt-3 text-xs text-slate-500 line-clamp-2 italic bg-slate-50 p-2 rounded-xl border border-slate-100">
                    "{member.bio}"
                  </p>
                )}
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                <span className="text-[10px] font-mono font-extrabold text-[#002147] bg-slate-100 px-2 py-0.5 rounded">
                  {member.memberId}
                </span>
                <button
                  onClick={() => onSelectMember(member)}
                  className="px-3 py-1.5 bg-[#002147] hover:bg-[#001733] text-[#C5A059] text-xs font-bold rounded-xl transition-all shadow-xs"
                >
                  View Profile
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
