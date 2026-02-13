import { AuthService } from '../services/auth.mjs';

export const AuthController = {
  async signup(req, res, next) {
    try {
      const result = await AuthService.signup(req.body);
      res.status(201).json({
        message: 'Signup successful',
        ...result,
      });
    } catch (err) {
      next(err);
    }
  },

  async login(req, res, next) {
    try {
      const { email, password } = req.body;
      const result = await AuthService.login(email, password);
      res.status(200).json({
        message: 'Login successful',
        ...result,
      });
    } catch (err) {
      next(err);
    }
  },

  async getMe(req, res, next) {
    try {
      const user = await AuthService.getCurrentUser(req.userId);
      res.status(200).json({
        user,
      });
    } catch (err) {
      next(err);
    }
  },
};

export default AuthController;
