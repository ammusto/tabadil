import React from 'react';

const MaintenancePage: React.FC = () => {
  return (
    <div style={{
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      minHeight: '60vh',
      padding: '2rem',
      textAlign: 'center'
    }}>
      <div style={{ maxWidth: '600px' }}>
        <p style={{ fontSize: '1.2rem', lineHeight: '1.8' }}>
          The functionality of <em>tab&#257;d&#299;l</em> is being updated and incorporated into a new project, <em>kashsh&#257;f</em>.
          {' '}To learn more, please go to{' '}
          <a href="https://kashshaf.com/" target="_blank" rel="noopener noreferrer">
            https://kashshaf.com/
          </a>
        </p>
      </div>
    </div>
  );
};

export default MaintenancePage;
