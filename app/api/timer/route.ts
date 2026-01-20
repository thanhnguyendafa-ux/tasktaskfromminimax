import { getSupabaseClient } from '@/lib/supabase';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const supabase = getSupabaseClient();
    const body = await request.json();
    const { task_id, timer_status, total_time_seconds, timer_started_at, timer_paused_at, accumulated_time_seconds } = body;

    const { data, error } = await supabase
      .from('tasks')
      .update({
        timer_status,
        total_time_seconds,
        timer_started_at,
        timer_paused_at,
        accumulated_time_seconds,
        updated_at: new Date().toISOString(),
      })
      .eq('id', task_id)
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ data });
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function GET(request: Request) {
  try {
    const supabase = getSupabaseClient();
    const { searchParams } = new URL(request.url);
    const task_id = searchParams.get('task_id');

    if (!task_id) {
      return NextResponse.json({ error: 'Task ID required' }, { status: 400 });
    }

    const { data, error } = await supabase
      .from('tasks')
      .select('id, timer_status, total_time_seconds, timer_started_at, timer_paused_at, accumulated_time_seconds')
      .eq('id', task_id)
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ data });
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
