import express from 'express'
import adminAuth from '../Middleware/adminAuth.js'
import { LoginUser, RegisterUser, adminLogin, getAllUsers } from '../Controllers/UserController.js'
const UserRouter = express.Router()

UserRouter.post('/login', LoginUser)

UserRouter.post('/register', RegisterUser)


UserRouter.post('/admin', adminLogin)

UserRouter.get('/all-users', adminAuth, getAllUsers)
 
export default UserRouter
