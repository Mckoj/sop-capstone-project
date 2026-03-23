import { prisma } from '@/lib/prisma';
import { headers } from 'next/headers';
import crypto from 'crypto';

export async function POST(req: Request) {
  try {
    const headersList = await headers();
    const signature = headersList.get('x-paystack-signature');
    const body = await req.text();

    // Verify the webhook is actually from Paystack
    const hash = crypto
      .createHmac('sha512', process.env.PAYSTACK_SECRET_KEY!)
      .update(body)
      .digest('hex');

    if (hash !== signature) {
      return new Response(JSON.stringify({ error: 'Invalid signature' }), { status: 401 });
    }

    const event = JSON.parse(body);

    // Only handle successful charges
    if (event.event === 'charge.success') {
      const reference = event.data.reference;

      // Find sale by paystackRef and update status
      await prisma.sale.updateMany({
        where: { paystackRef: reference },
        data: { paymentStatus: 'paid' },
      });
    }

    return new Response(JSON.stringify({ received: true }), { status: 200 });
  } catch (error) {
    console.error('Webhook error:', error);
    return new Response(JSON.stringify({ error: 'Webhook failed' }), { status: 500 });
  }
}
