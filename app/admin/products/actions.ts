'use server';

import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

export async function createProduct(prevState: any, formData: FormData) {
  const name = formData.get('name') as string;
  const category = formData.get('category') as string;
  const price = parseFloat(formData.get('price') as string);
  const quantity = parseInt(formData.get('quantity') as string, 10);
  const barcode = formData.get('barcode') as string;

  if (!name || !category || isNaN(price) || isNaN(quantity) || !barcode) {
    return { error: 'Please fill out all fields correctly.' };
  }

  try {
    await prisma.product.create({
      data: {
        name,
        category,
        price,
        quantity,
        barcode,
      },
    });
  } catch (error: any) {
    console.error('Failed to create product:', error);
    if (error.code === 'P2002') {
      return { error: 'A product with this barcode already exists.' };
    }
    return { error: 'Failed to create product. Please try again.' };
  }

  revalidatePath('/admin/products');
  redirect('/admin/products');
}
