// أيار — نقطة الدخول على Cloudflare Workers
// الملفات الثابتة (public/) يقدّمها Cloudflare مباشرة، وطلبات /api/* تمر هنا مع قاعدة بيانات D1
import { handleApi } from './core.js';

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    if (url.pathname.startsWith('/api/')) {
      return handleApi(request, { db: env.DB, ip: request.headers.get('cf-connecting-ip') || 'unknown' });
    }
    return env.ASSETS.fetch(request);
  }
};
