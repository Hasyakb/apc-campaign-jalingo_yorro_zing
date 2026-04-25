import React, { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { 
  Users, 
  Search, 
  Filter, 
  CheckCircle2, 
  XCircle,
  MoreVertical,
  Clock
} from 'lucide-react';
import api from '../lib/api';
import { useAuth } from '../context/AuthContext';

export const MembersList: React.FC = () => {
  const [members, setMembers] = useState<any[]>([]);
  const [filteredMembers, setFilteredMembers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const { isAdmin } = useAuth();

  const fetchMembers = async () => {
    try {
      const res = await api.get('/api/users');
      setMembers(res.data);
      setFilteredMembers(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchMembers(); }, []);

  useEffect(() => {
    let result = members;
    if (searchTerm) {
      result = result.filter(m => 
        m.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        m.phoneNumber.includes(searchTerm)
      );
    }
    if (statusFilter !== 'all') {
      const approved = statusFilter === 'approved';
      result = result.filter(m => m.isApproved === approved);
    }
    setFilteredMembers(result);
  }, [searchTerm, statusFilter, members]);

  const handleToggleApproval = async (id: string, currentStatus: boolean) => {
    if (!isAdmin) return;
    try {
      await api.patch(`/api/users/${id}/approve`, { isApproved: !currentStatus });
      setMembers(members.map(m => m.id === id ? { ...m, isApproved: !currentStatus } : m));
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="p-8 space-y-10 max-w-7xl mx-auto font-sans">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-1">
          <h1 className="text-4xl font-extrabold tracking-tighter text-apc-blue uppercase">Member Directory</h1>
          <p className="text-gray-500 font-medium tracking-tight">Verified Grassroots Database for Jalingo/Yorro/Zing</p>
        </div>
        
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-apc-blue transition-colors" />
            <input
              type="text"
              placeholder="Search by name or phone..."
              className="pl-12 pr-6 py-4 bg-white border border-gray-100 rounded-2xl shadow-sm focus:ring-2 focus:ring-apc-blue focus:border-apc-blue outline-none w-full md:w-80 font-bold text-apc-blue"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
            />
          </div>
          <button className="p-4 bg-white border border-gray-100 rounded-2xl shadow-sm hover:border-apc-blue transition-all">
            <Filter className="w-6 h-6 text-apc-blue" />
          </button>
        </div>
      </header>

      {/* Filter Chips */}
      <div className="flex flex-wrap gap-3">
        {(['all', 'pending', 'approved'] as const).map(f => (
          <button
            key={f}
            onClick={() => setStatusFilter(f)}
            className={`px-6 py-3 rounded-2xl font-black uppercase text-xs tracking-widest transition-all ${
              statusFilter === f
                ? 'apc-gradient-blue text-white shadow-lg shadow-apc-blue/20'
                : 'bg-white border border-gray-100 text-gray-400 hover:text-apc-blue'
            }`}
          >
            {f === 'all' ? 'All Personnel' : `${f} Members`}
          </button>
        ))}
      </div>

      {/* Table-like List */}
      <div className="bg-white rounded-[40px] border border-gray-100 shadow-xl shadow-black/[0.02] overflow-hidden overflow-x-auto overflow-y-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-bg-secondary/50">
              <th className="px-8 py-6 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Contact Identity</th>
              <th className="px-8 py-6 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Demographics</th>
              <th className="px-8 py-6 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Location Context</th>
              <th className="px-8 py-6 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Role & Rank</th>
              <th className="px-8 py-6 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] text-center">Status</th>
              {isAdmin && <th className="px-8 py-6 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] text-right">Strategic Actions</th>}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {filteredMembers.map((member, i) => (
              <motion.tr 
                key={member.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.05 }}
                className="hover:bg-bg-secondary/30 transition-colors group"
              >
                <td className="px-8 py-6">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 rounded-2xl apc-gradient-green flex items-center justify-center text-white font-black shadow-lg">
                      {member.fullName.charAt(0)}
                    </div>
                    <div>
                      <p className="font-bold text-[#1E293B] group-hover:text-apc-blue transition-colors text-sm">{member.fullName}</p>
                      <p className="text-[10px] font-bold text-gray-400 tracking-[0.1em]">{member.phoneNumber}</p>
                      {member.vin && <p className="text-[9px] font-black text-apc-blue/60 uppercase tracking-widest mt-1">VIN: {member.vin}</p>}
                    </div>
                  </div>
                </td>
                <td className="px-8 py-6">
                  <div className="space-y-1">
                    <p className="text-sm font-bold text-[#1E293B]">{member.gender || 'N/A'}</p>
                    <p className="text-[10px] font-bold text-gray-400">{member.dob || 'DOB: N/A'}</p>
                  </div>
                </td>
                <td className="px-8 py-6">
                  <div className="space-y-1">
                    <p className="text-sm font-bold text-apc-blue">{member.ward}</p>
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{member.lga}</p>
                  </div>
                </td>
                <td className="px-8 py-6">
                  <span className={`text-[10px] font-black uppercase px-3 py-1.5 rounded-xl ${
                    member.role === 'Delegate' ? 'bg-apc-blue/10 text-apc-blue border border-apc-blue/20' : 'bg-gray-100 text-gray-500'
                  }`}>
                    {member.role}
                  </span>
                </td>
                <td className="px-8 py-6 text-center">
                  <div className="flex items-center justify-center space-x-2">
                     <div className={`w-2 h-2 rounded-full ${member.isApproved ? 'bg-apc-green animate-pulse' : 'bg-apc-red'}`} />
                     <span className={`text-[10px] font-black uppercase tracking-tight ${member.isApproved ? 'text-apc-green' : 'text-apc-red'}`}>
                       {member.isApproved ? 'Verified' : 'Unverified'}
                     </span>
                  </div>
                </td>
                {isAdmin && (
                  <td className="px-8 py-6 text-right">
                    <div className="flex items-center justify-end space-x-2">
                      <button
                        onClick={() => handleToggleApproval(member.id, member.isApproved)}
                        className={`p-3 rounded-xl shadow-lg transition-all hover:scale-[1.1] ${
                          member.isApproved 
                            ? 'bg-apc-red text-white shadow-apc-red/20' 
                            : 'bg-apc-green text-white shadow-apc-green/20'
                        }`}
                        title={member.isApproved ? "Revoke Verification" : "Verify Member"}
                      >
                        {member.isApproved ? <XCircle className="w-5 h-5" /> : <CheckCircle2 className="w-5 h-5" />}
                      </button>
                      <button className="p-3 bg-bg-secondary text-gray-400 rounded-xl hover:text-apc-blue transition-all">
                        <MoreVertical className="w-5 h-5" />
                      </button>
                    </div>
                  </td>
                )}
              </motion.tr>
            ))}
          </tbody>
        </table>
        {filteredMembers.length === 0 && !loading && (
          <div className="p-20 text-center space-y-4">
            <Users className="w-16 h-16 mx-auto text-gray-200" />
            <div className="space-y-1">
              <p className="text-xl font-black text-apc-blue uppercase tracking-tighter">No Operatives Found</p>
              <p className="text-gray-400 font-medium">Try adjusting your search or filter parameters.</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

const ClockIcon = ({ className }: { className?: string }) => <svg className={className} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>;
