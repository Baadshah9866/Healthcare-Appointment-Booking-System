import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import Layout from '../components/Layout';
import { Search, User, Calendar as CalendarIcon, Clock, ArrowRight, CheckCircle, GraduationCap, Briefcase } from 'lucide-react';

export default function BookAppointment() {
  const [doctors, setDoctors] = useState([]);
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [selectedDate, setSelectedDate] = useState('');
  const [slots, setSlots] = useState([]);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [loading, setLoading] = useState(false);
  const [booking, setBooking] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchDoctors = async () => {
      try {
        const res = await api.get('/doctors');
        setDoctors(res.data);
      } catch (error) {
        console.error('Failed to fetch doctors', error);
      }
    };
    fetchDoctors();
    
    // Set default date to tomorrow
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    setSelectedDate(tomorrow.toISOString().split('T')[0]);
  }, []);

  useEffect(() => {
    const fetchSlots = async () => {
      if (!selectedDoctor || !selectedDate) return;
      
      setLoading(true);
      try {
        const res = await api.get(`/doctors/${selectedDoctor.user_id}/slots?date=${selectedDate}`);
        setSlots(res.data.slots);
      } catch (error) {
        console.error('Failed to fetch slots', error);
        setSlots([]);
      } finally {
        setLoading(false);
      }
    };
    
    fetchSlots();
    setSelectedSlot(null);
  }, [selectedDoctor, selectedDate]);

  const handleBook = async () => {
    if (!selectedDoctor || !selectedDate || !selectedSlot) return;
    
    setBooking(true);
    try {
      await api.post('/appointments/book', {
        doctorId: selectedDoctor.user_id,
        date: selectedDate,
        time: selectedSlot
      });
      alert('Appointment booked successfully!');
      navigate('/patient');
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to book appointment');
    } finally {
      setBooking(false);
    }
  };

  return (
    <Layout>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900">Book Appointment</h1>
        <p className="text-slate-500 mt-1">Select a doctor and choose an available time slot</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Step 1: Select Doctor */}
        <div className="lg:col-span-1 space-y-4">
          <h2 className="text-lg font-semibold text-slate-800 flex items-center gap-2">
            <span className="bg-primary-100 text-primary-700 w-6 h-6 rounded-full flex items-center justify-center text-sm">1</span>
            Select Doctor
          </h2>
          
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="p-4 border-b border-slate-200 bg-slate-50">
              <div className="relative">
                <Search className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input 
                  type="text" 
                  placeholder="Search doctors..." 
                  className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition-all"
                />
              </div>
            </div>
            
            <div className="divide-y divide-slate-100 max-h-[500px] overflow-y-auto">
              {doctors.map(doctor => (
                <button
                  key={doctor.id}
                  onClick={() => setSelectedDoctor(doctor)}
                  className={`w-full text-left p-4 flex items-start gap-3 transition-colors ${
                    selectedDoctor?.id === doctor.id 
                      ? 'bg-primary-50 border-l-4 border-l-primary-500' 
                      : 'hover:bg-slate-50 border-l-4 border-l-transparent'
                  }`}
                >
                  <div className={`p-2 rounded-full ${selectedDoctor?.id === doctor.id ? 'bg-primary-100 text-primary-600' : 'bg-slate-100 text-slate-500'}`}>
                    <User className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-slate-900">Dr. {doctor.name}</h3>
                    <p className="text-sm font-medium text-primary-600 mb-0.5">{doctor.specialization}</p>
                    <div className="flex items-center gap-3 text-xs text-slate-500 mt-1">
                      {doctor.qualification && (
                        <span className="flex items-center gap-1 bg-slate-100 px-2 py-0.5 rounded-md border border-slate-200">
                          <GraduationCap className="w-3.5 h-3.5" />
                          {doctor.qualification}
                        </span>
                      )}
                      {doctor.experience > 0 && (
                        <span className="flex items-center gap-1 bg-slate-100 px-2 py-0.5 rounded-md border border-slate-200">
                          <Briefcase className="w-3.5 h-3.5" />
                          {doctor.experience} Yrs
                        </span>
                      )}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Step 2 & 3: Date & Time */}
        <div className="lg:col-span-2 space-y-8">
          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-slate-800 flex items-center gap-2">
              <span className="bg-primary-100 text-primary-700 w-6 h-6 rounded-full flex items-center justify-center text-sm">2</span>
              Select Date & Time
            </h2>
            
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
              {!selectedDoctor ? (
                <div className="text-center py-12 text-slate-400">
                  <User className="w-12 h-12 mx-auto mb-3 opacity-50" />
                  <p>Please select a doctor first</p>
                </div>
              ) : (
                <div className="space-y-6">
                  {/* Date Picker */}
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Appointment Date</label>
                    <div className="relative max-w-sm">
                      <CalendarIcon className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                      <input 
                        type="date" 
                        min={new Date().toISOString().split('T')[0]}
                        value={selectedDate}
                        onChange={(e) => setSelectedDate(e.target.value)}
                        className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition-all"
                      />
                    </div>
                  </div>

                  {/* Time Slots */}
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-3 flex items-center justify-between">
                      Available Slots
                      {loading && <span className="text-primary-500 text-xs flex items-center gap-1"><div className="w-3 h-3 border-2 border-primary-200 border-t-primary-600 rounded-full animate-spin"></div> Loading...</span>}
                    </label>
                    
                    {!loading && slots.length === 0 ? (
                      <div className="bg-amber-50 text-amber-800 p-4 rounded-xl text-sm border border-amber-200">
                        No slots available for this date. Please choose another date.
                      </div>
                    ) : (
                      <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3">
                        {slots.map(slot => (
                          <button
                            key={slot}
                            onClick={() => setSelectedSlot(slot)}
                            className={`py-2 rounded-xl text-sm font-medium transition-all ${
                              selectedSlot === slot 
                                ? 'bg-primary-600 text-white shadow-md shadow-primary-500/30 ring-2 ring-primary-500 ring-offset-2' 
                                : 'bg-slate-50 text-slate-700 border border-slate-200 hover:border-primary-300 hover:bg-primary-50'
                            }`}
                          >
                            {slot}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Step 3: Confirmation */}
          {selectedSlot && (
            <div className="animate-in slide-in-from-bottom-4 duration-300">
              <div className="bg-slate-900 rounded-2xl shadow-xl p-6 text-white flex flex-col sm:flex-row items-center justify-between gap-6">
                <div>
                  <h3 className="text-lg font-semibold mb-1">Confirm Booking</h3>
                  <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-slate-300 text-sm">
                    <span className="flex items-center gap-1.5"><User className="w-4 h-4" /> Dr. {selectedDoctor?.name}</span>
                    <span className="flex items-center gap-1.5"><CalendarIcon className="w-4 h-4" /> {new Date(selectedDate).toLocaleDateString()}</span>
                    <span className="flex items-center gap-1.5 text-primary-300 font-medium"><Clock className="w-4 h-4" /> {selectedSlot}</span>
                  </div>
                </div>
                
                <button
                  onClick={handleBook}
                  disabled={booking}
                  className="w-full sm:w-auto bg-primary-500 hover:bg-primary-400 text-white px-6 py-3 rounded-xl font-semibold transition-all flex items-center justify-center gap-2 shadow-[0_0_15px_rgba(59,130,246,0.4)] hover:shadow-[0_0_20px_rgba(59,130,246,0.6)] disabled:opacity-70 disabled:cursor-not-allowed"
                >
                  {booking ? 'Booking...' : (
                    <>
                      Confirm Appointment
                      <CheckCircle className="w-5 h-5" />
                    </>
                  )}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}
