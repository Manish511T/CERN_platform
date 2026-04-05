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

  req.body   = result.data.body   ?? req.body
  req.params = result.data.params ?? req.params
  req.query  = result.data.query  ?? req.query

  next()
}

export default validate