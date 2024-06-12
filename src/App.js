import React, { useState } from 'react';
import { Route, Routes } from 'react-router-dom';
import VideoCall from './pages/VideoCall';

const App = () => {
  const [currentUserId, setCurrentUserId] = useState(null);

  const handleLogin = (userId) => {
    setCurrentUserId(userId);
  };

  return (
    <div>
      <Routes>
        <Route path="/video-call/:toUserId" element={<VideoCall currentUserId={currentUserId} />} />
      </Routes>
    </div>
  );
};

export default App;