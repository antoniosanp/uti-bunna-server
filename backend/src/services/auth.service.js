//auth.service.js
import * as userRepository from "../repositories/user.repository.js"
import {hashPassword, verifyPassword} from "../utils/hash.js"
import {generateToken} from "../utils/jwt.js"
import {getRouteFromOSRM} from "../utils/route.js"
import {AppError} from "../middlewares/AppError.js"

export const register = async (userData) => {
  const { fullName, email, password, role, shift, phone, address, location } = userData

  const existingUser = await userRepository.findUserByEmail(email)

  if(existingUser.rowCount > 0){
     throw new AppError("Email already registered", 409)
  }

  const hashedPassword = await hashPassword(password)

  const user = await userRepository.createUser({
    fullName,
    email,
    passwordHash: hashedPassword,
    role,
    shift,
    phone,
    address,
    location
  })

  // If user is a driver, get route from OSRM and update driver record
  let driverData = null
  if (role === 'driver' && location && location.coordinates) {
    const [userLon, userLat] = location.coordinates
    const riwiLon = parseFloat(process.env.RIWI_LON)
    const riwiLat = parseFloat(process.env.RIWI_LAT)

    try {
      const { route, bbox } = await getRouteFromOSRM(userLon, userLat, riwiLon, riwiLat)
      
      driverData = await userRepository.updateDriverRoute(
        user.rows[0].user_id,
        route,
        bbox
      )
    } catch (error) {
      console.error('Error getting route from OSRM:', error.message)
      // Continue without route data if OSRM fails
    }
  }

  const token = generateToken({
     id: user.rows[0].user_id,
     role: user.rows[0].role
  })

  return {
    user: user.rows[0],
    driver: driverData ? driverData.rows[0] : null,
    token
  }
}

export const login = async (credentials) => {
  const { email, password } = credentials

  const user = await userRepository.findUserByEmail(email)

  if (user.rowCount === 0) {
    throw new Error("Invalid credentials")
  }

  const isValidPassword = await verifyPassword(password, user.rows[0].password_hash)

  if (!isValidPassword) {
    throw new Error("Invalid credentials")
  }

  const token = generateToken({
    id: user.rows[0].user_id,
    role: user.rows[0].role
  })

  return {
    user: user.rows[0],
    token
  }
}

