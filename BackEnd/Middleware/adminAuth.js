import jwt from 'jsonwebtoken'

const adminAuth =  (req, res, next) => {
    try{
        const token =  req.headers.authorization.split(' ')[1]
    const decoded =  jwt.verify(token, process.env.JWT_SECRET)
    if(decoded.email !== process.env.ADMIN_EMAIL || decoded.password !== process.env.ADMIN_PASSWORD) {
        return res.status(401).json({ message: 'Unauthorized' })
        }
        next()
    }
    catch(error){
        return res.status(401).json({ message: 'Unauthorized' })
    }
}
export default adminAuth