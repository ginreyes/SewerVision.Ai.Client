export async function POST(request) {
  try {
    const data = await request.json();
    const { isRegister, isResetPassword, isChangePassword } = data;
    const baseUrl = process.env.API_URL || 'http://localhost:5000/api/auth';

    let apiUrl;

    if (isResetPassword) {
      apiUrl = `${baseUrl}/reset-password`;
    } else if (isChangePassword) {
      apiUrl = `${baseUrl}/change-password`;
    } else if (isRegister) {
      apiUrl = `${baseUrl}/register`;
    } else {
      apiUrl = `${baseUrl}/login`;
    }

    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });

    const text = await response.text();
    if (!response.ok) {
      // Try to parse error JSON
      let errorData;
      try {
        errorData = JSON.parse(text);
      } catch {
        errorData = { message: text || 'Unknown error' };
      }
      throw new Error(errorData.message || 'Something went wrong');
    }

    let responseData;
    try {
      responseData = JSON.parse(text);
    } catch {
      throw new Error('Invalid JSON response from backend API');
    }

    return NextResponse.json(responseData);
  } catch (error) {
    console.error('Error during API call:', error);
    return NextResponse.json(
      { message: 'Error during API call', error: error.message },
      { status: 500 }
    );
  }
}
