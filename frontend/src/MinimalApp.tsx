import React from 'react';

export default function MinimalApp() {
  console.log('🔥 MinimalApp rendering');
  
  return (
    <div style={{ 
      padding: '20px', 
      fontFamily: 'system-ui',
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      color: 'white',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center'
    }}>
      <h1 style={{ fontSize: '2.5rem', marginBottom: '1rem', textAlign: 'center' }}>
        🚀 Gado Wallet
      </h1>
      <p style={{ fontSize: '1.2rem', marginBottom: '2rem', textAlign: 'center', opacity: 0.9 }}>
        Digital Asset Inheritance Platform
      </p>
      <div style={{ 
        background: 'rgba(255,255,255,0.1)', 
        padding: '20px', 
        borderRadius: '10px',
        textAlign: 'center',
        maxWidth: '400px'
      }}>
        <p style={{ marginBottom: '1rem' }}>
          ✅ App is loading successfully!
        </p>
        <p style={{ fontSize: '0.9rem', opacity: 0.8 }}>
          If you see this message, the basic React app is working.
        </p>
        <button 
          onClick={() => {
            console.log('🔄 Reloading full app...');
            window.location.href = window.location.href + '?full=true';
          }}
          style={{
            marginTop: '1rem',
            padding: '10px 20px',
            background: 'rgba(255,255,255,0.2)',
            border: 'none',
            borderRadius: '5px',
            color: 'white',
            cursor: 'pointer',
            fontSize: '1rem'
          }}
        >
          Load Full App
        </button>
      </div>
    </div>
  );
}