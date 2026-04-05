import { z } from 'zod'

export const createBranchSchema = z.object({
  body: z.object({
    name: z
      .string({ required_error: 'Branch name is required' })
      .min(2, 'Name must be at least 2 characters')
      .max(100)
      .trim(),
    code: z
      .string({ required_error: 'Branch code is required' })
      .min(2, 'Code must be at least 2 characters')
      .max(10)
      .trim()
      .toUpperCase(),
    latitude: z.coerce
      .number({ required_error: 'Latitude is required' })
      .min(-90)
      .max(90),
    longitude: z.coerce
      .number({ required_error: 'Longitude is required' })
      .min(-180)
      .max(180),
    radiusMeters: z.coerce
      .number()
      .min(1000, 'Radius must be at least 1000 meters')
      .max(100000, 'Radius cannot exceed 100000 meters')
      .default(15000),
    contactPhone: z.string().trim().optional(),
    address: z.string().trim().optional(),
  }),
})

export const updateBranchSchema = z.object({
  params: z.object({
    branchId: z.string().length(24, 'Invalid branch ID'),
  }),
  body: z.object({
    name:         z.string().min(2).max(100).trim().optional(),
    latitude:     z.coerce.number().min(-90).max(90).optional(),
    longitude:    z.coerce.number().min(-180).max(180).optional(),
    radiusMeters: z.coerce.number().min(1000).max(100000).optional(),
    contactPhone: z.string().trim().optional(),
    address:      z.string().trim().optional(),
    isActive:     z.boolean().optional(),
  }),
})

export const assignAdminSchema = z.object({
  params: z.object({
    branchId: z.string().length(24, 'Invalid branch ID'),
  }),
  body: z.object({
    userId: z
      .string({ required_error: 'User ID is required' })
      .length(24, 'Invalid user ID'),
  }),
})

export const assignVolunteerSchema = z.object({
  params: z.object({
    branchId: z.string().length(24, 'Invalid branch ID'),
  }),
  body: z.object({
    volunteerId: z
      .string({ required_error: 'Volunteer ID is required' })
      .length(24, 'Invalid volunteer ID'),
    action: z.enum(['assign', 'unassign', 'verify', 'unverify'], {
      errorMap: () => ({ message: 'Action must be assign, unassign, verify or unverify' }),
    }),
  }),
})

export const branchParamSchema = z.object({
  params: z.object({
    branchId: z.string().length(24, 'Invalid branch ID'),
  }),
})