import { prisma } from "@/lib/prisma";
import { DollarSign, Package, Users, Receipt } from "lucide-react";

export default async function AdminDashboard() {
  // Fetch real aggregated data using Server Components
  const [salesAgg, productsCount, usersCount, transactionsCount] = await Promise.all([
    prisma.sale.aggregate({ _sum: { totalAmount: true } }),
    prisma.product.count(),
    prisma.user.count(),
    prisma.sale.count(),
  ]);

  const totalSales = salesAgg._sum.totalAmount || 0;

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-6">Dashboard Summary</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Total Sales */}
        <div className="bg-card border border-border rounded-xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-muted-foreground">Total Sales</h3>
            <div className="p-2 bg-primary/10 rounded-lg text-primary">
              <DollarSign className="w-5 h-5" />
            </div>
          </div>
          <p className="text-3xl font-bold">GH₵ {totalSales.toFixed(2)}</p>
        </div>

        {/* Products */}
        <div className="bg-card border border-border rounded-xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-muted-foreground">Total Products</h3>
            <div className="p-2 bg-blue-500/10 rounded-lg text-blue-500">
              <Package className="w-5 h-5" />
            </div>
          </div>
          <p className="text-3xl font-bold">{productsCount}</p>
        </div>

        {/* Customers / Users */}
        <div className="bg-card border border-border rounded-xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-muted-foreground">Staff & Users</h3>
            <div className="p-2 bg-purple-500/10 rounded-lg text-purple-500">
              <Users className="w-5 h-5" />
            </div>
          </div>
          <p className="text-3xl font-bold">{usersCount}</p>
        </div>

        {/* Transactions */}
        <div className="bg-card border border-border rounded-xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-muted-foreground">Transactions</h3>
            <div className="p-2 bg-green-500/10 rounded-lg text-green-500">
              <Receipt className="w-5 h-5" />
            </div>
          </div>
          <p className="text-3xl font-bold">{transactionsCount}</p>
        </div>
      </div>
    </div>
  );
}
