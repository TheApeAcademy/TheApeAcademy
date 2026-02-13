import { PrismaClient } from '@prisma/client';
import bcryptjs from 'bcryptjs';
import { ValidationError, ConflictError, NotFoundError, AuthError } from '../utils/errors.mjs';
import { generateToken } from '../utils/jwt.mjs';

const prisma = new PrismaClient();

export const AuthService = {
  /**
   * Sign up a new user
   */
  async signup(data) {
    const { fullName, email, password, region, country, educationLevel, departmentOrCourse } = data;

    // Validate input
    if (!fullName || !email || !password) {
      throw new ValidationError('fullName, email, and password are required');
    }

    // Check if email already exists
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      throw new ConflictError('Email already registered');
    }

    // Hash password
    const salt = await bcryptjs.genSalt(10);
    const passwordHash = await bcryptjs.hash(password, salt);

    // Create user
    const user = await prisma.user.create({
      data: {
        fullName,
        email,
        passwordHash,
        region: region || 'Unknown',
        country: country || 'Unknown',
        educationLevel: educationLevel || 'high school',
        departmentOrCourse: departmentOrCourse || null,
      },
    });

    const token = generateToken(user.id);

    // Return user without password hash
    return {
      user: {
        id: user.id,
        fullName: user.fullName,
        email: user.email,
        region: user.region,
        country: user.country,
        educationLevel: user.educationLevel,
      },
      token,
    };
  },

  /**
   * Log in a user
   */
  async login(email, password) {
    if (!email || !password) {
      throw new ValidationError('Email and password are required');
    }

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      throw new AuthError('Invalid email or password');
    }

    const isPasswordValid = await bcryptjs.compare(password, user.passwordHash);
    if (!isPasswordValid) {
      throw new AuthError('Invalid email or password');
    }

    const token = generateToken(user.id);

    return {
      user: {
        id: user.id,
        fullName: user.fullName,
        email: user.email,
        region: user.region,
        country: user.country,
        educationLevel: user.educationLevel,
      },
      token,
    };
  },

  /**
   * Get current user by ID
   */
  async getCurrentUser(userId) {
    if (!userId) {
      throw new AuthError('User ID is required');
    }

    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      throw new NotFoundError('User not found');
    }

    return {
      id: user.id,
      fullName: user.fullName,
      email: user.email,
      region: user.region,
      country: user.country,
      educationLevel: user.educationLevel,
      departmentOrCourse: user.departmentOrCourse,
      createdAt: user.createdAt,
    };
  },
};

export default AuthService;
