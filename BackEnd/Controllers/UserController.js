import UserModel from "../Models/UserSchema.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import validator from "validator";

const LoginUser = async (req, res) => {
  try{
    const { email, password } = req.body;
    const user = await UserModel.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: "User not found" });
    }
    const isPasswordCorrect = await bcrypt.compare(password, user.password);
    if (!isPasswordCorrect) {
      return res.status(400).json({ message: "Invalid password" });
    }
    const jwtSecret = process.env.JWT_SECRET || "default_jwt_secret";
    const token = jwt.sign({ id: user._id }, jwtSecret, { expiresIn: '24h' });
    return res.status(200).json({ message: "User logged in successfully", token });
  }
  catch(error){
    return res.status(500).json({ message: error.message });
  }
};

const RegisterUser = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    const user = await UserModel.findOne({ email });
    if (user) {
      return res.status(400).json({ message: "User already exists" });
    }
    if (!validator.isEmail(email)) {
      return res.status(400).json({ message: "Invalid email" });
    }
    if (password.length < 8) {
      return res
        .status(400)
        .json({ message: "Password must be at least 8 characters long" });
    }
    if (!validator.isStrongPassword(password)) {
      return res.status(400).json({ message: "Enter a stronger password" });
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = await UserModel.create({
      name,
      email,
      password: hashedPassword,
    });
    const jwtSecret = process.env.JWT_SECRET || "default_jwt_secret";
    const token = jwt.sign({ id: newUser._id }, jwtSecret, { expiresIn: '24h' });
 

  return res.status(200).json({ message: "User registered successfully", token });
  } catch (error) {
   return res.status(500).json({ message: error.message });
  }
};
const adminLogin = async (req, res) => {
  try
  {
    const { email, password } = req.body;
    const adminEmail = process.env.ADMIN_EMAIL || "admin@example.com";
    const adminPassword = process.env.ADMIN_PASSWORD || "admin123";
    const jwtSecret = process.env.JWT_SECRET || "default_jwt_secret";
    
    if(email !== adminEmail || password !== adminPassword)  { 
      return res.status(400).json({ message: "You are not authorized to login as admin" });
    }
    else{
     const token = jwt.sign({email:email, password:password}, jwtSecret, { expiresIn: '24h' });
     return res.status(200).json({ message: "Admin logged in successfully", token });
    }
  }
  catch(error){
    return res.status(500).json({ message: error.message });
  }
};

const getAllUsers = async (req, res) => {
  try{
    const users = await UserModel.find();
    return res.status(200).json({ users });
  }
  catch(error){
    return res.status(500).json({ message: error.message });
  }
};

export { LoginUser, RegisterUser, adminLogin, getAllUsers  };
