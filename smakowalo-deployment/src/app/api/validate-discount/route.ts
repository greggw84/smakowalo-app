import { type NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(request: NextRequest) {
  try {
    const { code, subtotal } = await request.json();

    if (!code || !code.trim()) {
      return NextResponse.json({
        valid: false,
        message: 'Kod rabatowy jest wymagany'
      });
    }

    // Get discount code from database
    const { data: discountData, error } = await supabase
      .from('discount_codes')
      .select('*')
      .eq('code', code.toLowerCase())
      .eq('active', true)
      .single();

    if (error || !discountData) {
      return NextResponse.json({
        valid: false,
        message: 'Nieprawidłowy kod rabatowy'
      });
    }

    // Check if discount code is expired
    if (discountData.expires_at && new Date(discountData.expires_at) < new Date()) {
      return NextResponse.json({
        valid: false,
        message: 'Kod rabatowy wygasł'
      });
    }

    // Check usage limit
    if (discountData.usage_limit && discountData.used_count >= discountData.usage_limit) {
      return NextResponse.json({
        valid: false,
        message: 'Kod rabatowy osiągnął limit użyć'
      });
    }

    // Check minimum order amount
    if (discountData.min_order_amount && subtotal < discountData.min_order_amount) {
      return NextResponse.json({
        valid: false,
        message: `Minimalna kwota zamówienia dla tego kodu to ${discountData.min_order_amount} zł`
      });
    }

    // Calculate discount amount
    let discountAmount = 0;
    if (discountData.type === 'percentage') {
      discountAmount = (subtotal * discountData.discount_percentage) / 100;
    } else if (discountData.type === 'fixed') {
      discountAmount = discountData.discount_amount;
    }

    return NextResponse.json({
      valid: true,
      code: discountData.code,
      type: discountData.type,
      discountPercentage: discountData.discount_percentage,
      discountAmount: discountAmount,
      description: discountData.description,
      message: `Kod rabatowy został zastosowany! Oszczędzasz ${discountAmount.toFixed(2)} zł`
    });

  } catch (error) {
    console.error('Error validating discount code:', error);
    return NextResponse.json({
      valid: false,
      message: 'Wystąpił błąd podczas sprawdzania kodu rabatowego'
    }, { status: 500 });
  }
}
