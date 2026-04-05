import { z } from 'zod'
import { ROLES } from '../../shared/constants.js'

export const registerSchema = z.object({
  body: z.object({
    name: z
      .string({ required_error: 'Name is required' })
      .min(2, 'Name must be at least 2 characters')
      .max(50, 'Name cannot exceed 50 characters')
      .trim(),
    email: z
      .string({ required_error: 'Email is required' })
      .email('Invalid email address')
      .toLowerCase(),
    password: z
      .string({ required_error: 'Password is required' })
      .min(6, 'Password must be at least 6 characters'),
    role: z
      .enum(Object.values(ROLES), { errorMap: () => ({ message: 'Invalid role' }) })
      .optional(),
    phone: z.string().trim().optional(),
  }),
})

export const loginSchema = z.object({
  body: z.object({
    email: z
      .string({ required_error: 'Email is required' })
      .email('Invalid email address')
      .toLowerCase(),
    password: z.string({ required_error: 'Password is required' }),
  }),
})

export const updateLocationSchema = z.object({
  body: z.object({
    latitude:  z.coerce.number().min(-90).max(90),
    longitude: z.coerce.number().min(-180).max(180),
  }),
})

export const registerFCMSchema = z.object({
  body: z.object({
    token: z.string({ required_error: 'FCM token is required' }).min(1),
  }),
})