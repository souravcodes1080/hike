import { json } from "express";
import { User } from "../models/user.model.js";
import bcrypt from "bcrypt";

const register = async (req, res, next) => {
  try {
    const { username, phonenumber, password } = req.body;
    const existingUser = await User.findOne({
      $or: [{ username }, { phonenumber }],
    });
    if (existingUser) {
      return res.status(400).json({
        message: "Username or Phonenumber exists.",
        status: false,
      });
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    const AVATAR_API = "https://api.multiavatar.com"
    const setAvatar = `${AVATAR_API}/${Math.round(Math.random()*1000)}`
    const user = await User.create({
      username,
      phonenumber,
      password: hashedPassword,
      avatar: setAvatar
    });

    delete user.password;
    return res.status(201).json({
      message: "User created sucessfully.",
      status: true,
      user,
    });
  } catch (error) {
    next(error);
  }
};

const login = async (req, res, next) => {
  try {
    const { phonenumber, password } = req.body;
    const existingUser = await User.findOne({ phonenumber });
    if (existingUser) {
      const matchPassword = await bcrypt.compare(password, existingUser.password);
      if (!matchPassword) {
        return res.status(201).json({
            message: "Wrong Password.",
            status: false,
          });
      }

    } else {
      return res.status(404).json({
        message: "User not found.",
        status: false,
      });
    }
    delete existingUser.password
    return res.status(200).json({
        message: "Login Sucessful",
        status: true,
        existingUser
      });
  } catch (error) {
    next(error);
  }
};

const getAllUsers = async (req, res, next)=>{
  try{
    const users = await User.find({_id:{$ne: req.params.id}}).select(
      ["_id", "username", "phonenumber", "avatar"]
    )
    return res.json(users)
  }catch(error){
    next(error)
  }
}

export { register, login, getAllUsers };
