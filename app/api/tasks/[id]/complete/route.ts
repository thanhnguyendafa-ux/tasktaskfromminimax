import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Get task to find user_id
    const { data: task, error: taskError } = await supabase
      .from('tasks')
      .select('user_id')
      .eq('id', params.id)
      .single();

    if (taskError || !task) {
      return NextResponse.json({ error: 'Task not found' }, { status: 404 });
    }

    // Update task to completed
    const { data: updatedTask, error: updateError } = await supabase
      .from('tasks')
      .update({
        status: 'completed',
        updated_at: new Date().toISOString(),
      })
      .eq('id', params.id)
      .select()
      .single();

    if (updateError) {
      return NextResponse.json({ error: updateError.message }, { status: 500 });
    }

    // Award XP and coins
    const xpReward = 10;
    const coinsReward = 5;

    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('xp, coins, level')
      .eq('id', task.user_id)
      .single();

    if (!profileError && profile) {
      const newXp = profile.xp + xpReward;
      const newLevel = Math.floor(newXp / 100) + 1;
      const leveledUp = newLevel > profile.level;

      await supabase
        .from('profiles')
        .update({
          xp: newXp,
          coins: profile.coins + coinsReward,
          last_active_at: new Date().toISOString(),
        })
        .eq('id', task.user_id);

      return NextResponse.json({
        task: updatedTask,
        rewards: {
          xp_earned: xpReward,
          coins_earned: coinsReward,
          level_up: leveledUp,
          new_level: newLevel,
        },
      });
    }

    return NextResponse.json({
      task: updatedTask,
      rewards: {
        xp_earned: xpReward,
        coins_earned: coinsReward,
      },
    });
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
