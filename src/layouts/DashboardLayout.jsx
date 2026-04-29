import React from 'react';
import Sidebar from '../components/Sidebar';

const DashboardLayout = ({ children, role, title }) => {
  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#f8fafc' }}>
      <Sidebar role={role} />
      <div style={{ flex: 1, marginLeft: '260px', padding: '40px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
            <h2 style={{ margin: 0, fontWeight: '700', color: '#1e293b' }}>{title}</h2>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <span style={{ fontSize: '14px', color: '#64748b' }}>Active Session</span>
                <div style={{ width: '40px', height: '40px', background: '#e2e8f0', borderRadius: '50%' }}></div>
            </div>
        </div>
        {children}
      </div>
    </div>
  );
};

export default DashboardLayout;