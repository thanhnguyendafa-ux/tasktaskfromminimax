import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('user_id');
    const status = searchParams.get('status');
    const limit = searchParams.get('limit') || '50';

    if (!userId) {
      return NextResponse.json({ error: 'User ID required' }, { status: 400 });
    }

    let query = supabase
      .from('tasks')
      .select(`
        *,
        tags:task_tags(tags(*))
      `)
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(parseInt(limit));

    if (status && status !== 'all') {
      query = query.eq('status', status);
    }

    const { data, error } = await query;

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ tasks: data });
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      user_id,
      title,
      description,
      priority,
      due_date,
      tags,
    } = body;

    if (!user_id || !title) {
      return NextResponse.json({ error: 'User ID and title required' }, { status: 400 });
    }

    // Create task
    const { data: task, error: taskError } = await supabase
      .from('tasks')
      .insert({
        user_id,
        title,
        description: description || null,
        priority: priority || 'medium',
        due_date: due_date || null,
        status: 'pending',
        tally_count: 0,
        pomodoro_count: 0,
        total_time_seconds: 0,
      })
      .select()
      .single();

    if (taskError) {
      return NextResponse.json({ error: taskError.message }, { status: 500 });
    }

    // Add tags if provided
    if (tags && tags.length > 0) {
      const taskTags = tags.map((tagId: string) => ({
        task_id: task.id,
        tag_id: tagId,
      }));

      const { error: tagError } = await supabase
        .from('task_tags')
        .insert(taskTags);

      if (tagError) {
        return NextResponse.json({ error: tagError.message }, { status: 500 });
      }
    }

    return NextResponse.json({ task }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
