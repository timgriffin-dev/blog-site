import { getAllPosts } from '../../../lib/posts';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const posts = await getAllPosts();
    return NextResponse.json(posts);
  } catch (error) {
    console.error('Failed to load posts:', error);
    return NextResponse.json({ error: 'Failed to load posts' }, { status: 500 });
  }
}