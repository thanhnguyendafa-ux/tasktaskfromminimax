import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('user_id');

    if (!userId) {
      return NextResponse.json({ error: 'User ID required' }, { status: 400 });
    }

    const { data, error } = await supabase
      .from('tags')
      .select('*')
      .eq('user_id', userId)
      .order('sort_order');

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Build hierarchical structure
    const tags = data || [];
    const tagMap = new Map();
    const rootTags: any[] = [];

    tags.forEach((tag: any) => {
      tag.children = [];
      tagMap.set(tag.id, tag);
    });

    tags.forEach((tag: any) => {
      if (tag.parent_id && tagMap.has(tag.parent_id)) {
        tagMap.get(tag.parent_id).children.push(tag);
      } else {
        rootTags.push(tag);
      }
    });

    return NextResponse.json({ tags: rootTags });
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { user_id, name, icon, color, parent_id, is_folder } = body;

    if (!user_id || !name) {
      return NextResponse.json({ error: 'User ID and name required' }, { status: 400 });
    }

    const { data, error } = await supabase
      .from('tags')
      .insert({
        user_id,
        name,
        icon: icon || '📁',
        color: color || '#6366f1',
        parent_id: parent_id || null,
        is_folder: is_folder || false,
      })
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ tag: data }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
