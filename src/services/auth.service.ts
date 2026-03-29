import prisma from '../config/database';
import { hashPassword, comparePassword } from '../utils/password';
import { generateToken, generateRefreshToken } from '../utils/jwt';

export class AuthService {
  static async register(data: any) {
    const { email, password, name, phone, gender, dateOfBirth } = data;

    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) throw new Error('El usuario ya existe');

    const hashedPassword = await hashPassword(password);

    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name,
        phone,
        gender,
        dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : null,
      },
    });

    const token = generateToken({ id: user.id });
    const refreshToken = generateRefreshToken({ id: user.id });

    return { user: this.omitPassword(user), token, refreshToken };
  }

  static async login(data: any) {
    const { email, password } = data;

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) throw new Error('Credenciales inválidas');

    const isMatch = await comparePassword(password, user.password);
    if (!isMatch) throw new Error('Credenciales inválidas');

    const token = generateToken({ id: user.id });
    const refreshToken = generateRefreshToken({ id: user.id });

    await prisma.user.update({
      where: { id: user.id },
      data: { lastLoginAt: new Date() }
    });

    return { user: this.omitPassword(user), token, refreshToken };
  }

  static async getProfile(userId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        nutritionProfile: true,
        trainingProfile: true,
        notificationPref: true,
      }
    });
    if (!user) throw new Error('Usuario no encontrado');
    return this.omitPassword(user);
  }

  static async updateProfile(userId: string, data: any) {
    const updateData: Record<string, any> = {};

    if (data.name        !== undefined) updateData.name   = data.name;
    if (data.phone       !== undefined) updateData.phone  = data.phone;
    if (data.gender      !== undefined) updateData.gender = data.gender;
    if (data.dateOfBirth !== undefined) {
      if (data.dateOfBirth === null || data.dateOfBirth === '') {
        updateData.dateOfBirth = null;
      } else {
        const parsed = new Date(data.dateOfBirth);
        if (isNaN(parsed.getTime())) throw new Error('Fecha de nacimiento inválida');
        if (parsed > new Date()) throw new Error('La fecha de nacimiento no puede ser futura');
        updateData.dateOfBirth = parsed;
      }
    }

    const user = await prisma.user.update({
      where: { id: userId },
      data: updateData,
    });
    return this.omitPassword(user);
  }

  private static omitPassword(user: any) {
    const { password, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }
}
