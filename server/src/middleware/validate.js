function validate(schema) {
  return (req, res, next) => {
    const errors = []
    for (const [field, rules] of Object.entries(schema)) {
      const val = req.body[field]
      if (rules.required && (val === undefined || val === null || val === '')) {
        errors.push(`${field} is required`)
        continue
      }
      if (rules.email && val && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val)) {
        errors.push(`${field} must be a valid email`)
      }
      if (rules.minLength && val && val.length < rules.minLength) {
        errors.push(`${field} must be at least ${rules.minLength} characters`)
      }
      if (rules.isInt && val !== undefined) {
        const n = Number(val)
        if (!Number.isInteger(n) || n < (rules.min ?? -Infinity)) {
          errors.push(`${field} must be an integer${rules.min !== undefined ? ` >= ${rules.min}` : ''}`)
        }
      }
      if (rules.isDate && val) {
        if (isNaN(Date.parse(val))) errors.push(`${field} must be a valid date`)
      }
    }
    if (errors.length) {
      const err = new Error(errors.join(', '))
      err.status = 400
      return next(err)
    }
    next()
  }
}

module.exports = validate
