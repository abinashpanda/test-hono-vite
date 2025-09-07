import { hc } from 'hono/client'
import type { App } from '../../../server'
import { QueryClient } from '@tanstack/react-query'

export const honoClient = hc<App>(window.location.origin)
export const ws = honoClient.ws.$ws()

export const queryClient = new QueryClient()
