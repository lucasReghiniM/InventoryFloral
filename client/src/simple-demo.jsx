import { useState } from 'react';

/**
 * Um componente simples de demonstração
 */
function SimpleDemo() {
  const [count, setCount] = useState(0);

  return (
    <div style={{
      padding: '20px',
      margin: '20px auto',
      maxWidth: '500px',
      borderRadius: '8px',
      boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
      backgroundColor: '#fff'
    }}>
      <h2 style={{ color: '#2c3e50', marginBottom: '15px' }}>Demo Simples</h2>
      <p>Este é um componente React de demonstração.</p>
      
      <div style={{ margin: '20px 0' }}>
        <p>Contador: <strong>{count}</strong></p>
        <button 
          onClick={() => setCount(count + 1)}
          style={{
            padding: '8px 15px',
            backgroundColor: '#3498db',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            marginRight: '10px'
          }}
        >
          Incrementar
        </button>
        <button 
          onClick={() => setCount(0)}
          style={{
            padding: '8px 15px',
            backgroundColor: '#e74c3c',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          Reiniciar
        </button>
      </div>
    </div>
  );
}

export default SimpleDemo;