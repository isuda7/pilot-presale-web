// 로컬 개발용 API 서버 (Vercel 에서는 사용되지 않음). .env.local 을 읽는다.
import { serve } from '@hono/node-server'
import app from './app'

try { process.loadEnvFile('.env.local') } catch {}

serve({ fetch: app.fetch, port: 8790 }, (i) => console.log(`API http://localhost:${i.port}`))
