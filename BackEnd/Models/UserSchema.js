import mongoose from 'mongoose'

const userSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    CartData: { type: Object, default: {}, required: true },
    OrdersData: { type: Object, default: {}, required: true },
},{minimize: false})

const UserModel = mongoose.model('User', userSchema)
export default UserModel