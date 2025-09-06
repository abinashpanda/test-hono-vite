import { createFileRoute } from '@tanstack/react-router'
import { honoClient, ws } from '../lib/client'
import { useEffect } from 'react'

export const Route = createFileRoute('/')({
  loader: async () => {
    const data = await honoClient.me.$get().then((res) => res.json())
    return data
  },
  component: Home,
})

function Home() {
  const { name } = Route.useLoaderData()

  useEffect(() => {
    ws.send(JSON.stringify({ type: 'ping' }))
  }, [])

  return (
    <div className="flex h-screen items-center justify-center flex-col gap-2">
      <img src="/assets/logo.png" className="size-32 object-contain" />
      <div className="text-5xl font-medium font-display">Hono + Vite</div>
      <div className="text-muted-foreground text-lg">Single Application</div>
      <div>{name}</div>
    </div>
  )
}
