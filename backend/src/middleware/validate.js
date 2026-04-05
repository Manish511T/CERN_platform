import { ValidationError } from '../shared/errors.js'

const validate = (schema) => (req, res, next) => {
  const result = schema.safeParse({
    body:   req.body,
    params: req.params,
    query:  req.query,
  })

  if (!result.success) {
    const messages = result.error.errors
      .map(e => `${e.path.slice(1).join('.')}: ${e.message}`)
      .join('; ')
    throw new ValidationError(messages)
  }

  // Only reassign body and params — never reassign req.query directly
  if (result.data.body)   req.body   = result.data.body
  if (result.data.params) req.params = result.data.params

  // Merge parsed query values into existing req.query instead of replacing it
  if (result.data.query) {
    Object.assign(req.query, result.data.query)
  }

  next()
}

export default validate