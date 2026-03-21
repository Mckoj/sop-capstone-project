import { prisma } from '@/lib/prisma';
import TransactionsClient from '@/app/manager/transactions/TransactionsClient';

export const dynamic = 'force-dynamic';

export default async function TransactionsPage() {
  // Fetch all live sales
  const sales = await prisma.sale.findMany({
    include: {
      user: true,
      items: true
    },
    orderBy: {
      createdAt: 'desc'
    }
  });

  // Serialize the Prisma entities into the exact shape the UI expects
  const serializedTransactions = sales.map(sale => {
    const saleDate = new Date(sale.createdAt);
    return {
      id: sale.id.slice(0, 8).toUpperCase(),
      date: saleDate.toLocaleDateString('en-CA'), // YYYY-MM-DD format
      time: saleDate.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true }),
      cashier: sale.user.name,
      customer: undefined, // Customer relations not implemented yet
      items: sale.items.reduce((sum, item) => sum + item.quantity, 0),
      subtotal: sale.totalAmount, // Mocking flat total since tax/discount columns don't exist
      tax: 0,
      discount: 0,
      total: sale.totalAmount,
      paymentMethod: 'cash', // Defaulted to cash since no payment column exists
      status: 'completed'    // Defaulted completed since no status column exists
    };
  });

  // Pass it directly into the interactive React boundary
  return <TransactionsClient initialTransactions={serializedTransactions} />;
}
