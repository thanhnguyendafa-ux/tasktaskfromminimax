import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Increment tally count
    const { data: task, error } = await supabase
      .from('tasks')
      .select('tally_count, user_id')
      .eq('id', params.id)
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    const newTallyCount = (task.tally_count || 0) + 1;

    const { data: updatedTask, error: updateError } = await supabase
      .from('tasks')
      .update({
        tally_count: newTallyCount,
        last_active_at: new Date().toISOString(),
      })
      .eq('id', params.id)
      .select()
      .single();

    if (updateError) {
      return NextResponse.json({ error: updateError.message }, { status: 500 });
    }

    // Small XP reward for tally
    const xpReward = 1;
    await supabase.rpc('add_xp', { user_id: task.user_id, amount: xpReward });

    return NextResponse.json({
      task: updatedTask,
      tally_count: newTallyCount,
      xp_earned: xpReward,
    });
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
