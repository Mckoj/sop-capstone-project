"use client";

import {
  ShoppingBag,
  Users,
  Package,
  AlertCircle,
} from "lucide-react";
import { mockProducts } from "@/app/data/mockData";
import Link from "next/link";

export default function DashboardPage() {
  // Mock statistics
  const stats = [
    {
      label: "Today's Sales",
      value: "GH₵ 2,450.00",
      change: "+12.5%",
      icon: ShoppingBag,
      color: "text-blue-500",
    },
    {
      label: "Total Products",
      value: mockProducts.length.toString(),
      change: "+3",
      icon: Package,
      color: "text-green-500",
    },
    {
      label: "Customers",
      value: "156",
      change: "+8",
      icon: Users,
      color: "text-purple-500",
    },
    {
      label: "Low Stock Items",
      value: "5",
      change: "Alert",
      icon: AlertCircle,
      color: "text-red-500",
    },
  ];

  const lowStockProducts = mockProducts.filter((p) => p.stock < 50);

  const recentSales = [
    { id: "TXN001", time: "10:30 AM", items: 5, amount: 85.5, method: "Cash" },
    { id: "TXN002", time: "10:25 AM", items: 3, amount: 42.3, method: "Card" },
    {
      id: "TXN003",
      time: "10:15 AM",
      items: 7,
      amount: 128.0,
      method: "Mobile",
    },
    { id: "TXN004", time: "10:05 AM", items: 2, amount: 25.6, method: "Cash" },
    { id: "TXN005", time: "09:55 AM", items: 4, amount: 67.8, method: "Card" },
  ];

  return (
    <div className="p-6 space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="mb-2">Dashboard</h1>
        <p className="text-muted-foreground">
          Overview of your store performance
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div
              key={index}
              className="bg-card border border-border rounded-xl p-6"
            >
              <div className="flex items-start justify-between mb-4">
                <div className={`p-3 rounded-lg bg-background ${stat.color}`}>
                  <Icon className="w-6 h-6" />
                </div>
                <span
                  className={`text-sm ${stat.change.startsWith("+") ? "text-green-500" : stat.change === "Alert" ? "text-red-500" : "text-muted-foreground"}`}
                >
                  {stat.change}
                </span>
              </div>
              <h3 className="mb-1">{stat.value}</h3>
              <p className="text-sm text-muted-foreground">{stat.label}</p>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Sales */}
        <div className="bg-card border border-border rounded-xl p-6">
          <h2 className="mb-4">Recent Sales</h2>
          <div className="space-y-3">
            {recentSales.map((sale) => (
              <div
                key={sale.id}
                className="flex items-center justify-between p-3 bg-background rounded-lg"
              >
                <div>
                  <p className="font-medium">{sale.id}</p>
                  <p className="text-sm text-muted-foreground">
                    {sale.time} • {sale.items} items
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-semibold">GH₵ {sale.amount.toFixed(2)}</p>
                  <p className="text-sm text-muted-foreground">{sale.method}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Low Stock Alert */}
        <div className="bg-card border border-border rounded-xl p-6">
          <div className="flex items-center gap-2 mb-4">
            <AlertCircle className="w-5 h-5 text-red-500" />
            <h2>Low Stock Alert</h2>
          </div>
          <div className="space-y-3">
            {lowStockProducts.slice(0, 5).map((product) => (
              <div
                key={product.id}
                className="flex items-center justify-between p-3 bg-background rounded-lg border border-red-500/20"
              >
                <div>
                  <p className="font-medium">{product.name}</p>
                  <p className="text-sm text-muted-foreground">
                    {product.category?.name}
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-red-500">
                    {product.stock} left
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Restock needed
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Top Products */}
      <div className="bg-card border border-border rounded-xl p-6">
        <div className="flex items-center justify-between mb-4">
          <h2>Top Selling Products</h2>
          <Link href="/admin/products" className="text-sm text-primary hover:underline">
            View All
          </Link>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {mockProducts.slice(0, 6).map((product) => (
            <div
              key={product.id}
              className="flex items-center gap-3 p-3 bg-background rounded-lg"
            >
              <div className="w-12 h-12 bg-muted rounded-lg flex items-center justify-center">
                <Package className="w-6 h-6 text-muted-foreground" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium truncate">{product.name}</p>
                <p className="text-sm text-muted-foreground">
                  GH₵ {product.price.toFixed(2)}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
