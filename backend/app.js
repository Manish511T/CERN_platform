import express from 'express'
import cors from 'cors'
import cookieParser from 'cookie-parser'
import helmet from 'helmet'
import { allowedOrigins } from './src/config/env.js'
import errorHandler from './src/middleware/errorHandler.js'
import { NotFoundError } from './src/shared/errors.js'
import authRoutes from './src/modules/auth/auth.routes.js'
import sosRoutes from './src/modules/sos/sos.routes.js'   
import branchRoutes from './src/modules/branch/branch.routes.js'
import userRoutes   from './src/modules/user/user.routes.js'  
import notificationRoutes from './src/modules/notification/notification.routes.js'
import { listOnlineSockets } from './src/socket/socket.manager.js'

const app = express()

// ── CORS — allow all registered frontend origins ──────────────────────────────
const corsOptions = {
  origin: (origin, callback) => {
    // Allow requests with no origin (Postman, mobile apps, server-to-server)
    if (!origin) return callback(null, true)

    if (allowedOrigins.includes(origin)) {
      callback(null, true)
    } else {
      callback(new Error(`CORS blocked: ${origin}`))
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}

app.use(helmet())
app.use(cors(corsOptions))
app.options('/{*path}', cors(corsOptions))
app.use(express.json({ limit: '10mb' }))
app.use(express.urlencoded({ extended: true }))
app.use(cookieParser())

app.use('/api/auth', authRoutes)
app.use('/api/sos',  sosRoutes)   
app.use('/api/branch', branchRoutes)                          
app.use('/api/user',   userRoutes)    
app.use('/api/notification', notificationRoutes)  

app.get('/health', (req, res) => res.json({ status: 'ok', timestamp: new Date() }))

app.get('/debug/sockets', async (req, res) => {
  const online = await listOnlineSockets()
  res.json({
    count:   Object.keys(online).length,
    sockets: online,
  })
})

app.use((req, res, next) => next(new NotFoundError(`Route ${req.originalUrl}`)))
app.use(errorHandler)

export default app