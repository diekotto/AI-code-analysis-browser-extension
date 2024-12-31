import { BedrockRuntimeClient, InvokeModelCommand } from '@aws-sdk/client-bedrock-runtime';

// Configuration
const CONFIG = {
  MAX_CODE_SIZE: 100000, // 100KB
  DEFAULT_MAX_TOKENS: 1024,
  DEFAULT_TEMPERATURE: 0.5,
  CORS_HEADERS: {
    'Access-Control-Allow-Origin': '*', // Configure appropriately
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
  },
};

// Initialize Bedrock client
const bedrockClient = new BedrockRuntimeClient({
  region: process.env.AWS_REGION,
});

// Analysis prompt template
const ANALYSIS_PROMPT = `
  Por favor, analiza el siguiente código y proporciona recomendaciones 
  para mejorarlo. Incluye sugerencias sobre legibilidad, mantenibilidad,
  y posibles problemas de seguridad.

  Código a analizar:
  #BEGIN_CODE
  {{CODE}}
  #END_CODE
  Proporciona tus recomendaciones en formato JSON con la siguiente estructura:
  {
    "recommendations": [
      {
        "title": "Título de la recomendación",
        "description": "Descripción detallada",
        "severity": "high|medium|low",
        "category": "security|performance|maintainability|readability"
      }
    ]
  }
`;

// Validate input code
const validateCode = (code) => {
  if (!code || typeof code !== 'string') {
    throw new Error('Invalid code format');
  }
  if (code.length > CONFIG.MAX_CODE_SIZE) {
    throw new Error(`Code size exceeds maximum limit of ${CONFIG.MAX_CODE_SIZE} bytes`);
  }
  // Add more validations as needed
  return code;
};

// Call Bedrock/Claude for analysis
const analyzeCode = async (code, requestId) => {
  console.log(`Starting analysis for request ${requestId}`);

  try {
    const prompt = ANALYSIS_PROMPT.replace('{{CODE}}', code);

    const command = new InvokeModelCommand({
      modelId: process.env.BEDROCK_MODEL_ID || 'anthropic.claude-3-5-sonnet-20240620-v1:0',
      contentType: 'application/json',
      accept: 'application/json',
      body: JSON.stringify({
        messages: [
          {
            role: 'user',
            content: prompt,
          },
        ],
        max_tokens: parseInt(process.env.MAX_TOKENS) || CONFIG.DEFAULT_MAX_TOKENS,
        temperature: parseFloat(process.env.TEMPERATURE) || CONFIG.DEFAULT_TEMPERATURE,
        anthropic_version: 'bedrock-2023-05-31',
      }),
    });

    const response = await bedrockClient.send(command);
    const responseBody = JSON.parse(new TextDecoder().decode(response.body));

    try {
      return JSON.parse(responseBody.completion);
    } catch (parseError) {
      console.error(`Error parsing Claude response for request ${requestId}:`, parseError);
      throw new Error('Invalid response format from analysis service');
    }
  } catch (error) {
    console.error(`Analysis error for request ${requestId}:`, error);
    throw error;
  }
};

// Create standardized response
const createResponse = (statusCode, body, headers = {}) => ({
  statusCode,
  headers: {
    'Content-Type': 'application/json',
    ...CONFIG.CORS_HEADERS,
    ...headers,
  },
  body: JSON.stringify(body),
});

// Main handler
exports.handler = async (event) => {
  const requestId = event.requestContext?.requestId || 'unknown';
  console.log(`Processing request ${requestId}`, { path: event.rawPath, method: event.requestContext?.http?.method });

  // Handle OPTIONS
  if (event.requestContext?.http?.method === 'OPTIONS') {
    return createResponse(204, null, { 'Access-Control-Max-Age': '86400' });
  }

  // Validate request
  if (event.requestContext?.http?.method !== 'POST' || !event.rawPath?.endsWith('/analyze')) {
    return createResponse(405, { error: 'Method not allowed' });
  }

  try {
    // Parse and validate request body
    const body = JSON.parse(event.body || '{}');

    if (!body.code) {
      return createResponse(400, { error: 'No code provided' });
    }

    // Validate code
    const validatedCode = validateCode(body.code);

    // Perform analysis
    const analysis = await analyzeCode(validatedCode, requestId);
    return createResponse(200, analysis);
  } catch (error) {
    console.error(`Error in request ${requestId}:`, error);

    // Handle specific error types
    if (error.message === 'Invalid code format' || error.message.includes('exceeds maximum limit')) {
      return createResponse(400, { error: error.message });
    }

    if (error.name === 'SyntaxError') {
      return createResponse(400, { error: 'Invalid request body' });
    }

    // Generic error response
    return createResponse(500, {
      error: 'Internal server error',
      requestId, // Include for troubleshooting
    });
  }
};
