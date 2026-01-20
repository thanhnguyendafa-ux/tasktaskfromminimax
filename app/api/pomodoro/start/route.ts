import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { task_id, user_id, duration_seconds = 1500 } = body;

    if (!task_id || !user_id) {
      return NextResponse.json({ error: 'Task ID and User ID required' }, { status: 400 });
    }

    // Create pomodoro session
    const { data: session, error } = await supabase
      .from('pomodoro_sessions')
      .insert({
        task_id,
        user_id,
        duration_seconds,
        status: 'in_progress',
      })
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Update task status to in_progress
    await supabase
      .from('tasks')
      .update({
        status: 'in_progress',
        last_active_at: new Date().toISOString(),
      })
      .eq('id', task_id);

    return NextResponse.json({ session }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
