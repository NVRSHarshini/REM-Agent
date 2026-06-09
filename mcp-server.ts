import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";
import dotenv from "dotenv";

dotenv.config();

const server = new Server(
  {
    name: "arize-phoenix-log-server",
    version: "1.0.0",
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

// Register Tool
server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: [
      {
        name: "log_trace",
        description: "Log an application trace with compliance data and status to Arize Phoenix in OTLP JSON format.",
        inputSchema: {
          type: "object",
          properties: {
            traceId: { type: "string", description: "The original trace identifier" },
            complianceScore: { type: "number", description: "Evaluation compliance score (0-100)" },
            verdict: { type: "string", description: "Evaluation verdict (e.g., compliant, non-compliant)" },
            riskLevel: { type: "string", description: "Risk level of the payload (e.g., low, medium, high)" },
            missingTools: {
              type: "array",
              items: { type: "string" },
              description: "Array of tools that were missed during evaluation"
            },
            input: { type: "string", description: "The customer's input user message" },
            output: { type: "string", description: "The agent's text response to the user" }
          },
          required: ["traceId", "complianceScore", "verdict", "riskLevel", "missingTools", "input", "output"]
        }
      }
    ]
  };
});

// Handle Tool Calling
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  if (request.params.name !== "log_trace") {
    throw new Error(`Unknown tool: ${request.params.name}`);
  }

  const { traceId, complianceScore, verdict, riskLevel, missingTools, input, output } = request.params.arguments as {
    traceId: string;
    complianceScore: number;
    verdict: string;
    riskLevel: string;
    missingTools: string[];
    input: string;
    output: string;
  };

  // Build targetUrl and headers precisely using environment variables
  let targetUrl = '';
  if (process.env.OTEL_EXPORTER_OTLP_ENDPOINT) {
    targetUrl = process.env.OTEL_EXPORTER_OTLP_ENDPOINT;
  } else if (process.env.PHOENIX_COLLECTOR_ENDPOINT) {
    targetUrl = process.env.PHOENIX_COLLECTOR_ENDPOINT;
  } else {
    targetUrl = 'https://app.phoenix.arize.com';
  }

  if (targetUrl.includes('app.phoenix.arize.com') && !targetUrl.includes('/s/')) {
    targetUrl = targetUrl.replace('app.phoenix.arize.com', 'app.phoenix.arize.com/s/hannytpt');
  }

  if (!targetUrl.endsWith('/v1/traces')) {
    targetUrl = targetUrl.replace(/\/$/, '') + '/v1/traces';
  }

  const apiKey = process.env.PHOENIX_API_KEY || '';
  const requestHeaders: Record<string, string> = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${apiKey}`,
    'api-key': apiKey,
    'api_key': apiKey,
    'x-project-name': process.env.PHOENIX_PROJECT_NAME || 'REM Agent'
  };

  if (process.env.OTEL_EXPORTER_OTLP_HEADERS) {
    const headerPairs = process.env.OTEL_EXPORTER_OTLP_HEADERS.split(',');
    for (const pair of headerPairs) {
      const eqIdx = pair.indexOf('=');
      if (eqIdx !== -1) {
        const key = pair.substring(0, eqIdx).trim();
        const rawVal = pair.substring(eqIdx + 1).trim();
        if (key && rawVal) {
          let val = rawVal;
          if (rawVal.includes('%')) {
            try {
              val = decodeURIComponent(rawVal);
            } catch (_) {}
          }
          requestHeaders[key] = val;
        }
      }
    }
  }

  // Build the clean trace and span IDs in standard OTLP hex format
  const cleanTraceId = traceId.replace(/-/g, '').substring(0, 32).padEnd(32, '0');
  const cleanSpanId = Math.random().toString(16).substring(2, 10).padEnd(16, '0');

  const nowMs = Date.now();
  const startTimeUnixNano = ((nowMs - 200) * 1000000).toString();
  const endTimeUnixNano = (nowMs * 1000000).toString();

  // Create OTLP JSON payload with resourceAttributes, scopeSpans and spans with compliance attributes
  const otlpTracePayload = {
    resourceSpans: [
      {
        resource: {
          attributes: [
            {
              key: "service.name",
              value: { stringValue: "rem-agent-mcp" }
            }
          ]
        },
        scopeSpans: [
          {
            scope: {
              name: "mcp-server-logger",
              version: "1.0.0"
            },
            spans: [
              {
                traceId: cleanTraceId,
                spanId: cleanSpanId,
                name: "mcp_log_trace_execution",
                kind: 1, // CLIENT/INTERNAL
                startTimeUnixNano: startTimeUnixNano,
                endTimeUnixNano: endTimeUnixNano,
                attributes: [
                  { key: "trace_id", value: { stringValue: traceId } },
                  { key: "compliance_score", value: { doubleValue: complianceScore } },
                  { key: "verdict", value: { stringValue: verdict } },
                  { key: "risk_level", value: { stringValue: riskLevel } },
                  { key: "missing_tools", value: { stringValue: missingTools.join(", ") } },
                  { key: "user_request", value: { stringValue: input } },
                  { key: "agent_response_summary", value: { stringValue: output } }
                ],
                status: {
                  code: 1 // Status OK
                }
              }
            ]
          }
        ]
      }
    ]
  };

  try {
    const response = await fetch(targetUrl, {
      method: "POST",
      headers: requestHeaders,
      body: JSON.stringify(otlpTracePayload)
    });

    if (!response.ok) {
      const respText = await response.text();
      return {
        content: [
          {
            type: "text",
            text: `Failed to export OTLP trace. Server returned status ${response.status}: ${respText}`
          }
        ],
        isError: true
      };
    }

    return {
      content: [
        {
          type: "text",
          text: `Successfully exported mcp-logged trace ${traceId} to Arize Phoenix.`
        }
      ]
    };
  } catch (error: any) {
    return {
      content: [
        {
          type: "text",
          text: `Failed to export OTLP trace via fetch due to error: ${error.message || String(error)}`
        }
      ],
      isError: true
    };
  }
});

// Run with Stdio Server Transport
async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("Arize Phoenix MCP Server running on Stdio Transport...");
}

main().catch((error) => {
  console.error("Fatal error starting Arize Phoenix MCP Server:", error);
  process.exit(1);
});
