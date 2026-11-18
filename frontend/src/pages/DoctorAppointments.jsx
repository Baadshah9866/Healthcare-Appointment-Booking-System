import React, { useState, useEffect } from 'react';
import api from '../services/api';
import Layout from '../components/Layout';
import { Calendar, Clock, Users, CheckCircle, XCircle } from 'lucide-react';

export default function DoctorAppointments() {
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

  const handleAccept = async (id) => {
    try {
      await api.put(`/appointments/accept/${id}`);
      fetchAppointments();
    } catch (error) {
      alert('Failed to accept appointment');
    }
  };

  const handleCancel = async (id) => {
    if (!window.confirm('Are you sure you want to reject this appointment request?')) return;
    try {
      await api.delete(`/appointments/cancel/${id}`);
      fetchAppointments();
    } catch (error) {
      alert('Failed to cancel appointment');
    }
  };

  const pendingAppointments = appointments.filter(a => a.status === 'pending');

  return (
    <Layout>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900">Appointment Requests</h1>
        <p className="text-slate-500 mt-1">Review and manage pending appointment requests from patients</p>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="px-6 py-5 border-b border-slate-200 flex justify-between items-center bg-slate-50/50">
          <h2 className="text-lg font-semibold text-slate-900">
            Pending Requests <span className="bg-yellow-100 text-yellow-800 text-xs px-2.5 py-0.5 rounded-full ml-2">{pendingAppointments.length}</span>
          </h2>
        </div>
        
        {loading ? (
          <div className="p-8 text-center text-slate-500 flex flex-col items-center">
            <div className="w-8 h-8 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin mb-4"></div>
            Loading requests...
          </div>
        ) : pendingAppointments.length === 0 ? (
          <div className="p-12 text-center text-slate-500 flex flex-col items-center">
            <Calendar className="w-12 h-12 text-slate-300 mb-4" />
            <p className="text-lg font-medium text-slate-900 mb-1">No pending requests</p>
            <p className="text-slate-500">You're all caught up! There are no new appointment requests to review.</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-200">
            {pendingAppointments.map(appt => (
              <div key={appt.id} className="p-6 hover:bg-slate-50 transition-colors flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div className="flex gap-4 items-start">
                  <div className="bg-yellow-50 p-3 rounded-xl hidden sm:block border border-yellow-100">
                    <Users className="w-6 h-6 text-yellow-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-slate-900">{appt.patient_name}</h3>
                    <p className="text-sm text-slate-500 mb-2">
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
                
                <div className="flex items-center gap-3 w-full md:w-auto mt-4 md:mt-0">
                  <button 
                    onClick={() => handleCancel(appt.id)}
                    className="flex-1 md:flex-none px-4 py-2 text-slate-700 bg-white border border-slate-300 hover:bg-red-50 hover:text-red-600 hover:border-red-200 rounded-xl transition-all flex items-center justify-center gap-2 text-sm font-medium shadow-sm"
                  >
                    <XCircle className="w-4 h-4" />
                    Reject
                  </button>
                  <button 
                    onClick={() => handleAccept(appt.id)}
                    className="flex-1 md:flex-none px-4 py-2 text-white bg-primary-600 hover:bg-primary-700 rounded-xl transition-all flex items-center justify-center gap-2 text-sm font-medium shadow-sm shadow-primary-500/20"
                  >
                    <CheckCircle className="w-4 h-4" />
                    Accept
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
}
