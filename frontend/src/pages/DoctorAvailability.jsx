import React, { useState } from 'react';
import api from '../services/api';
import Layout from '../components/Layout';
import { Clock, Save, CheckCircle, AlertCircle } from 'lucide-react';

const DAYS_OF_WEEK = [
  { id: 1, label: 'Monday' },
  { id: 2, label: 'Tuesday' },
  { id: 3, label: 'Wednesday' },
  { id: 4, label: 'Thursday' },
  { id: 5, label: 'Friday' },
  { id: 6, label: 'Saturday' },
  { id: 0, label: 'Sunday' }
];

export default function DoctorAvailability() {
  const [schedule, setSchedule] = useState([
    { dayOfWeek: 1, startTime: '09:00', endTime: '17:00', slotDuration: 15 },
    { dayOfWeek: 2, startTime: '09:00', endTime: '17:00', slotDuration: 15 },
    { dayOfWeek: 3, startTime: '09:00', endTime: '17:00', slotDuration: 15 },
    { dayOfWeek: 4, startTime: '09:00', endTime: '17:00', slotDuration: 15 },
    { dayOfWeek: 5, startTime: '09:00', endTime: '17:00', slotDuration: 15 }
  ]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const handleUpdate = (dayOfWeek, field, value) => {
    setSchedule(prev => prev.map(day => 
      day.dayOfWeek === dayOfWeek ? { ...day, [field]: value } : day
    ));
  };

  const handleToggleDay = (dayOfWeek) => {
    const exists = schedule.find(d => d.dayOfWeek === dayOfWeek);
    if (exists) {
      setSchedule(prev => prev.filter(d => d.dayOfWeek !== dayOfWeek));
    } else {
      setSchedule(prev => [...prev, { dayOfWeek, startTime: '09:00', endTime: '17:00', slotDuration: 15 }]);
    }
  };

  const handleSave = async () => {
    setLoading(true);
    setMessage('');
    try {
      await api.post('/doctors/availability', { availability: schedule });
      setMessage({ type: 'success', text: 'Availability schedule updated successfully!' });
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to update availability.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Manage Availability</h1>
          <p className="text-slate-500 mt-1">Set your working days, hours, and consultation duration.</p>
        </div>
        <button
          onClick={handleSave}
          disabled={loading}
          className="bg-primary-600 hover:bg-primary-700 text-white px-5 py-2.5 rounded-xl font-medium transition-colors shadow-sm flex items-center justify-center gap-2 disabled:opacity-70 w-full md:w-auto"
        >
          {loading ? (
            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
          ) : (
            <Save className="w-5 h-5" />
          )}
          Save Schedule
        </button>
      </div>

      {message && (
        <div className={`p-4 rounded-xl mb-6 flex items-center gap-3 ${
          message.type === 'success' ? 'bg-green-50 text-green-800 border border-green-200' : 'bg-red-50 text-red-800 border border-red-200'
        }`}>
          {message.type === 'success' ? <CheckCircle className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
          {message.text}
        </div>
      )}

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="divide-y divide-slate-100">
          {DAYS_OF_WEEK.map(day => {
            const dayConfig = schedule.find(d => d.dayOfWeek === day.id);
            const isEnabled = !!dayConfig;

            return (
              <div key={day.id} className="p-6 flex flex-col md:flex-row md:items-center justify-between gap-6 hover:bg-slate-50 transition-colors">
                <div className="flex items-center gap-4 min-w-[200px]">
                  <button
                    onClick={() => handleToggleDay(day.id)}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 ${
                      isEnabled ? 'bg-primary-600' : 'bg-slate-200'
                    }`}
                  >
                    <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      isEnabled ? 'translate-x-6' : 'translate-x-1'
                    }`} />
                  </button>
                  <span className={`font-medium ${isEnabled ? 'text-slate-900' : 'text-slate-400'}`}>
                    {day.label}
                  </span>
                </div>

                {isEnabled ? (
                  <div className="flex flex-wrap items-center gap-4 flex-1">
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-slate-400" />
                      <input
                        type="time"
                        value={dayConfig.startTime}
                        onChange={(e) => handleUpdate(day.id, 'startTime', e.target.value)}
                        className="p-2 border border-slate-200 rounded-lg text-sm outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500"
                      />
                      <span className="text-slate-500">to</span>
                      <input
                        type="time"
                        value={dayConfig.endTime}
                        onChange={(e) => handleUpdate(day.id, 'endTime', e.target.value)}
                        className="p-2 border border-slate-200 rounded-lg text-sm outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500"
                      />
                    </div>
                    
                    <div className="flex items-center gap-2 ml-auto">
                      <label className="text-sm text-slate-500">Slot Duration (mins):</label>
                      <select
                        value={dayConfig.slotDuration}
                        onChange={(e) => handleUpdate(day.id, 'slotDuration', parseInt(e.target.value))}
                        className="p-2 border border-slate-200 rounded-lg text-sm outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500 bg-white"
                      >
                        <option value={10}>10</option>
                        <option value={15}>15</option>
                        <option value={20}>20</option>
                        <option value={30}>30</option>
                        <option value={45}>45</option>
                        <option value={60}>60</option>
                      </select>
                    </div>
                  </div>
                ) : (
                  <div className="flex-1 text-sm text-slate-400 italic">Not available on this day.</div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </Layout>
  );
}
