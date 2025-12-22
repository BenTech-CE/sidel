import { PulseLoader } from 'react-spinners';

const SidelLoading = () => {
  return (
    <div style={{ 
      display: 'flex', 
      flexDirection: 'column',
      alignItems: 'center', 
      justifyContent: 'center',
      gap: '0px',
      padding: '0px'
    }}>
      <PulseLoader 
        color="#ffffffff" 
        size={6} 
        margin={2}
        speedMultiplier={0.8} 
      />
      <span style={{ 
        fontSize: '10px', 
        textTransform: 'uppercase', 
        letterSpacing: '2px', 
        fontWeight: 'bold',
        color: '#ffffffff'
      }}>
      </span>
    </div>
  );
};

export default SidelLoading;