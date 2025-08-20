import React from 'react';
import ChatApp from './components/ChatApp';

function App() {
  return (
    <div>
      <ChatApp wsUrl={process.env.REACT_APP_WS_URL} />
    </div>
  );
}

export default App;
