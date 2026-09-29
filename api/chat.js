import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';

/**
 * Helper to retrieve and clean the Gemini API key from multiple possible sources.
 * Checks request headers, process.env, .env on disk, and .env.example (as a fallback).
 */
function resolveApiKey(req) {
  // 1. Check custom client header from in-app Settings
  const headerKey = req.headers['x-gemini-key'];
  if (headerKey && typeof headerKey === 'string' && headerKey.trim()) {
    const cleaned = headerKey.trim().replace(/^["']|["']$/g, '').trim();
    if (cleaned && cleaned !== 'your_gemini_api_key_here') {
      return cleaned;
    }
  }

  // 2. Reload .env dynamically so live edits to .env are picked up without server restart
  try {
    dotenv.config({ override: true });
  } catch (e) {
    // Ignore error
  }

  if (process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY.trim()) {
    const cleaned = process.env.GEMINI_API_KEY.trim().replace(/^["']|["']$/g, '').trim();
    if (cleaned && cleaned !== 'your_gemini_api_key_here') {
      return cleaned;
    }
  }

  // 3. Fallback: Read .env directly from file system
  try {
    const envPath = path.resolve(process.cwd(), '.env');
    if (fs.existsSync(envPath)) {
      const content = fs.readFileSync(envPath, 'utf-8');
      const match = content.match(/^GEMINI_API_KEY\s*=\s*(["']?)(.*?)\1\s*$/m);
      if (match && match[2]) {
        const cleaned = match[2].trim().replace(/^["']|["']$/g, '').trim();
        if (cleaned && cleaned !== 'your_gemini_api_key_here') {
          return cleaned;
        }
      }
    }
  } catch (e) {
    // Ignore file system errors
  }

  // 4. Fallback: Check if user accidentally pasted it in .env.example
  try {
    const examplePath = path.resolve(process.cwd(), '.env.example');
    if (fs.existsSync(examplePath)) {
      const content = fs.readFileSync(examplePath, 'utf-8');
      const match = content.match(/^GEMINI_API_KEY\s*=\s*(["']?)(.*?)\1\s*$/m);
      if (match && match[2]) {
        const cleaned = match[2].trim().replace(/^["']|["']$/g, '').trim();
        if (cleaned && cleaned.startsWith('AIza') && cleaned !== 'your_gemini_api_key_here') {
          return cleaned;
        }
      }
    }
  } catch (e) {
    // Ignore
  }

  return '';
}

/**
 * Serverless API handler for Gemini chat completions.
 * Streams responses via Server-Sent Events (SSE).
 */
export default async function handler(req, res) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, x-gemini-key');

  if (req.method === 'OPTIONS') {
    res.statusCode = 204;
    return res.end();
  }

  if (req.method !== 'POST') {
    res.statusCode = 405;
    res.setHeader('Content-Type', 'application/json');
    return res.end(JSON.stringify({ error: 'Method Not Allowed' }));
  }

  const apiKey = resolveApiKey(req);

  if (!apiKey) {
    res.statusCode = 400;
    res.setHeader('Content-Type', 'application/json');
    return res.end(
      JSON.stringify({
        error:
          'Gemini API key is not configured. Please add GEMINI_API_KEY to your .env file or enter your key in Settings.',
      })
    );
  }

  // Parse body
  let body = req.body;
  if (!body && req.readable) {
    try {
      const chunks = [];
      for await (const chunk of req) {
        chunks.push(chunk);
      }
      const raw = Buffer.concat(chunks).toString('utf-8');
      body = JSON.parse(raw);
    } catch {
      res.statusCode = 400;
      res.setHeader('Content-Type', 'application/json');
      return res.end(JSON.stringify({ error: 'Malformed JSON in request body' }));
    }
  } else if (typeof body === 'string') {
    try {
      body = JSON.parse(body);
    } catch {
      res.statusCode = 400;
      res.setHeader('Content-Type', 'application/json');
      return res.end(JSON.stringify({ error: 'Malformed JSON in request body' }));
    }
  }

  const { messages, model, systemInstruction } = body || {};

  if (!Array.isArray(messages) || messages.length === 0) {
    res.statusCode = 400;
    res.setHeader('Content-Type', 'application/json');
    return res.end(JSON.stringify({ error: 'Messages array is required' }));
  }

  // Filter and format messages for Gemini: 'user' or 'model'
  const contents = messages
    .filter((m) => m && m.content && m.content.trim() !== '')
    .map((msg) => ({
      role: msg.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: msg.content }],
    }));

  if (contents.length === 0) {
    res.statusCode = 400;
    res.setHeader('Content-Type', 'application/json');
    return res.end(JSON.stringify({ error: 'At least one valid message is required' }));
  }

  const chosenModel = model || 'gemini-3.8-flash';

  try {
    const ai = new GoogleGenAI({ apiKey });

    // Set streaming headers
    res.statusCode = 200;
    res.setHeader('Content-Type', 'text/event-stream; charset=utf-8');
    res.setHeader('Cache-Control', 'no-cache, no-transform');
    res.setHeader('Connection', 'keep-alive');
    res.setHeader('X-Accel-Buffering', 'no');
    if (typeof res.flushHeaders === 'function') {
      res.flushHeaders();
    }

    const config = {};
    if (systemInstruction) {
      config.systemInstruction = systemInstruction;
    }

    let responseStream;

    // Try primary model (gemini-3.8-flash)
    try {
      responseStream = await ai.models.generateContentStream({
        model: chosenModel,
        contents,
        config,
      });
    } catch (primaryErr) {
      const is503OrUnavailable =
        primaryErr.status === 503 ||
        primaryErr.message?.includes('503') ||
        primaryErr.message?.includes('UNAVAILABLE') ||
        primaryErr.message?.includes('high demand');

      if (is503OrUnavailable) {
        console.warn(
          `Model ${chosenModel} returned 503 (high demand). Seamlessly failing over to ultra-fast gemini-flash-lite-latest...`
        );
        try {
          responseStream = await ai.models.generateContentStream({
            model: 'gemini-flash-lite-latest',
            contents,
            config,
          });
        } catch {
          throw primaryErr;
        }
      } else {
        throw primaryErr;
      }
    }

    for await (const chunk of responseStream) {
      const text = chunk.text;
      if (text) {
        res.write(`data: ${JSON.stringify({ text })}\n\n`);
        if (typeof res.flush === 'function') res.flush();
      }
    }

    res.write('data: [DONE]\n\n');
    res.end();
  } catch (err) {
    console.error('Gemini API Error Details:', err);

    let rawMsg = err.message || '';
    let isApiKeyError = false;
    let isQuotaError = false;
    let is503 = false;

    if (
      rawMsg.includes('API_KEY_INVALID') ||
      rawMsg.includes('API key not valid') ||
      rawMsg.includes('UNAUTHENTICATED')
    ) {
      isApiKeyError = true;
    } else if (rawMsg.includes('RESOURCE_EXHAUSTED') || rawMsg.includes('429')) {
      isQuotaError = true;
    } else if (err.status === 503 || rawMsg.includes('503') || rawMsg.includes('high demand')) {
      is503 = true;
    }

    const userFacingError = isApiKeyError
      ? 'The Gemini API key is invalid. Please verify your API key in .env or Settings.'
      : isQuotaError
      ? 'Gemini API quota exceeded or rate limit reached. Please check your Google AI Studio quota.'
      : is503
      ? 'Gemini (3.8 Flash) is currently experiencing temporary high demand on Google servers. Please click "Try again" in a moment.'
      : 'Failed to generate response. Please click "Try again".';

    if (!res.headersSent) {
      res.statusCode = 500;
      res.setHeader('Content-Type', 'application/json');
      return res.end(JSON.stringify({ error: userFacingError }));
    } else {
      res.write(`data: ${JSON.stringify({ error: userFacingError })}\n\n`);
      res.end();
    }
  }
}
