import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { user_id, item_id } = body;

    if (!user_id || !item_id) {
      return NextResponse.json({ error: 'User ID and Item ID required' }, { status: 400 });
    }

    // Get shop item
    const { data: item, error: itemError } = await supabase
      .from('shop_items')
      .select('*')
      .eq('id', item_id)
      .single();

    if (itemError || !item) {
      return NextResponse.json({ error: 'Item not found' }, { status: 404 });
    }

    // Get user profile
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('coins')
      .eq('id', user_id)
      .single();

    if (profileError || !profile) {
      return NextResponse.json({ error: 'Profile not found' }, { status: 404 });
    }

    if (profile.coins < item.price_coins) {
      return NextResponse.json({ error: 'Not enough coins' }, { status: 400 });
    }

    // Check if already owned
    const { data: existingItem } = await supabase
      .from('user_inventory')
      .select('*')
      .eq('user_id', user_id)
      .eq('item_id', item_id)
      .single();

    if (existingItem) {
      return NextResponse.json({ error: 'Already owned' }, { status: 400 });
    }

    // Deduct coins and add to inventory
    const { error: updateError } = await supabase
      .from('profiles')
      .update({ coins: profile.coins - item.price_coins })
      .eq('id', user_id);

    if (updateError) {
      return NextResponse.json({ error: updateError.message }, { status: 500 });
    }

    const { data: inventoryItem, error: inventoryError } = await supabase
      .from('user_inventory')
      .insert({
        user_id,
        item_id,
      })
      .select('*, item:item_id(*)')
      .single();

    if (inventoryError) {
      return NextResponse.json({ error: inventoryError.message }, { status: 500 });
    }

    return NextResponse.json({
      item: inventoryItem,
      remaining_coins: profile.coins - item.price_coins,
    }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
