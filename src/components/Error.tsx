import React from 'react'

type ErrorProps = {
  error: Error | null
}

export default function Error({ error }: ErrorProps) {
  return (
    <section>
      {error?.message}
      {error?.stack}
    </section>
  )
}
