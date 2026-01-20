import { getSupabaseClient } from '@/lib/supabase';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const supabase = getSupabaseClient();
    const body = await request.json();
    const { task_id, user_id, start_time, end_time, duration_seconds, session_type, xp_earned, coins_earned, status } = body;

    const { data, error } = await supabase
      .from('time_tracking')
      .insert({
        task_id,
        user_id,
        start_time,
        end_time,
        duration_seconds,
        session_type,
        xp_earned,
        coins_earned,
        status,
      })
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
    const user_id = searchParams.get('user_id');
    const start_date = searchParams.get('start_date');
    const end_date = searchParams.get('end_date');
    const task_id = searchParams.get('task_id');

    if (!user_id) {
      return NextResponse.json({ error: 'User ID required' }, { status: 400 });
    }

    let query = supabase
      .from('time_tracking')
      .select(`
        *,
        task:tasks (title)
      `)
      .eq('user_id', user_id)
      .order('start_time', { ascending: false });

    if (start_date) {
      query = query.gte('start_time', start_date);
    }
    if (end_date) {
      query = query.lte('start_time', end_date);
    }
    if (task_id) {
      query = query.eq('task_id', task_id);
    }

    const { data, error } = await query;

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ data });
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const supabase = getSupabaseClient();
    const { searchParams } = new URL(request.url);
    const session_id = searchParams.get('id');

    if (!session_id) {
      return NextResponse.json({ error: 'Session ID required' }, { status: 400 });
    }

    const { error } = await supabase
      .from('time_tracking')
      .delete()
      .eq('id', session_id);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
