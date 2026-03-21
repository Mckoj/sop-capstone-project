import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const products = await prisma.product.findMany({
      select: {
        id: true,
        name: true,
        price: true,
        quantity: true,
        barcode: true,
        category: true,
      },
      orderBy: {
        name: 'asc',
      },
    });

    return new Response(JSON.stringify(products), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error fetching products:', error);
    return new Response(JSON.stringify({ error: 'Failed to fetch products' }), {
      status: 500,
    });
  }
}
