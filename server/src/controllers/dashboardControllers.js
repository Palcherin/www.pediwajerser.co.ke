import { prisma } from '../config/db.js';

export const getDashboardStats = async (req, res) => {
  try {
    const [
      totalOrders,
      totalProducts,
      totalRevenue,
      recentOrders,
      pendingOrders,
    ] = await Promise.all([
      prisma.order.count(),
      prisma.product.count(),
      prisma.order.aggregate({
        _sum: { totalAmount: true },
        where: { status: { not: 'CANCELLED' } },
      }),
      prisma.order.findMany({
        take: 5,
        orderBy: { createdAt: 'desc' },
        select: {
          id:           true,
          customerName: true,
          totalAmount:  true,
          status:       true,
          createdAt:    true,
          paymentMethod:true,
        },
      }),
      prisma.order.count({ where: { status: 'PENDING' } }),
    ]);

    res.json({
      status: 'success',
      data: {
        totalOrders,
        totalProducts,
        totalRevenue: totalRevenue._sum.totalAmount || 0,
        pendingOrders,
        recentOrders,
      },
    });
  } catch (err) {
    console.error('Dashboard stats error:', err);
    res.status(500).json({ status: 'error', message: err.message });
  }
};