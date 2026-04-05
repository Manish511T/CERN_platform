import express from 'express'
import cors from 'cors'
import cookieParser from 'cookie-parser'
import helmet from 'helmet'
import { env } from './src/config/env.js'
import errorHandler from './src/middleware/errorHandler.js'
import { NotFoundError } from './src/shared/errors.js'
import authRoutes from './src/modules/auth/auth.routes.js'

const app = express()

app.use(helmet())
app.use(cors({
  origin: env.CLIENT_URL,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
}))
app.options('/{*path}', cors())
app.use(express.json({ limit: '10mb' }))
app.use(express.urlencoded({ extended: true }))
app.use(cookieParser())

// ── Routes ────────────────────────────────────────────────────────────────────
app.use('/api/auth', authRoutes)

app.get('/health', (req, res) => res.json({ status: 'ok', timestamp: new Date() }))

app.use((req, res, next) => next(new NotFoundError(`Route ${req.originalUrl}`)))
app.use(errorHandler)

export default app