import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { user_id, food_id } = body;

    if (!user_id || !food_id) {
      return NextResponse.json({ error: 'User ID and Food ID required' }, { status: 400 });
    }

    // Get food details
    const { data: food, error: foodError } = await supabase
      .from('pet_foods')
      .select('*')
      .eq('id', food_id)
      .single();

    if (foodError || !food) {
      return NextResponse.json({ error: 'Food not found' }, { status: 404 });
    }

    // Get user profile and pet
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('coins')
      .eq('id', user_id)
      .single();

    if (profileError || !profile) {
      return NextResponse.json({ error: 'Profile not found' }, { status: 404 });
    }

    if (profile.coins < food.price_coins) {
      return NextResponse.json({ error: 'Not enough coins' }, { status: 400 });
    }

    const { data: pet, error: petError } = await supabase
      .from('user_pets')
      .select('*')
      .eq('user_id', user_id)
      .single();

    if (petError || !pet) {
      return NextResponse.json({ error: 'Pet not found' }, { status: 404 });
    }

    // Deduct coins
    await supabase
      .from('profiles')
      .update({ coins: profile.coins - food.price_coins })
      .eq('id', user_id);

    // Update pet stats
    const newHunger = Math.min(100, pet.hunger + food.hunger_restore);
    const newHappiness = Math.min(100, pet.happiness + food.happiness_bonus);
    const newExperience = pet.experience + food.xp_bonus;

    const { data: updatedPet, error: updateError } = await supabase
      .from('user_pets')
      .update({
        hunger: newHunger,
        happiness: newHappiness,
        experience: newExperience,
        last_fed_at: new Date().toISOString(),
        state: 'eating',
        mood: 'excited',
        updated_at: new Date().toISOString(),
      })
      .eq('id', pet.id)
      .select()
      .single();

    if (updateError) {
      return NextResponse.json({ error: updateError.message }, { status: 500 });
    }

    return NextResponse.json({
      pet: updatedPet,
      fed: {
        food_name: food.name,
        hunger_restored: food.hunger_restore,
        happiness_bonus: food.happiness_bonus,
        xp_earned: food.xp_bonus,
      },
    });
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
