import React, { useState, useEffect } from 'react';
import api from '../services/api';
import Layout from '../components/Layout';
import { Calendar, Clock, Users, XCircle, CheckCircle } from 'lucide-react';

export default function DoctorDashboard() {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchAppointments = async () => {
    try {
      const res = await api.get('/appointments');
      setAppointments(res.data);
    } catch (error) {
      console.error('Failed to fetch appointments', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAppointments();
  }, []);

  const handleCancel = async (id) => {
    if (!window.confirm('Are you sure you want to cancel this appointment?')) return;
    try {
      await api.delete(`/appointments/cancel/${id}`);
      fetchAppointments();
    } catch (error) {
      alert('Failed to cancel appointment');
    }
  };

  const activeAppointments = appointments.filter(a => a.status === 'scheduled' || a.status === 'accepted' || a.status === 'completed');

  const getStatusColor = (status) => {
    switch(status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'scheduled': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'accepted': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'completed': return 'bg-green-100 text-green-800 border-green-200';
      case 'cancelled': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-slate-100 text-slate-800 border-slate-200';
    }
  };

  return (
    <Layout>
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Doctor Dashboard</h1>
          <p className="text-slate-500 mt-1">Manage your clinic schedule and appointments</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="bg-purple-50 p-4 rounded-xl">
            <Users className="w-8 h-8 text-purple-600" />
          </div>
          <div>
            <p className="text-sm font-medium text-slate-500">Total Patients</p>
            <p className="text-2xl font-bold text-slate-900">
              {new Set(appointments.map(a => a.patient_email)).size}
            </p>
          </div>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="bg-blue-50 p-4 rounded-xl">
            <Calendar className="w-8 h-8 text-blue-600" />
          </div>
          <div>
            <p className="text-sm font-medium text-slate-500">Upcoming Today</p>
            <p className="text-2xl font-bold text-slate-900">
              {activeAppointments.filter(a => {
                const today = new Date().toDateString();
                const apptDate = new Date(a.slot_time).toDateString();
                return today === apptDate;
              }).length}
            </p>
          </div>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="bg-green-50 p-4 rounded-xl">
            <CheckCircle className="w-8 h-8 text-green-600" />
          </div>
          <div>
            <p className="text-sm font-medium text-slate-500">Total Upcoming</p>
            <p className="text-2xl font-bold text-slate-900">
              {activeAppointments.length}
            </p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="px-6 py-5 border-b border-slate-200 flex justify-between items-center bg-slate-50/50">
          <h2 className="text-lg font-semibold text-slate-900">Appointment Schedule</h2>
        </div>
        
        {loading ? (
          <div className="p-8 text-center text-slate-500 flex flex-col items-center">
            <div className="w-8 h-8 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin mb-4"></div>
            Loading appointments...
          </div>
        ) : activeAppointments.length === 0 ? (
          <div className="p-12 text-center text-slate-500 flex flex-col items-center">
            <Calendar className="w-12 h-12 text-slate-300 mb-4" />
            <p className="text-lg font-medium text-slate-900 mb-1">No appointments yet</p>
            <p className="text-slate-500">You don't have any scheduled appointments.</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-200">
            {activeAppointments.map(appt => (
              <div key={appt.id} className="p-6 hover:bg-slate-50 transition-colors flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div className="flex gap-4 items-start">
                  <div className="bg-slate-100 p-3 rounded-xl hidden sm:block">
                    <Users className="w-6 h-6 text-slate-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-slate-900">{appt.patient_name}</h3>
                    <p className="text-sm text-slate-500 mb-2 flex items-center gap-1">
                      <a href={`mailto:${appt.patient_email}`} className="hover:text-primary-600">
                        {appt.patient_email}
                      </a>
                    </p>
                    
                    <div className="flex flex-wrap gap-4 text-sm text-slate-600">
                      <div className="flex items-center gap-1.5">
                        <Calendar className="w-4 h-4 text-slate-400" />
                        {new Date(appt.slot_time).toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                      </div>
                      <div className="flex items-center gap-1.5 font-medium text-slate-900 bg-slate-100 px-2 py-0.5 rounded-md">
                        <Clock className="w-4 h-4 text-slate-500" />
                        {new Date(appt.slot_time).toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })}
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center gap-4 w-full md:w-auto mt-2 md:mt-0">
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${getStatusColor(appt.status)} uppercase tracking-wider`}>
                    {appt.status}
                  </span>
                  
                  
                  {(appt.status === 'scheduled' || appt.status === 'accepted') && (
                    <button 
                      onClick={() => handleCancel(appt.id)}
                      className="ml-auto md:ml-0 text-red-500 hover:text-red-700 hover:bg-red-50 p-2 rounded-lg transition-colors flex items-center gap-1 text-sm font-medium"
                    >
                      <XCircle className="w-4 h-4" />
                      <span className="hidden sm:inline">Cancel</span>
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
}
