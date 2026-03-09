
import Ajv from "ajv"
import addFormats from "ajv-formats"
import {registerSchema} from "../schemas/register.schema.js"
import {AppError} from "./AppError.js"

const ajv = new Ajv({ allErrors: true })
addFormats(ajv)

export const validate = (schema) => {
  const validate = ajv.compile(schema)
  return (req, res, next) => {
    const valid = validate(req.body)
    if (!valid) {
      const error = new AppError("Validation failed", 400)
      error.validationErrors = validate.errors
      return next(error)
    }
    next()
  }
}

