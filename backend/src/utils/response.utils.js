export const sendSuccess = (res, data = {}, statusCode = 200) => {
  return res.status(statusCode).json({ success: true, data })
}

export const sendCreated = (res, data = {}) => {
  return sendSuccess(res, data, 201)
}