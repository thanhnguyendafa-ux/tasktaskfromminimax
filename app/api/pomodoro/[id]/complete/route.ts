import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    const { aborted = false } = body;

    // Get session
    const { data: session, error: sessionError } = await supabase
      .from('pomodoro_sessions')
      .select('*, task_id, user_id')
      .eq('id', params.id)
      .single();

    if (sessionError || !session) {
      return NextResponse.json({ error: 'Session not found' }, { status: 404 });
    }

    // Update session
    const { data: updatedSession, error } = await supabase
      .from('pomodoro_sessions')
      .update({
        completed_at: new Date().toISOString(),
        status: aborted ? 'aborted' : 'completed',
      })
      .eq('id', params.id)
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    if (aborted) {
      return NextResponse.json({ session: updatedSession });
    }

    // Calculate rewards
    const xpEarned = 5;
    const coinsEarned = 2;

    // Update task pomodoro count
    const { data: task } = await supabase
      .from('tasks')
      .select('pomodoro_count')
      .eq('id', session.task_id)
      .single();

    await supabase
      .from('tasks')
      .update({
        pomodoro_count: (task?.pomodoro_count || 0) + 1,
        last_active_at: new Date().toISOString(),
      })
      .eq('id', session.task_id);

    // Update user profile
    const { data: profile } = await supabase
      .from('profiles')
      .select('xp, coins, level')
      .eq('id', session.user_id)
      .single();

    if (profile) {
      const newXp = profile.xp + xpEarned;
      const newLevel = Math.floor(newXp / 100) + 1;
      const leveledUp = newLevel > profile.level;

      await supabase
        .from('profiles')
        .update({
          xp: newXp,
          coins: profile.coins + coinsEarned,
          last_active_at: new Date().toISOString(),
        })
        .eq('id', session.user_id);

      return NextResponse.json({
        session: updatedSession,
        rewards: {
          xp_earned: xpEarned,
          coins_earned: coinsEarned,
          level_up: leveledUp,
          new_level: newLevel,
        },
      });
    }

    return NextResponse.json({
      session: updatedSession,
      rewards: {
        xp_earned: xpEarned,
        coins_earned: coinsEarned,
      },
    });
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
