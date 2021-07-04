import React from "react";
import "./App.css";
import { useRTCRecorder } from "./useRTC";

function App() {
  const { state, error, handleStart, handleStop } = useRTCRecorder();
  if (state === "error") {
    return (
      <main>
        <h1>{error?.message}</h1>
      </main>
    );
  }
  return (
    <main className="App">
      <section>
        <button onClick={handleStart}>Start Recording</button>
        <button onClick={() => handleStop()}>Stop Recording</button>
      </section>
    </main>
  );
}

export default App;
