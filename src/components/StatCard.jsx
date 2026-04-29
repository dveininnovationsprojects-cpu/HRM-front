import React from 'react';

const StatCard = ({ title, value, subtext, icon, color }) => (
  <div style={{ backgroundColor: '#fff', padding: '20px', borderRadius: '12px', boxShadow: '0 2px 10px rgba(0,0,0,0.05)', flex: 1, display: 'flex', alignItems: 'center', gap: '15px' }}>
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