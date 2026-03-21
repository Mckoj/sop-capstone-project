import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/auth';
import { headers } from 'next/headers';

interface SaleItem {
  productId: string;
  quantity: number;
  price: number;
}

interface SaleRequest {
  items: SaleItem[];
  subtotal: number;
  tax: number;
  total: number;
  paymentMethod: 'cash' | 'card';
}

export async function POST(req: Request) {
  try {
    const headersList = await headers();
    const session = await auth.api.getSession({
      headers: headersList,
    });

    if (!session || !session.user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
      });
    }

    const body: SaleRequest = await req.json();

    // Validate request
    if (!body.items || body.items.length === 0) {
      return new Response(JSON.stringify({ error: 'No items in sale' }), {
        status: 400,
      });
    }

    // Create sale with items
    const sale = await prisma.sale.create({
      data: {
        totalAmount: body.total,
        userId: session.user.id,
        items: {
          create: body.items.map(item => ({
            productId: item.productId,
            quantity: item.quantity,
            price: item.price,
          })),
        },
      },
      include: {
        items: true,
      },
    });

    // Update product quantities
    for (const item of body.items) {
      await prisma.product.update({
        where: { id: item.productId },
        data: {
          quantity: {
            decrement: item.quantity,
          },
        },
      });
    }

    return new Response(JSON.stringify(sale), {
      status: 201,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error creating sale:', error);
    return new Response(JSON.stringify({ error: 'Failed to create sale', details: String(error) }), {
      status: 500,
    });
  }
}

export async function GET() {
  try {
    const headersList = await headers();
    const session = await auth.api.getSession({
      headers: headersList,
    });

    if (!session || !session.user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
      });
    }

    const sales = await prisma.sale.findMany({
      where: {
        userId: session.user.id,
      },
      include: {
        items: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
      take: 50,
    });

    return new Response(JSON.stringify(sales), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error fetching sales:', error);
    return new Response(JSON.stringify({ error: 'Failed to fetch sales' }), {
      status: 500,
    });
  }
}
