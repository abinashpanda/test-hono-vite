import { hc } from 'hono/client'
import type { App } from '../../../server'
import { QueryClient } from '@tanstack/react-query'

export const honoClient = hc<App>('http://localhost:4000')
export const ws = honoClient.ws.$ws()

export const queryClient = new QueryClient()
