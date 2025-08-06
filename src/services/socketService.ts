import { Server as SocketServer } from 'socket.io';
import { Server as HttpServer } from 'http';
import { prisma } from '../index';

export class SocketService {
  private io: SocketServer;

  constructor(server: HttpServer) {
    this.io = new SocketServer(server, {
      cors: {
        origin: [
          'http://localhost:5173',
          'http://127.0.0.1:5173',
          ...(process.env.FRONTEND_URL ? [process.env.FRONTEND_URL] : [])
        ],
        credentials: true,
      },
    });

    this.setupEventHandlers();
  }

  private setupEventHandlers() {
    this.io.on('connection', (socket) => {
      console.log('Client connected:', socket.id);

      // Handle admin dashboard subscription
      socket.on('subscribe:admin-dashboard', async () => {
        socket.join('admin-dashboard');
        await this.emitDashboardStats(socket);
      });

      socket.on('disconnect', () => {
        console.log('Client disconnected:', socket.id);
      });
    });
  }

  // Emit dashboard stats to all connected admin clients
  public async emitDashboardStats(socket?: any) {
    try {
      const [
        totalUsers,
        totalDonations,
        monthlyStats,
        weeklyStats,
        dailyStats,
        annualStats,
      ] = await Promise.all([
        prisma.user.count(),
        prisma.donation.aggregate({
          _sum: { amount: true },
          _count: true,
        }),
        this.getTimeRangeStats('month'),
        this.getTimeRangeStats('week'),
        this.getTimeRangeStats('day'),
        this.getTimeRangeStats('year'),
      ]);

      const stats = {
        totalUsers,
        totalDonations: {
          amount: totalDonations._sum.amount || 0,
          count: totalDonations._count || 0,
        },
        monthly: monthlyStats,
        weekly: weeklyStats,
        daily: dailyStats,
        annual: annualStats,
      };

      if (socket) {
        socket.emit('dashboard:stats', stats);
      } else {
        this.io.to('admin-dashboard').emit('dashboard:stats', stats);
      }
    } catch (error) {
      console.error('Error emitting dashboard stats:', error);
    }
  }

  private async getTimeRangeStats(range: 'day' | 'week' | 'month' | 'year') {
    const now = new Date();
    let startDate = new Date();

    switch (range) {
      case 'day':
        startDate.setHours(0, 0, 0, 0);
        break;
      case 'week':
        startDate.setDate(now.getDate() - 7);
        break;
      case 'month':
        startDate.setMonth(now.getMonth() - 1);
        break;
      case 'year':
        startDate.setFullYear(now.getFullYear() - 1);
        break;
    }

    const stats = await prisma.donation.aggregate({
      where: {
        createdAt: {
          gte: startDate,
          lte: now,
        },
      },
      _sum: { amount: true },
      _count: true,
    });

    return {
      amount: stats._sum.amount || 0,
      count: stats._count || 0,
    };
  }

  // Method to notify about new donations
  public async notifyNewDonation(donationData: any) {
    this.io.to('admin-dashboard').emit('donation:new', donationData);
    await this.emitDashboardStats();
  }
}