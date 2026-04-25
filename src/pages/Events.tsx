import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { 
  Calendar as CalendarIcon, 
  MapPin, 
  Clock, 
  Plus, 
  PlusCircle,
  Bell,
  Trash2,
  ChevronRight
} from 'lucide-react';
import api from '../lib/api';
import { useAuth } from '../context/AuthContext';
import { WARDS } from '../constants';

export const Events: React.FC = () => {
  const { isAdmin } = useAuth();
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newEvent, setNewEvent] = useState({
    title: '',
    description: '',
    date: '',
    location: '',
    targetWard: ''
  });

  const fetchEvents = async () => {
    try {
      const res = await api.get('/api/events');
      setEvents(res.data.sort((a: any, b: any) => new Date(a.date).getTime() - new Date(b.date).getTime()));
    } catch (err) { console.error(err); } finally { setLoading(false); }
  };

  useEffect(() => { fetchEvents(); }, []);

  const handleAddEvent = async () => {
    if (!isAdmin) return;
    try {
      await api.post('/api/events', newEvent);
      setShowAddModal(false);
      setNewEvent({ title: '', description: '', date: '', location: '', targetWard: '' });
      fetchEvents();
    } catch (err) { console.error(err); }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Delete this event?')) return;
    try {
      await api.delete(`/api/events/${id}`);
      fetchEvents();
    } catch (err) { console.error(err); }
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Campaign Schedule</h2>
          <p className="text-[#86868B] text-lg">Upcoming meetings, rallies, and town halls.</p>
        </div>
        {isAdmin && (
          <button 
            onClick={() => setShowAddModal(true)}
            className="hidden md:flex items-center space-x-2 px-5 py-2.5 bg-[#007AFF] text-white rounded-2xl font-semibold hover:bg-[#0071E3] transition-all shadow-lg shadow-[#007AFF]/25"
          >
            <Plus className="w-5 h-5" />
            <span>Create Event</span>
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {events.map((event) => (
          <motion.div 
            whileHover={{ y: -5 }}
            key={event.id} 
            className="bg-white rounded-[32px] border border-[#D2D2D7] overflow-hidden shadow-sm flex flex-col"
          >
            <div className="h-2 bg-[#007AFF]" />
            <div className="p-8 flex-1 space-y-6">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold uppercase tracking-[0.1em] text-[#007AFF] bg-[#F5F9FF] px-2 py-1 rounded">
                    {event.targetWard || 'All Constituency'}
                  </span>
                  {isAdmin && (
                    <button onClick={() => handleDelete(event.id)} className="text-[#86868B] hover:text-red-500">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
                <h3 className="text-xl font-bold text-[#1D1D1F] line-clamp-1">{event.title}</h3>
                <p className="text-sm text-[#86868B] line-clamp-2">{event.description}</p>
              </div>

              <div className="space-y-3 pt-4 border-t border-[#F5F5F7]">
                <div className="flex items-center space-x-3 text-sm text-[#1D1D1F]">
                  <CalendarIcon className="w-4 h-4 text-[#86868B]" />
                  <span>{new Date(event.date).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })}</span>
                </div>
                <div className="flex items-center space-x-3 text-sm text-[#1D1D1F]">
                  <Clock className="w-4 h-4 text-[#86868B]" />
                  <span>{new Date(event.date).toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })}</span>
                </div>
                <div className="flex items-center space-x-3 text-sm text-[#1D1D1F]">
                  <MapPin className="w-4 h-4 text-[#86868B]" />
                  <span className="truncate">{event.location}</span>
                </div>
              </div>
            </div>
            <button className="w-full py-4 text-sm font-semibold text-[#1D1D1F] bg-[#F5F5F7] hover:bg-[#E8E8ED] transition-colors border-t border-[#D2D2D7] flex items-center justify-center space-x-2">
              <span>View Attendance</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </motion.div>
        ))}

        {events.length === 0 && !loading && (
          <div className="col-span-full py-20 text-center text-[#86868B] space-y-4">
            <Bell className="w-12 h-12 mx-auto opacity-20" />
            <p>No events scheduled currently.</p>
            {isAdmin && <button onClick={() => setShowAddModal(true)} className="text-[#007AFF] font-medium underline">Add the first campaign event</button>}
          </div>
        )}
      </div>

      {isAdmin && showAddModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
          <motion.div 
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white w-full max-w-lg rounded-[40px] p-8 shadow-2xl space-y-6"
          >
            <div className="flex items-center justify-between">
              <h3 className="text-2xl font-bold">New Campaign Event</h3>
              <button onClick={() => setShowAddModal(false)}><PlusCircle className="rotate-45 text-[#86868B]" /></button>
            </div>

            <div className="space-y-4">
              <input 
                type="text" 
                placeholder="Event Title" 
                className="w-full px-4 py-3 bg-[#F5F5F7] border-none rounded-xl focus:ring-2 focus:ring-[#007AFF] outline-none transition-all"
                value={newEvent.title}
                onChange={e => setNewEvent({...newEvent, title: e.target.value})}
              />
              <textarea 
                placeholder="Description" 
                className="w-full h-32 px-4 py-3 bg-[#F5F5F7] border-none rounded-xl focus:ring-2 focus:ring-[#007AFF] outline-none resize-none"
                value={newEvent.description}
                onChange={e => setNewEvent({...newEvent, description: e.target.value})}
              />
              <div className="grid grid-cols-2 gap-4">
                <input 
                  type="datetime-local" 
                  className="px-4 py-3 bg-[#F5F5F7] border-none rounded-xl focus:ring-2 focus:ring-[#007AFF] outline-none"
                  value={newEvent.date}
                  onChange={e => setNewEvent({...newEvent, date: e.target.value})}
                />
                <select 
                  className="px-4 py-3 bg-[#F5F5F7] border-none rounded-xl focus:ring-2 focus:ring-[#007AFF] outline-none"
                  value={newEvent.targetWard}
                  onChange={e => setNewEvent({...newEvent, targetWard: e.target.value})}
                >
                  <option value="">All Wards</option>
                  {Object.entries(WARDS).map(([lga, ws]) => ws.map(w => <option key={w} value={w}>{w} ({lga})</option>))}
                </select>
              </div>
              <input 
                type="text" 
                placeholder="Location / Venue" 
                className="w-full px-4 py-3 bg-[#F5F5F7] border-none rounded-xl focus:ring-2 focus:ring-[#007AFF] outline-none transition-all"
                value={newEvent.location}
                onChange={e => setNewEvent({...newEvent, location: e.target.value})}
              />
              
              <button 
                onClick={handleAddEvent}
                className="w-full py-4 bg-[#007AFF] text-white rounded-2xl font-semibold hover:bg-[#0071E3] transition-all shadow-lg"
              >
                Publish Event
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
};
