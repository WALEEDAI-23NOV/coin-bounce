const Joi = require("joi");
const User = require("../models/user");
const bcrypt = require("bcryptjs");
const UserDTO = require("../dto/user");
const JWTService = require("../service/JWTService");
const RefreshToken = require("../models/token");
const passwordPattern =
  /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;

const authController = {
  async register(req, res, next) {
    const registerSchema = Joi.object({
      // validate user input
      username: Joi.string().min(5).max(30).required(),
      name: Joi.string().max(50).required(),
      email: Joi.string().email().required(),
      password: Joi.string().pattern(passwordPattern).required(),
      confirmPassword: Joi.ref("password"),
    });

    const { error } = registerSchema.validate(req.body);
    //2 if error in validation -> return error via middleware
    if (error) {
      return next(error);
    }
    //3 if username or email already registered
    const { username, email, password, name } = req.body;

    try {
      const emailInUse = await User.exists({ email });

      const usernameInUse = await User.exists({ username });

      if (emailInUse) {
        const error = {
          status: 409,
          message: "Email already registered, use another email!",
        };

        return next(error);
      }
      if (usernameInUse) {
        const error = {
          status: 409,
          message: "Username not available, choose another username!",
        };

        return next(error);
      }
    } catch (error) {
      return next(error);
    }

    // 4 Password hashed
    const hashedPassword = await bcrypt.hash(password, 10);
    // store user data in db
    let accessToken;
    let refreshToken;
    let user;
    try {
      const userToRegister = new User({
        username: username,
        name: name,
        email: email,
        password: hashedPassword,
      });
      user = await userToRegister.save();
      //token generation

      accessToken = JWTService.signAccessToken({ _id: user._id },"30m");
      refreshToken = JWTService.signRefreshToken({ _id: user._id }, "60m");
    } catch (error) {
      return next(error);
    }
    // store refresh token
    await JWTService.storeRefreshToken(refreshToken, user._id);
    // send token in cookies
    res.cookie("accessToken", accessToken, {
      maxAge: 1000 * 60 * 60 * 24,
      httpOnly: true,
    });

    res.cookie("refreshToken", refreshToken, {
      maxAge: 1000 * 60 * 60 * 24,
      httpOnly: true,
    });

    // 5 send response
    const userDto = new UserDTO(user);
    return res.status(201).json({ user: userDto, auth: true });
  },

  async login(req, res, next) {
    //1- validate user input
    const userLoginSchema = Joi.object({
      username: Joi.string().min(5).max(30).required(),
      password: Joi.string().pattern(passwordPattern),
    });
    //2- if validation error, return error
    const { error } = userLoginSchema.validate(req.body);

    if (error) {
      return next(error);
    }
    //3- match username and password
    const { username, password } = req.body;
    let user;
    try {
      //match username
      user = await User.findOne({ username: username });

      if (!user) {
        const error = {
          status: 401,
          message: "Invalid username",
        };
        return next(error);
      }

      // match password
      // req.body.password -> hashed -> match
      const match = await bcrypt.compare(password, user.password);

      if (!match) {
        const error = {
          status: 401,
          message: "Invalid password",
        };
        return next(error);
      }
    } catch (error) {
      return next(error);
    }
    const accessToken = JWTService.signAccessToken({ _id: user._id }, "30m");
    const refreshToken = JWTService.signRefreshToken({ _id: user._id }, "60m");

    //update refresh token in database
    try {
      await RefreshToken.updateOne(
        {
          _id: user._id,
        },
        { token: refreshToken },
        { upsert: true }
      );
    } catch (error) {
      return next(error);
    }

    res.cookie("accessToken", accessToken, {
      maxAge: 1000 * 60 * 60 * 24,
      httpOnly: true,
    });

    res.cookie("refreshToken", refreshToken, {
      maxAge: 1000 * 60 * 60 * 24,
      httpOnly: true,
    });

    //4- return response
    const userDto = new UserDTO(user);
    return res.status(200).json({ user: userDto, auth: true });
  },
  async logout(req, res, next){
    // 1.delete refresh token
    const { refreshToken } = req.cookies;

    try {
      
    } catch (error) {
      
    }

  }
};

module.exports = authController;
