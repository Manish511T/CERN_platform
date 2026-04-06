import { ValidationError } from '../shared/errors.js'

const validate = (schema) => (req, res, next) => {
  try {
    const result = schema.safeParse({
      body:   req.body,
      params: req.params,
      query:  req.query,
    })

    if (!result.success) {
      // Guard against undefined errors array
      const errors = result.error?.errors ?? []
      const messages = errors
        .map(e => `${e.path.slice(1).join('.')}: ${e.message}`)
        .join('; ')
      return next(new ValidationError(messages || 'Validation failed'))
    }

    if (result.data.body)   req.body   = result.data.body
    if (result.data.params) req.params = result.data.params

    if (result.data.query) {
      Object.assign(req.query, result.data.query)
    }

    next()
  } catch (err) {
    next(err)
  }
}

export default validate