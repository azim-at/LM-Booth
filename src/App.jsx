import React from 'react'
import LandmarkMarketsBooth from './LandmarkMarketsBooth'

 const App = () => {
  return (
    <div style={{ width: "100vw", height: "100vh" }}>
      <LandmarkMarketsBooth modelPath="/6.glb" />
    </div>
  );
}

export default App;
