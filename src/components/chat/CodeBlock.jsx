import React, { useState } from 'react';
import hljs from 'highlight.js';
import { Check, Copy } from 'lucide-react';
import { copyToClipboard } from '../../utils/chatHelpers';

/**
 * Modern syntax-highlighted code block component with language badge and copy button.
 */
export function CodeBlock({ language, code }) {
  const [copied, setCopied] = useState(false);

  const cleanCode = (code || '').replace(/\n$/, '');
  const validLang = language && hljs.getLanguage(language) ? language : 'plaintext';

  let highlightedCode = '';
  try {
    if (validLang !== 'plaintext') {
      highlightedCode = hljs.highlight(cleanCode, { language: validLang }).value;
    } else {
      highlightedCode = hljs.highlightAuto(cleanCode).value;
    }
  } catch {
    highlightedCode = cleanCode;
  }

  const handleCopy = async () => {
    const success = await copyToClipboard(cleanCode);
    if (success) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="relative my-4 overflow-hidden rounded-xl border border-white/10 bg-[#0d0f17] dark:bg-[#07080d] shadow-lg text-slate-200">
      {/* Code Header Bar */}
      <div className="flex items-center justify-between px-4 py-2 bg-white/[0.04] border-b border-white/[0.08] text-xs font-mono text-slate-400">
        <span className="uppercase tracking-wider font-semibold text-indigo-400">
          {language || 'code'}
        </span>
        <button
          type="button"
          onClick={handleCopy}
          aria-label="Copy code to clipboard"
          className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-white/[0.06] hover:bg-white/[0.12] active:scale-95 transition-all text-slate-300 hover:text-white"
        >
          {copied ? (
            <>
              <Check className="w-3.5 h-3.5 text-emerald-400" />
              <span className="text-emerald-400 font-medium">Copied</span>
            </>
          ) : (
            <>
              <Copy className="w-3.5 h-3.5" />
              <span>Copy</span>
            </>
          )}
        </button>
      </div>

      {/* Highlighted Code Container */}
      <div className="overflow-x-auto p-4 text-[13.5px] leading-relaxed font-mono">
        <pre className="m-0 p-0 bg-transparent">
          <code
            className={`hljs ${language ? `language-${language}` : ''}`}
            dangerouslySetInnerHTML={{ __html: highlightedCode }}
          />
        </pre>
      </div>
    </div>
  );
}
