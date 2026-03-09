import express from "express"
import cors from "cors"

import authRoutes from "./routes/auth.routes.js"
import matchRoutes from "./routes/match.routes.js"

const app = express()

app.use(cors())
app.use(express.json())

app.use("/api/auth", authRoutes)
app.use("/api/drivers", matchRoutes)

// Error handling middleware
app.use((err, req, res, next) => {
  console.error("Error:", err.message)
  
  // Handle validation errors from AJV
  if (err.validationErrors) {
    return res.status(400).json({
      errors: err.validationErrors
    })
  }
  
  // Handle operational errors (custom AppError)
  if (err.isOperational) {
    return res.status(err.statusCode || 400).json({
      message: err.message
    })
  }
  
  // Handle unexpected errors
  return res.status(500).json({
    message: "Internal server error"
  })
})

export default app
