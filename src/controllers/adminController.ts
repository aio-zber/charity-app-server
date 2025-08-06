import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { hashPassword, comparePassword, generateToken } from '../utils/auth';

const prisma = new PrismaClient();

export const registerAdmin = async (req: Request, res: Response) => {
  try {
    const { username, password } = req.body;

    // Check if admin already exists
    const existingAdmin = await prisma.admin.findUnique({
      where: { username },
    });

    if (existingAdmin) {
      return res.status(409).json({ message: 'Admin username already exists' });
    }

    // Hash password
    const hashedPassword = await hashPassword(password);

    // Create admin
    const admin = await prisma.admin.create({
      data: {
        username,
        password: hashedPassword,
      },
    });

    res.status(201).json({
      message: 'Admin registered successfully',
      admin: {
        id: admin.id,
        username: admin.username,
      },
    });
  } catch (error) {
    console.error('Admin registration error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const loginAdmin = async (req: Request, res: Response) => {
  try {
    const { username, password } = req.body;

    // Find admin
    const admin = await prisma.admin.findUnique({
      where: { username },
    });

    if (!admin) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Check password
    const isValidPassword = await comparePassword(password, admin.password);
    if (!isValidPassword) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Generate token
    const token = generateToken({
      id: admin.id,
      username: admin.username,
      type: 'admin',
    });

    res.json({
      message: 'Admin login successful',
      token,
      admin: {
        id: admin.id,
        username: admin.username,
      },
    });
  } catch (error) {
    console.error('Admin login error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const getDashboardStats = async (req: Request, res: Response) => {
  try {
    const now = new Date();
    const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const startOfWeek = new Date(startOfDay);
    startOfWeek.setDate(startOfDay.getDate() - startOfDay.getDay());
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfYear = new Date(now.getFullYear(), 0, 1);

    const [dailyDonations, weeklyDonations, monthlyDonations, annualDonations, totalUsers, totalDonations] = await Promise.all([
      prisma.donation.aggregate({
        where: {
          createdAt: {
            gte: startOfDay,
          },
        },
        _sum: {
          amount: true,
        },
        _count: true,
      }),
      prisma.donation.aggregate({
        where: {
          createdAt: {
            gte: startOfWeek,
          },
        },
        _sum: {
          amount: true,
        },
        _count: true,
      }),
      prisma.donation.aggregate({
        where: {
          createdAt: {
            gte: startOfMonth,
          },
        },
        _sum: {
          amount: true,
        },
        _count: true,
      }),
      prisma.donation.aggregate({
        where: {
          createdAt: {
            gte: startOfYear,
          },
        },
        _sum: {
          amount: true,
        },
        _count: true,
      }),
      prisma.user.count(),
      prisma.donation.aggregate({
        _sum: {
          amount: true,
        },
        _count: true,
      }),
    ]);

    res.json({
      daily: {
        amount: dailyDonations._sum.amount || 0,
        count: dailyDonations._count,
      },
      weekly: {
        amount: weeklyDonations._sum.amount || 0,
        count: weeklyDonations._count,
      },
      monthly: {
        amount: monthlyDonations._sum.amount || 0,
        count: monthlyDonations._count,
      },
      annual: {
        amount: annualDonations._sum.amount || 0,
        count: annualDonations._count,
      },
      totalUsers,
      totalDonations: {
        amount: totalDonations._sum.amount || 0,
        count: totalDonations._count,
      },
    });
  } catch (error) {
    console.error('Dashboard stats error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const getAllUsers = async (req: Request, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const skip = (page - 1) * limit;

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        skip,
        take: limit,
        select: {
          id: true,
          username: true,
          age: true,
          createdAt: true,
          donations: {
            select: {
              amount: true,
            },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
      }),
      prisma.user.count(),
    ]);

    const usersWithDonationTotal = users.map(user => ({
      ...user,
      totalDonations: user.donations.reduce((sum, donation) => sum + donation.amount, 0),
      donationCount: user.donations.length,
      donations: undefined,
    }));

    res.json({
      users: usersWithDonationTotal,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const createUser = async (req: Request, res: Response) => {
  try {
    const { username, password, age } = req.body;

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { username },
    });

    if (existingUser) {
      return res.status(409).json({ message: 'Username already exists' });
    }

    // Hash password
    const hashedPassword = await hashPassword(password);

    // Create user
    const user = await prisma.user.create({
      data: {
        username,
        password: hashedPassword,
        age: parseInt(age),
      },
      select: {
        id: true,
        username: true,
        age: true,
        createdAt: true,
      },
    });

    res.status(201).json({
      message: 'User created successfully',
      user,
    });
  } catch (error) {
    console.error('Create user error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const updateUser = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { username, password, age } = req.body;

    const updateData: any = {};

    if (username) {
      // Check if username is already taken by another user
      const existingUser = await prisma.user.findUnique({
        where: { username },
      });

      if (existingUser && existingUser.id !== parseInt(id)) {
        return res.status(409).json({ message: 'Username already exists' });
      }

      updateData.username = username;
    }

    if (age) {
      updateData.age = parseInt(age);
    }

    if (password) {
      updateData.password = await hashPassword(password);
    }

    const updatedUser = await prisma.user.update({
      where: { id: parseInt(id) },
      data: updateData,
      select: {
        id: true,
        username: true,
        age: true,
        updatedAt: true,
      },
    });

    res.json({
      message: 'User updated successfully',
      user: updatedUser,
    });
  } catch (error) {
    console.error('Update user error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const deleteUser = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    // Delete user (this will cascade delete donations due to foreign key constraint)
    await prisma.user.delete({
      where: { id: parseInt(id) },
    });

    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};