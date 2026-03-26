import { prisma } from '@/lib/prisma';
import {
  ShoppingBag, Package, Users, Receipt,
  AlertCircle, TrendingUp, Clock, CheckCircle, XCircle,
} from 'lucide-react';
import Link from 'next/link';

export const dynamic = 'force-dynamic'; // Always fetch fresh data

export default async function DashboardPage() {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const [
    todaySalesAgg,
    allTimeSalesAgg,
    productsCount,
    usersCount,
    lowStockProducts,
    recentSales,
    topProducts,
    pendingSales,
  ] = await Promise.all([
    // Today's sales total (paid only)
    prisma.sale.aggregate({
      where: { createdAt: { gte: today }, paymentStatus: 'paid' },
      _sum: { totalAmount: true },
      _count: true,
    }),
    // All-time sales total
    prisma.sale.aggregate({
      where: { paymentStatus: 'paid' },
      _sum: { totalAmount: true },
    }),
    // Total product count
    prisma.product.count(),
    // Staff / user count
    prisma.user.count(),
    // Low stock (≤ 10 remaining)
    prisma.product.findMany({
      where: { quantity: { lte: 10 } },
      include: { category: true },
      orderBy: { quantity: 'asc' },
      take: 6,
    }),
    // Last 8 sales
    prisma.sale.findMany({
      orderBy: { createdAt: 'desc' },
      take: 8,
      include: { items: true, user: { select: { name: true } } },
    }),
    // Top 6 products by units sold
    prisma.saleItem.groupBy({
      by: ['productId'],
      _sum: { quantity: true },
      orderBy: { _sum: { quantity: 'desc' } },
      take: 6,
    }),
    // Pending (unverified) digital payments
    prisma.sale.count({ where: { paymentStatus: 'pending' } }),
  ]);

  // Hydrate top products with names
  const topProductIds = topProducts.map(p => p.productId);
  const topProductDetails = await prisma.product.findMany({
    where: { id: { in: topProductIds } },
    select: { id: true, name: true, price: true, category: { select: { name: true } } },
  });
  const topProductMap = Object.fromEntries(topProductDetails.map(p => [p.id, p]));

  const todayTotal = todaySalesAgg._sum.totalAmount ?? 0;
  const allTimeTotal = allTimeSalesAgg._sum.totalAmount ?? 0;
  const todayCount = todaySalesAgg._count;

  const stats = [
    {
      label: "Today's Revenue",
      value: `GH₵ ${todayTotal.toFixed(2)}`,
      sub: `${todayCount} transaction${todayCount !== 1 ? 's' : ''} today`,
      icon: ShoppingBag,
      bg: 'bg-primary/10',
      color: 'text-primary',
    },
    {
      label: 'Total Products',
      value: productsCount.toString(),
      sub: `${lowStockProducts.length} running low`,
      icon: Package,
      bg: 'bg-accent/10',
      color: 'text-accent',
    },
    {
      label: 'Staff & Users',
      value: usersCount.toString(),
      sub: 'Registered accounts',
      icon: Users,
      bg: 'bg-accent/10',
      color: 'text-accent',
    },
    {
      label: 'All-time Revenue',
      value: `GH₵ ${allTimeTotal.toFixed(2)}`,
      sub: `${pendingSales} pending payment${pendingSales !== 1 ? 's' : ''}`,
      icon: TrendingUp,
      bg: 'bg-primary/10',
      color: 'text-primary',
    },
  ];

  const statusIcon = (status: string) => {
    if (status === 'paid') return <CheckCircle className="w-4 h-4 text-green-500" />;
    if (status === 'pending') return <Clock className="w-4 h-4 text-amber-500" />;
    return <XCircle className="w-4 h-4 text-red-500" />;
  };

  const methodLabel: Record<string, string> = {
    cash: 'Cash',
    card: 'Card',
    mobile: 'Mobile Money',
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold mb-1">Dashboard</h1>
        <p className="text-muted-foreground text-sm">
          Live overview of your store —{' '}
          {new Date().toLocaleDateString('en-GH', {
            weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
          })}
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <div
              key={stat.label}
              className="bg-card border border-border rounded-xl p-5 shadow-sm flex flex-col gap-3"
            >
              <div className="flex items-start justify-between">
                <div className={`p-2.5 rounded-lg ${stat.bg} ${stat.color}`}>
                  <Icon className="w-5 h-5" />
                </div>
              </div>
              <div>
                <p className="text-2xl font-bold tracking-tight">{stat.value}</p>
                <p className="text-sm font-medium text-muted-foreground mt-0.5">{stat.label}</p>
                <p className="text-xs text-muted-foreground mt-1">{stat.sub}</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Middle row: Recent Sales + Low Stock */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Transactions */}
        <div className="bg-card border border-border rounded-xl overflow-hidden shadow-sm">
          <div className="flex items-center justify-between px-5 py-4 border-b border-border">
            <div className="flex items-center gap-2">
              <Receipt className="w-4 h-4 text-primary" />
              <h2 className="font-semibold text-base">Recent Transactions</h2>
            </div>
            <Link
              href="/admin/reports"
              className="text-xs text-primary hover:underline font-medium"
            >
              View all
            </Link>
          </div>
          <div className="divide-y divide-border">
            {recentSales.length === 0 ? (
              <p className="text-sm text-muted-foreground px-5 py-8 text-center">No sales yet today.</p>
            ) : (
              recentSales.map((sale) => (
                <div
                  key={sale.id}
                  className="flex items-center justify-between px-5 py-3 hover:bg-muted/30 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    {statusIcon(sale.paymentStatus)}
                    <div>
                      <p className="text-sm font-medium leading-tight">
                        {methodLabel[sale.paymentMethod] ?? sale.paymentMethod}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(sale.createdAt).toLocaleTimeString('en-GH', {
                          hour: '2-digit', minute: '2-digit',
                        })}
                        {' '}· {sale.items.length} item{sale.items.length !== 1 ? 's' : ''}
                        {sale.user?.name ? ` · ${sale.user.name}` : ''}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold text-primary">
                      GH₵ {sale.totalAmount.toFixed(2)}
                    </p>
                    <span
                      className={`text-xs font-medium px-1.5 py-0.5 rounded ${
                        sale.paymentStatus === 'paid'
                          ? 'bg-green-500/10 text-green-600 dark:text-green-400'
                          : 'bg-amber-500/10 text-amber-600 dark:text-amber-400'
                      }`}
                    >
                      {sale.paymentStatus}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Low Stock Alert */}
        <div className="bg-card border border-border rounded-xl overflow-hidden shadow-sm">
          <div className="flex items-center justify-between px-5 py-4 border-b border-border">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-destructive" />
              <h2 className="font-semibold text-base">Low Stock Alert</h2>
            </div>
            <Link
              href="/admin/inventory"
              className="text-xs text-primary hover:underline font-medium"
            >
              Manage inventory
            </Link>
          </div>
          <div className="divide-y divide-border">
            {lowStockProducts.length === 0 ? (
              <p className="text-sm text-muted-foreground px-5 py-8 text-center">
                All products are well stocked ✓
              </p>
            ) : (
              lowStockProducts.map((product) => (
                <div
                  key={product.id}
                  className="flex items-center justify-between px-5 py-3 hover:bg-muted/30 transition-colors"
                >
                  <div>
                    <p className="text-sm font-medium leading-tight">{product.name}</p>
                    <p className="text-xs text-muted-foreground">{product.category?.name}</p>
                  </div>
                  <div className="text-right">
                    <p
                      className={`text-sm font-bold ${
                        product.quantity === 0 ? 'text-destructive' : 'text-amber-500'
                      }`}
                    >
                      {product.quantity === 0 ? 'Out of stock' : `${product.quantity} left`}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {product.quantity === 0 ? 'Restock urgent' : 'Restock soon'}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Top Selling Products */}
      <div className="bg-card border border-border rounded-xl overflow-hidden shadow-sm">
        <div className="flex items-center justify-between px-5 py-4 border-b border-border">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-primary" />
            <h2 className="font-semibold text-base">Top Selling Products</h2>
          </div>
          <Link
            href="/admin/products"
            className="text-xs text-primary hover:underline font-medium"
          >
            View all products
          </Link>
        </div>
        {topProducts.length === 0 ? (
          <p className="text-sm text-muted-foreground px-5 py-8 text-center">
            No sales data yet — top products will appear here.
          </p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 divide-y sm:divide-y-0 sm:divide-x divide-border">
            {topProducts.map((item, i) => {
              const product = topProductMap[item.productId];
              if (!product) return null;
              return (
                <div key={item.productId} className="flex items-center gap-3 px-5 py-4">
                  <div className="w-9 h-9 rounded-lg bg-primary/10 text-primary flex items-center justify-center font-bold text-sm shrink-0">
                    #{i + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{product.name}</p>
                    <p className="text-xs text-muted-foreground">{product.category?.name}</p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-sm font-semibold text-primary">
                      GH₵ {product.price.toFixed(2)}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {item._sum.quantity} sold
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
