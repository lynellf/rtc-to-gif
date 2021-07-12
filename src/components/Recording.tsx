import React from 'react'

export default function Recording({ handleStop }: { handleStop: () => void }) {
  return (
    <section>
      <h1>Recording...</h1>
      <button onClick={handleStop}>Stop</button>
    </section>
  )
}
