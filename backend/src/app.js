//app.js
import express from "express"
import cors from "cors"

import authRoutes from "./routes/auth.routes.js"
import matchRoutes from "./routes/match.routes.js"

const app = express()

app.use(cors())
app.use(express.json())

app.use("/api/auth", authRoutes)
app.use("/api/drivers", matchRoutes)

export default app