import { NextRequest, NextResponse } from 'next/server';

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5000';

export async function GET(request: NextRequest) {
  return proxyRequest(request, 'GET');
}

export async function POST(request: NextRequest) {
  return proxyRequest(request, 'POST');
}

export async function PUT(request: NextRequest) {
  return proxyRequest(request, 'PUT');
}

export async function DELETE(request: NextRequest) {
  return proxyRequest(request, 'DELETE');
}

async function proxyRequest(request: NextRequest, method: string) {
  try {
    const url = new URL(request.url);
    const backendPath = url.pathname.replace(/^\/api/, '');
    const backendUrl = `${BACKEND_URL}${backendPath}${url.search}`;

    const headers: Record<string, string> = {};
    request.headers.forEach((value, key) => {
      if (!key.startsWith('next-') && key !== 'content-length') {
        headers[key] = value;
      }
    });

    const body = method !== 'GET' && method !== 'HEAD' ? await request.text() : undefined;

    const response = await fetch(backendUrl, {
      method,
      headers,
      body,
    });

    const responseBody = await response.text();
    
    return new NextResponse(responseBody, {
      status: response.status,
      statusText: response.statusText,
      headers: {
        'Content-Type': response.headers.get('Content-Type') || 'application/json',
      },
    });
  } catch (error) {
    console.error('Proxy error:', error);
    return NextResponse.json(
      { error: 'Error connecting to backend server' },
      { status: 502 }
    );
  }
}