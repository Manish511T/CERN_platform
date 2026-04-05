cern-platform/
│
├── backend/
│   ├── src/
│   │   ├── modules/                    ← Feature-based modules (core of the system)
│   │   │   │
│   │   │   ├── auth/
│   │   │   │   ├── auth.controller.js  ← HTTP in/out only
│   │   │   │   ├── auth.service.js     ← All business logic
│   │   │   │   ├── auth.routes.js      ← Route definitions + middleware
│   │   │   │   ├── auth.model.js       ← Mongoose schema
│   │   │   │   └── auth.validation.js  ← Zod/Joi schemas for request validation
│   │   │   │
│   │   │   ├── sos/
│   │   │   │   ├── sos.controller.js
│   │   │   │   ├── sos.service.js
│   │   │   │   ├── sos.routes.js
│   │   │   │   ├── sos.model.js
│   │   │   │   └── sos.validation.js
│   │   │   │
│   │   │   ├── branch/
│   │   │   │   ├── branch.controller.js
│   │   │   │   ├── branch.service.js
│   │   │   │   ├── branch.routes.js
│   │   │   │   ├── branch.model.js
│   │   │   │   └── branch.validation.js
│   │   │   │
│   │   │   ├── user/
│   │   │   │   ├── user.controller.js
│   │   │   │   ├── user.service.js
│   │   │   │   ├── user.routes.js
│   │   │   │   ├── user.model.js
│   │   │   │   └── user.validation.js
│   │   │   │
│   │   │   └── notification/
│   │   │       ├── notification.service.js  ← No controller (internal only)
│   │   │       ├── notification.model.js    ← FCM token storage
│   │   │       └── providers/
│   │   │           ├── fcm.provider.js      ← Firebase push
│   │   │           └── sms.provider.js      ← SMS fallback
│   │   │
│   │   ├── socket/                     ← Real-time layer (clean separation)
│   │   │   ├── index.js                ← Socket.io init + adapter setup
│   │   │   ├── socket.manager.js       ← onlineUsers (Redis-backed)
│   │   │   ├── socket.middleware.js    ← Auth handshake for socket connections
│   │   │   └── handlers/
│   │   │       ├── sos.handler.js      ← SOS socket events
│   │   │       ├── tracking.handler.js ← Live GPS events
│   │   │       └── connection.handler.js← connect/disconnect lifecycle
│   │   │
│   │   ├── middleware/                 ← Express middleware (global)
│   │   │   ├── protect.js              ← JWT verify + attach req.user
│   │   │   ├── authorize.js            ← Role-based access control
│   │   │   ├── validate.js             ← Request validation wrapper
│   │   │   ├── rateLimiter.js          ← Per-route rate limits
│   │   │   └── errorHandler.js         ← Global error handler
│   │   │
│   │   ├── config/                     ← All configuration, never logic
│   │   │   ├── db.js                   ← MongoDB connection
│   │   │   ├── redis.js                ← Redis client (ready, even if unused early)
│   │   │   ├── logger.js               ← Winston logger
│   │   │   └── env.js                  ← Zod-validated environment variables
│   │   │
│   │   ├── queues/                     ← BullMQ job definitions (ready to activate)
│   │   │   ├── index.js                ← Queue registry
│   │   │   ├── escalation.queue.js     ← SOS timeout + escalation jobs
│   │   │   └── notification.queue.js   ← Async push delivery jobs
│   │   │
│   │   ├── utils/                      ← Pure functions, no side effects
│   │   │   ├── geo.utils.js            ← Haversine, coordinate helpers
│   │   │   ├── token.utils.js          ← JWT sign/verify wrappers
│   │   │   ├── response.utils.js       ← Standardized API response helpers
│   │   │   └── asyncHandler.js         ← try/catch wrapper for controllers
│   │   │
│   │   └── shared/                     ← Types/constants shared across modules
│   │       ├── constants.js            ← SOS statuses, roles, event names
│   │       └── errors.js               ← Custom error classes
│   │
│   ├── index.js                        ← App entry point (thin, just wires things up)
│   ├── app.js                          ← Express app setup (routes, middleware)
│   └── .env
│
├── apps/
│   ├── user-app/                       ← React + Vite (PWA-ready)
│   ├── volunteer-app/                  ← React Native
│   └── admin-dashboard/                ← React + Vite
│
└── package.json                        ← Monorepo root (optional: use turborepo)