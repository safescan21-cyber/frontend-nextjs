'use client';
// WebMCP (https://developer.chrome.com/docs/ai/webmcp): tools that AI agents in the
// browser can call. Two kinds:
//  - Read-only lookups registered here in JavaScript (machines and pharma APIs).
//  - The site's public forms (search, quote, contact…) carry toolname/tooldescription
//    attributes; the browser turns those into tools itself. Agents only fill those
//    forms – the visitor still presses the button, except on search forms.
// Browsers without WebMCP skip all of this. Keep /.well-known/ai-catalog.json in step.
import { useEffect } from 'react';
import { WEBMCP_TOOLS, text } from './webmcpTools';

// What an agent gets back after a form it filled is submitted: where the page is now
// and any message the form showed.
const pageResult = (form) => {
  const toolName = form.getAttribute('toolname');
  const notes = [...document.querySelectorAll('[role="alert"], [role="status"]')].map((el) => text(el.textContent, 300)).filter(Boolean);
  return { tool: toolName, page: window.location.href, heading: text(document.querySelector('main h1, h1')?.textContent, 200), messages: notes.slice(0, 5) };
};

// The forms are React-controlled: if the browser fills a field without an input
// event, React would not see the value. Re-announce the filled values. (Checkboxes are
// left alone on purpose – consent boxes stay the visitor's to tick.)
const syncFilledForm = (toolName) => {
  const form = document.querySelector(`form[toolname="${CSS.escape(toolName || '')}"]`);
  if (!form) return;
  for (const el of form.elements) {
    if (el.type === 'checkbox' || el.type === 'radio' || el.type === 'file' || !el.name) continue;
    el.dispatchEvent(new Event('input', { bubbles: true }));
  }
};

export default function WebMcpTools() {
  useEffect(() => {
    const mc = document.modelContext || navigator.modelContext;
    if (!mc) return undefined;

    const controller = new AbortController();
    for (const tool of WEBMCP_TOOLS) {
      try {
        mc.registerTool(tool, { signal: controller.signal });
      } catch {
        // already registered (fast refresh) or not supported – skip
      }
    }

    const onActivated = (e) => syncFilledForm(e.toolName);
    mc.addEventListener?.('toolactivated', onActivated);

    // After the app's own submit handler has run (it calls preventDefault), report back.
    const onSubmit = (e) => {
      const form = e.target;
      if (!e.agentInvoked || !form?.getAttribute?.('toolname') || !e.defaultPrevented || typeof e.respondWith !== 'function') return;
      e.respondWith(new Promise((resolve) => setTimeout(() => resolve(pageResult(form)), 1500)));
    };
    window.addEventListener('submit', onSubmit);

    return () => {
      controller.abort();
      for (const tool of WEBMCP_TOOLS) {
        try { mc.unregisterTool?.(tool.name); } catch { /* gone */ }
      }
      mc.removeEventListener?.('toolactivated', onActivated);
      window.removeEventListener('submit', onSubmit);
    };
  }, []);
  return null;
}
