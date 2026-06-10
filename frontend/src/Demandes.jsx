import React from 'react';
import { useNavigate } from 'react-router-dom';

const Demandes = () => {
  const navigate = useNavigate();

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      padding: '32px'
    }}>
      <div style={{
        width: '100%',
        maxWidth: '900px',
        display: 'flex',
        justifyContent: 'space-between',
        gap: '24px'
      }}>
        <button
          type="button"
          onClick={() => navigate('/events-demandes')}
          style={{
            width: '450px',
            height: '450px',
            fontSize: 'larger',
            fontWeight: 'bolder',
            borderRadius: '24px',
            border: '3px solid rgba(102, 126, 234, 0.5) ',
            cursor: 'pointer',
            backgroundColor: 'rgb(39, 13, 63, 0.5)',
            color: 'white',
            boxShadow: '0 12px 30px rgba(15, 23, 42, 0.08)',
            textAlign: 'center',
            marginRight: '12px',
          }}
        >
          Events Demandes
        </button>

        <button
          type="button"
          onClick={() => navigate('/organizer-signin-demandes')}
          style={{
            width: '450px',
            height: '450px',
            fontSize: 'larger',
            fontWeight: 'bolder',
            borderRadius: '24px',
            border: '3px solid rgba(102, 126, 234, 0.5) ',
            cursor: 'pointer',
            backgroundColor: 'rgb(39, 13, 63, 0.5)',
            color: 'white',
            boxShadow: '0 12px 30px rgba(15, 23, 42, 0.08)',
            textAlign: 'center',
          }}
        >
          Organizer Sign In Demandes
        </button>
      </div>
    </div>
  );
};

export default Demandes;
