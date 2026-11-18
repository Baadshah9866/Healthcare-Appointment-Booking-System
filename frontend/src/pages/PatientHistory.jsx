import React, { useState, useEffect } from 'react';
import api from '../services/api';
import Layout from '../components/Layout';
import { Calendar, Clock, User, CheckCircle, XCircle } from 'lucide-react';

export default function PatientHistory() {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAppointments = async () => {
      try {
        const res = await api.get('/appointments');
        setAppointments(res.data);
      } catch (error) {
        console.error('Failed to fetch history', error);
      } finally {
        setLoading(false);
      }
    };
    fetchAppointments();
  }, []);

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

  const getStatusIcon = (status) => {
    switch(status) {
      case 'pending': return <Clock className="w-5 h-5 text-yellow-600" />;
      case 'scheduled': return <Clock className="w-5 h-5 text-blue-600" />;
      case 'accepted': return <CheckCircle className="w-5 h-5 text-blue-600" />;
      case 'completed': return <CheckCircle className="w-5 h-5 text-green-600" />;
      case 'cancelled': return <XCircle className="w-5 h-5 text-red-600" />;
      default: return null;
    }
  };

  return (
    <Layout>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900">Appointment History</h1>
        <p className="text-slate-500 mt-1">Review all your past and present appointments.</p>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-slate-500 flex flex-col items-center">
            <div className="w-8 h-8 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin mb-4"></div>
            Loading history...
          </div>
        ) : appointments.length === 0 ? (
          <div className="p-12 text-center text-slate-500 flex flex-col items-center">
            <Calendar className="w-12 h-12 text-slate-300 mb-4" />
            <p className="text-lg font-medium text-slate-900 mb-1">No history found</p>
            <p className="text-slate-500">You haven't booked any appointments yet.</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-200">
            {appointments.map(appt => (
              <div key={appt.id} className="p-6 hover:bg-slate-50 transition-colors flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div className="flex gap-4 items-start">
                  <div className={`p-3 rounded-xl hidden sm:block ${
                    appt.status === 'scheduled' ? 'bg-blue-50' : 
                    appt.status === 'completed' ? 'bg-green-50' : 'bg-red-50'
                  }`}>
                    {getStatusIcon(appt.status)}
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-slate-900">Dr. {appt.doctor_name}</h3>
                    <p className="text-sm text-primary-600 font-medium mb-2">{appt.specialization}</p>
                    
                    <div className="flex flex-wrap gap-4 text-sm text-slate-600">
                      <div className="flex items-center gap-1.5">
                        <Calendar className="w-4 h-4 text-slate-400" />
                        {new Date(appt.slot_time).toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Clock className="w-4 h-4 text-slate-400" />
                        {new Date(appt.slot_time).toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })}
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center gap-4 w-full md:w-auto mt-2 md:mt-0">
                  <span className={`px-4 py-1.5 rounded-full text-sm font-semibold border ${getStatusColor(appt.status)} capitalize flex items-center gap-2`}>
                    {appt.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
}
