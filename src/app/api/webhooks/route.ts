// Import necessary modules
import { NextRequest, NextResponse } from 'next/server';

// Define the POST method handler
async function POST(req: NextRequest) {
  try {
    // Process the POST request
    console.log('POST request body: ' + req.body);

    // Return a 200 OK response
    return new NextResponse(
      JSON.stringify({ message: 'POST request received' }),
      {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );
  } catch (error) {
    // Handle errors
    console.error('Error processing POST request:', error);
    return new NextResponse('Server Error', { status: 500 });
  }
}

// Define other HTTP methods if needed (GET, PUT, DELETE, etc.)
async function GET() {
  // Return a 405 Method Not Allowed response for GET requests
  return new NextResponse('Method Not Allowed', { status: 405 });
}

// Export named functions for each HTTP method
export { POST, GET };
