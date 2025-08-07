import React from 'react';
import ChatApp from './components/ChatApp';

function App() {
  return (
    <div>
      <ChatApp wsUrl="wss://9nnkr484ic.execute-api.ap-northeast-1.amazonaws.com/production/" />
    </div>
  );
}

export default App;
