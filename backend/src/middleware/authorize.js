import { ForbiddenError } from '../shared/errors.js'

const authorize = (...roles) => (req, res, next) => {
  try {
    if (!roles.includes(req.user.role)) {
      return next(new ForbiddenError(`Required roles: ${roles.join(', ')}`))
    }
    next()
  } catch (err) {
    next(err)
  }
}

export default authorize