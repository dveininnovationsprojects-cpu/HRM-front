import React from 'react';

const StatCard = ({ title, value, subtext, icon, color }) => (
  <div style={{ backgroundColor: '#fff', padding: '20px', borderRadius: '16px', boxShadow: '0 4px 20px rgba(37,99,235,0.08)', border: '1px solid #DCE6F2', flex: 1, display: 'flex', alignItems: 'center', gap: '15px', minWidth: '180px' }}>
    <div style={{ padding: '12px', borderRadius: '10px', backgroundColor: `${color}15`, color: color }}>
      {icon}
    </div>
    <div>
      <p style={{ fontSize: '14px', color: '#666', margin: 0 }}>{title}</p>
      <h3 style={{ fontSize: '24px', fontWeight: 'bold', margin: '5px 0' }}>{value}</h3>
      <p style={{ fontSize: '12px', color: '#22c55e', margin: 0 }}>{subtext}</p>
    </div>
  </div>
);

export default StatCard;