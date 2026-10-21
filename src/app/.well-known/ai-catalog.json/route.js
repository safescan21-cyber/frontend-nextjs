// /.well-known/ai-catalog.json — machine-readable list of what this site offers AI
// agents (AI Catalog spec 1.0, https://ai-catalog.io): the llms.txt guide and the
// WebMCP tools (read-only lookups registered in JavaScript, plus the public forms).
import { WEBMCP_TOOLS, FORM_TOOLS } from '../../../components/webmcp/webmcpTools';
import { SITE_URL, SITE_NAME } from '../../../components/seo/organization';

export const dynamic = 'force-static';

// Identifiers follow the ARD pattern urn:air:<publisher>:<namespace>:<name>
const URN = 'urn:air:foodpharmamachinery.com';
const WEBMCP_TYPE = 'application/vnd.webmcp.tool+json';

export function GET() {
  const catalog = {
    specVersion: '1.0',
    host: {
      displayName: SITE_NAME,
      identifier: 'did:web:www.foodpharmamachinery.com',
      documentationUrl: `${SITE_URL}/llms.txt`,
      logoUrl: `${SITE_URL}/favicon-192.png`,
    },
    entries: [
      {
        identifier: `${URN}:docs:llms-txt`,
        displayName: `${SITE_NAME} guide for AI assistants`,
        description: 'Markdown summary of the site with links to the main pages, machines and pharma APIs.',
        type: 'text/markdown',
        url: `${SITE_URL}/llms.txt`,
        representativeQueries: ['What machines does Food Pharma Machinery sell?', 'How do I contact Food Pharma Machinery for a quote?'],
      },
      ...WEBMCP_TOOLS.map((t) => ({
        identifier: `${URN}:webmcp:${t.name}`,
        displayName: t.name,
        description: t.description,
        type: WEBMCP_TYPE,
        tags: ['webmcp', 'read-only'],
        ...(t.queries && { representativeQueries: t.queries }),
        data: { name: t.name, description: t.description, inputSchema: t.inputSchema, annotations: t.annotations, registration: 'imperative', availableOn: `${SITE_URL}/` },
      })),
      ...Object.values(FORM_TOOLS).map((t) => ({
        identifier: `${URN}:webmcp:${t.name}`,
        displayName: t.name,
        description: t.description,
        type: WEBMCP_TYPE,
        tags: ['webmcp', 'form', t.autoSubmit ? 'read-only' : 'user-confirms'],
        ...(t.queries && { representativeQueries: t.queries }),
        data: {
          name: t.name,
          description: t.description,
          registration: 'declarative',
          availableOn: `${SITE_URL}${t.page}`,
          autoSubmit: Boolean(t.autoSubmit),
          annotations: t.autoSubmit ? { readOnlyHint: true } : { readOnlyHint: false, destructiveHint: false },
        },
      })),
    ],
  };
  return new Response(JSON.stringify(catalog, null, 2), {
    headers: { 'Content-Type': 'application/json; charset=utf-8', 'Access-Control-Allow-Origin': '*' },
  });
}
