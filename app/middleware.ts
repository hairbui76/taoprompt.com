import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { rateLimit } from 'express-rate-limit'
import { headers } from 'next/headers'

// Cấu hình Rate Limiting
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 phút
    max: 100, // Giới hạn mỗi IP là 100 request trong 15 phút
    message: 'Quá nhiều request từ IP này, vui lòng thử lại sau.',
    standardHeaders: true,
    legacyHeaders: false,
})

// Danh sách các domain được phép truy cập
const allowedOrigins = [
    'http://localhost:3000',
    'https://taoprompt.com',
    // Thêm các domain khác vào đây
]

export async function middleware(request: NextRequest) {
    const origin = request.headers.get('origin')
    const clientIP = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || '127.0.0.1'

    // Xử lý CORS
    if (origin) {
        if (!allowedOrigins.includes(origin)) {
            return new NextResponse(null, {
                status: 403,
                statusText: 'Forbidden',
                headers: {
                    'Content-Type': 'text/plain',
                }
            })
        }
    }

    // Apply rate limiting
    try {
        await new Promise((resolve, reject) => {
            limiter(
                { ip: clientIP, headers: headers() } as any,
                {
                    status: (code: number) => ({
                        json: () => new NextResponse(null, { status: code })
                    })
                } as any,
                (error: Error | null) => {
                    if (error) reject(error)
                    resolve(true)
                }
            )
        })
    } catch (error) {
        return new NextResponse(null, {
            status: 429,
            statusText: 'Too Many Requests',
            headers: {
                'Content-Type': 'text/plain',
                'Retry-After': '900', // 15 phút in seconds
            }
        })
    }

    // Security headers (tương tự Helmet.js)
    const response = NextResponse.next()

    // Thêm các security headers
    const securityHeaders = {
        'X-DNS-Prefetch-Control': 'on',
        'Strict-Transport-Security': 'max-age=31536000; includeSubDomains',
        'X-Frame-Options': 'SAMEORIGIN',
        'X-Content-Type-Options': 'nosniff',
        'Referrer-Policy': 'origin-when-cross-origin',
        'X-Permitted-Cross-Domain-Policies': 'none',
        'X-XSS-Protection': '1; mode=block',
        'Content-Security-Policy': `
      default-src 'self';
      script-src 'self' 'unsafe-inline' 'unsafe-eval';
      style-src 'self' 'unsafe-inline';
      img-src 'self' blob: data:;
      font-src 'self';
      object-src 'none';
      base-uri 'self';
      form-action 'self';
      frame-ancestors 'none';
      block-all-mixed-content;
      upgrade-insecure-requests;
    `.replace(/\s+/g, ' ').trim(),
    }

    // Thêm headers vào response
    Object.entries(securityHeaders).forEach(([key, value]) => {
        response.headers.set(key, value)
    })

    return response
}

// Chỉ định các routes cần áp dụng middleware
export const config = {
    matcher: [
        // Áp dụng cho tất cả các routes ngoại trừ static files và api routes
        '/((?!_next/static|_next/image|favicon.ico).*)',
    ],
} 