import { NextResponse } from 'next/server';

export async function GET(request, context) {
  try {
    // Destructure the username correctly from context.params
    const { username } = await context.params;

    const backendRes = await fetch(`${process.env.BACKEND_URL}/api/users/role/${username}`);

    if (!backendRes.ok) {
      return NextResponse.json({ error: 'Failed to fetch user role' }, { status: backendRes.status });
    }

    const data = await backendRes.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error fetching user role:', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
