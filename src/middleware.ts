import { NextResponse, type NextRequest } from 'next/server';

// AUTH REMOVED: Simple pass-through middleware. Re-add auth checks here later.
export async function middleware(request: NextRequest) {
    return NextResponse.next();
}

export const config = {
    matcher: [
        '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
    ],
};
