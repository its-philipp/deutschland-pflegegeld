import type { APIRoute } from 'astro';
import { adsTxt } from '../lib/ads';

/**
 * `/ads.txt` as an endpoint rather than a static file, so it is generated from
 * the same `ADSENSE_CLIENT` constant as the script tag and the Datenschutz
 * sections. While ads are off this serves a 200 with an empty body: no
 * publisher line is an honest "no authorised sellers", and the route already
 * exists for the day the constant is filled in.
 */
export const GET: APIRoute = () =>
  new Response(adsTxt(), {
    headers: { 'Content-Type': 'text/plain; charset=utf-8' },
  });
