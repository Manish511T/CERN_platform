import jwt from 'jsonwebtoken'
import { env } from '../config/env.js'

export const generateAccessToken = (userId) => {
  return jwt.sign({ id: userId }, env.JWT_SECRET, {
    expiresIn: env.JWT_ACCESS_EXPIRY,
  })
}

export const generateRefreshToken = (userId) => {
  return jwt.sign({ id: userId }, env.JWT_REFRESH_SECRET, {
    expiresIn: env.JWT_REFRESH_EXPIRY,
  })
}

export const generateTokenPair = (userId) => ({
  accessToken:  generateAccessToken(userId),
  refreshToken: generateRefreshToken(userId),
})

export const verifyAccessToken = (token) => {
  return jwt.verify(token, env.JWT_SECRET)
}

export const verifyRefreshToken = (token) => {
  return jwt.verify(token, env.JWT_REFRESH_SECRET)
}