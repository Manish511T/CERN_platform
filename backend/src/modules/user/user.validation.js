import { z } from 'zod'

export const updateProfileSchema = z.object({
  body: z.object({
    name: z
      .string()
      .min(2, 'Name must be at least 2 characters')
      .max(50)
      .trim()
      .optional(),
    phone: z
      .string()
      .trim()
      .optional(),
  }),
})

export const userParamSchema = z.object({
  params: z.object({
    userId: z.string().length(24, 'Invalid user ID'),
  }),
})

export const getUsersQuerySchema = z.object({
  query: z.object({
    role:     z.enum(['user', 'volunteer', 'branch_admin', 'super_admin']).optional(),
    isActive: z.enum(['true', 'false']).optional(),
    branchId: z.string().length(24).optional(),
    page:     z.coerce.number().min(1).default(1),
    limit:    z.coerce.number().min(1).max(100).default(20),
    search:   z.string().trim().optional(),
  }),
})