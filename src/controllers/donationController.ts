import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const createDonation = async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: 'User not authenticated' });
    }

    const { amount } = req.body;

    // Create donation
    const donation = await prisma.donation.create({
      data: {
        amount: parseFloat(amount),
        userId: req.user.id,
      },
      include: {
        user: {
          select: {
            id: true,
            username: true,
          },
        },
      },
    });

    res.status(201).json({
      message: 'Donation created successfully',
      donation,
    });
  } catch (error) {
    console.error('Create donation error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const getUserDonations = async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: 'User not authenticated' });
    }

    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const skip = (page - 1) * limit;

    const [donations, total] = await Promise.all([
      prisma.donation.findMany({
        where: {
          userId: req.user.id,
        },
        skip,
        take: limit,
        orderBy: {
          createdAt: 'desc',
        },
      }),
      prisma.donation.count({
        where: {
          userId: req.user.id,
        },
      }),
    ]);

    res.json({
      donations,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Get user donations error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const getAllDonations = async (req: Request, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const skip = (page - 1) * limit;

    const [donations, total] = await Promise.all([
      prisma.donation.findMany({
        skip,
        take: limit,
        include: {
          user: {
            select: {
              id: true,
              username: true,
              age: true,
            },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
      }),
      prisma.donation.count(),
    ]);

    res.json({
      donations,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Get all donations error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const createDonationByAdmin = async (req: Request, res: Response) => {
  try {
    const { amount, userId } = req.body;

    // Verify user exists
    const user = await prisma.user.findUnique({
      where: { id: parseInt(userId) },
    });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Create donation
    const donation = await prisma.donation.create({
      data: {
        amount: parseFloat(amount),
        userId: parseInt(userId),
      },
      include: {
        user: {
          select: {
            id: true,
            username: true,
            age: true,
          },
        },
      },
    });

    res.status(201).json({
      message: 'Donation created successfully',
      donation,
    });
  } catch (error) {
    console.error('Create donation by admin error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};