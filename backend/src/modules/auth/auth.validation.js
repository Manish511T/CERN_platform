import { z } from 'zod'
import { ROLES } from '../../shared/constants.js'

export const registerSchema = z.object({
  body: z.object({
    name: z
      .string({ required_error: 'Name is required' })
      .min(2, 'Name must be at least 2 characters')
      .max(50)
      .trim(),
    email: z
      .string({ required_error: 'Email is required' })
      .email('Invalid email')
      .toLowerCase(),
    password: z
      .string({ required_error: 'Password is required' })
      .min(6, 'Password must be at least 6 characters'),

    // Public registration: only user or volunteer allowed
    // super_admin and branch_admin are created by super admin only
    role: z
      .enum([ROLES.USER, ROLES.VOLUNTEER], {
        errorMap: () => ({
          message: 'Role must be user or volunteer. Admin roles are assigned by Super Admin.',
        }),
      })
      .default(ROLES.USER),

    phone: z.string().trim().optional(),
  }),
})

export const adminCreateUserSchema = z.object({
  body: z.object({
    name:     z.string().min(2).max(50).trim(),
    email:    z.string().email().toLowerCase(),
    password: z.string().min(6),
    role: z.enum(Object.values(ROLES), {
      errorMap: () => ({ message: 'Invalid role' }),
    }),
    phone:    z.string().trim().optional(),
    branchId: z.string().length(24).optional(),
  }),
})

export const loginSchema = z.object({
  body: z.object({
    email:    z.string().email('Invalid email').toLowerCase(),
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
    token: z.string().min(1),
  }),
})