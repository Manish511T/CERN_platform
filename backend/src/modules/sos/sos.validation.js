import { z } from 'zod'
import { EMERGENCY_TYPE, SOS_STATUS } from '../../shared/constants.js'

export const triggerSOSSchema = z.object({
  body: z.object({
    latitude: z.coerce
      .number({ required_error: 'Latitude is required' })
      .min(-90)
      .max(90),
    longitude: z.coerce
      .number({ required_error: 'Longitude is required' })
      .min(-180)
      .max(180),
    forSelf: z.coerce.boolean().default(true),
    emergencyType: z.enum(Object.values(EMERGENCY_TYPE), {
      errorMap: () => ({ message: 'Invalid emergency type' }),
    }),
    address: z.string().max(200).optional(),
  }),
})

export const updateStatusSchema = z.object({
  params: z.object({
    sosId: z.string().length(24, 'Invalid SOS ID'),
  }),
  body: z.object({
    status: z.enum([SOS_STATUS.RESOLVED, SOS_STATUS.CANCELLED]),
  }),
})

export const getHistorySchema = z.object({
  query: z.object({
    page:  z.coerce.number().min(1).default(1),
    limit: z.coerce.number().min(1).max(50).default(20),
  }),
})