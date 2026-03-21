import { prisma } from '@/lib/prisma';
import { Users, Edit, Trash2, Shield, Clock, TrendingUp, Award } from 'lucide-react';
import AddStaffModal from './AddStaffModal';

export const dynamic = 'force-dynamic';

export default async function StaffPage() {
  // Define "Today" boundaries
  const startOfDay = new Date();
  startOfDay.setHours(0, 0, 0, 0);

  const endOfDay = new Date();
  endOfDay.setHours(23, 59, 59, 999);

  // Fetch all staff (Users) and their sales for today
  const users = await prisma.user.findMany({
    include: {
      sales: {
        where: {
          createdAt: {
            gte: startOfDay,
            lte: endOfDay,
          }
        }
      }
    },
    orderBy: { role: 'asc' }
  });

  // Process data for UI
  const staffMembers = users.map(user => {
    const todayTransactions = user.sales.length;
    const todaySales = user.sales.reduce((sum, sale) => sum + sale.totalAmount, 0);
    const hasWorkedToday = todayTransactions > 0;
    
    return {
      id: user.id,
      name: user.name || 'Unknown User',
      role: user.role.toLowerCase(), // 'admin', 'manager', 'cashier'
      email: user.email,
      phone: '+233 XX XXX XXXX', // Mocked, no phone in schema
      shift: hasWorkedToday ? 'Current Shift' : 'Off-Duty',
      status: hasWorkedToday ? 'active' : 'inactive',
      performance: { accuracy: 98, speed: 95, customerRating: 4.8 }, // Mocked metrics
      stats: { todayTransactions, todaySales, hoursWorked: hasWorkedToday ? 4.5 : 0 },
    };
  });

  // Calculate high-level stats based on actual data
  const totalActive = staffMembers.filter(s => s.status === 'active').length;
  const totalSalesAll = staffMembers.reduce((sum, s) => sum + s.stats.todaySales, 0);
  const avgAccuracy = staffMembers.length > 0 
    ? (staffMembers.reduce((sum, s) => sum + s.performance.accuracy, 0) / staffMembers.length).toFixed(1) 
    : '0.0';

  return (
    <div className="p-6 space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="mb-2 text-3xl font-bold">Staff Management</h1>
          <p className="text-muted-foreground">Monitor and manage your team</p>
        </div>
        <AddStaffModal />
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-card border border-border rounded-xl p-4 shadow-sm">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-green-500/10 rounded-lg border border-green-500/20">
              <Users className="w-5 h-5 text-green-500" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground font-medium">Active Now</p>
              <p className="text-2xl font-bold">{totalActive}</p>
            </div>
          </div>
        </div>
        <div className="bg-card border border-border rounded-xl p-4 shadow-sm">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-orange-500/10 rounded-lg border border-orange-500/20">
              <Clock className="w-5 h-5 text-orange-500" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground font-medium">Off Duty</p>
              <p className="text-2xl font-bold">{staffMembers.length - totalActive}</p>
            </div>
          </div>
        </div>
        <div className="bg-card border border-border rounded-xl p-4 shadow-sm">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-blue-500/10 rounded-lg border border-blue-500/20">
              <TrendingUp className="w-5 h-5 text-blue-500" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground font-medium">Total Sales</p>
              <p className="text-2xl font-bold text-primary">GH₵ {totalSalesAll.toFixed(2)}</p>
            </div>
          </div>
        </div>
        <div className="bg-card border border-border rounded-xl p-4 shadow-sm">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-purple-500/10 rounded-lg border border-purple-500/20">
              <Award className="w-5 h-5 text-purple-500" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground font-medium">Avg Accuracy</p>
              <p className="text-2xl font-bold text-purple-600">
                {avgAccuracy}%
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Staff Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
        {staffMembers.map(staff => (
          <div key={staff.id} className="bg-card border border-border rounded-xl p-6 hover:shadow-md transition-shadow">
            {/* Header */}
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center shrink-0">
                  <Users className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h3 className="mb-1 font-bold text-lg">{staff.name}</h3>
                  <div className="flex items-center gap-2">
                    <span className={`px-2 py-1 rounded-md font-bold text-xs border ${
                      staff.role === 'manager' || staff.role === 'admin'
                        ? 'bg-purple-500/10 text-purple-500 border-purple-500/20'
                        : 'bg-blue-500/10 text-blue-500 border-blue-500/20'
                    }`}>
                      {(staff.role === 'manager' || staff.role === 'admin') ? <Shield className="w-3 h-3 inline mr-1" /> : null}
                      {staff.role.charAt(0).toUpperCase() + staff.role.slice(1)}
                    </span>
                    <span className={`px-2 py-1 rounded-full text-xs font-bold border ${
                      staff.status === 'active'
                        ? 'bg-green-500/10 text-green-500 border-green-500/20'
                        : 'bg-zinc-500/10 text-zinc-500 border-zinc-500/20'
                    }`}>
                      {staff.status === 'active' ? '● Active' : '○ Off Duty'}
                    </span>
                  </div>
                </div>
              </div>
              <div className="flex gap-1">
                <button className="p-2 hover:bg-primary/10 text-primary rounded-lg transition-colors border border-transparent hover:border-primary/20">
                  <Edit className="w-4 h-4" />
                </button>
                <button className="p-2 hover:bg-destructive/10 text-destructive rounded-lg transition-colors border border-transparent hover:border-destructive/20">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Contact Info */}
            <div className="mb-4 p-4 bg-muted/20 border border-border rounded-lg">
              <p className="text-xs font-bold text-muted-foreground mb-2 uppercase tracking-wider">Contact</p>
              <p className="text-sm font-medium mb-1">{staff.email}</p>
              <p className="text-sm">{staff.phone}</p>
            </div>

            {/* Shift Info */}
            <div className="mb-4 flex items-center gap-2 text-sm font-medium">
              <Clock className="w-4 h-4 text-muted-foreground" />
              <span className="text-muted-foreground">{staff.shift}</span>
            </div>

            {/* Today's Stats */}
            <div className="grid grid-cols-3 gap-3 mb-4">
              <div className="p-3 bg-muted/20 border border-border rounded-lg">
                <p className="text-xs font-bold text-muted-foreground mb-1">Transactions</p>
                <p className="font-bold text-lg">{staff.stats.todayTransactions}</p>
              </div>
              <div className="p-3 bg-muted/20 border border-border rounded-lg">
                <p className="text-xs font-bold text-muted-foreground mb-1 line-clamp-1">Sales Totals</p>
                <p className="font-bold text-lg text-primary">GH₵ {staff.stats.todaySales.toFixed(0)}</p>
              </div>
              <div className="p-3 bg-muted/20 border border-border rounded-lg">
                <p className="text-xs font-bold text-muted-foreground mb-1">Hours</p>
                <p className="font-bold text-lg">{staff.stats.hoursWorked}h</p>
              </div>
            </div>

            {/* Performance Metrics */}
            <div className="pt-4 border-t border-border mt-5">
              <p className="text-xs font-bold text-muted-foreground mb-3 uppercase tracking-wider">Performance Metrics</p>
              <div className="space-y-3">
                <div>
                  <div className="flex justify-between text-sm mb-1.5">
                    <span className="font-medium text-muted-foreground">Accuracy</span>
                    <span className="font-bold">{staff.performance.accuracy}%</span>
                  </div>
                  <div className="h-2 bg-muted rounded-full overflow-hidden">
                    <div className="h-full bg-green-500 rounded-full" style={{ width: `${staff.performance.accuracy}%` }} />
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-1.5">
                    <span className="font-medium text-muted-foreground">Speed</span>
                    <span className="font-bold">{staff.performance.speed}%</span>
                  </div>
                  <div className="h-2 bg-muted rounded-full overflow-hidden">
                    <div className="h-full bg-blue-500 rounded-full" style={{ width: `${staff.performance.speed}%` }} />
                  </div>
                </div>
                <div className="flex justify-between text-sm pt-2">
                  <span className="font-medium text-muted-foreground">Customer Rating</span>
                  <span className="font-bold">{staff.performance.customerRating}/5.0 ⭐</span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
