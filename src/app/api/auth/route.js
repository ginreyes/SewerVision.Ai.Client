import { NextResponse } from 'next/server';

export async function POST(request) {
  try {
    const data = await request.json();
    const isRegister = data.isRegister; 

    const apiUrl = process.env.API_URL || (isRegister 
      ? 'http://localhost:5000/api/auth/register' 
      : 'http://localhost:5000/api/auth/login');

    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Something went wrong');
    }

    const responseData = await response.json();
    return NextResponse.json(responseData);
  } catch (error) {
    console.error('Error during API call:', error);
    return NextResponse.json({ message: 'Error during API call', error: error.message }, { status: 500 });
  }
}
