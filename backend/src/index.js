import { BedrockRuntimeClient, InvokeModelCommand } from '@aws-sdk/client-bedrock-runtime';

// Inicializar el cliente de Bedrock
const bedrockClient = new BedrockRuntimeClient({
  region: process.env.AWS_REGION,
});

const analyzeCode = async (code) => {
  const prompt = `
    Por favor, analiza el siguiente código y proporciona recomendaciones 
    para mejorarlo. Incluye sugerencias sobre legibilidad, mantenibilidad,
    y posibles problemas de seguridad.

    Código a analizar:
    #BEGIN_CODE
    ${code}
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

  const payload = {
    prompt: `\n\nHuman: ${prompt}\n\nAssistant: Let me analyze that code and provide recommendations in the requested JSON format.`,
    max_tokens: 1024,
    temperature: 0.5,
    anthropic_version: 'bedrock-2023-05-31',
  };

  try {
    const command = new InvokeModelCommand({
      modelId: 'anthropic.claude-3-5-sonnet-20241022-v2:0',
      contentType: 'application/json',
      accept: 'application/json',
      body: JSON.stringify(payload),
    });

    const response = await bedrockClient.send(command);
    const responseBody = JSON.parse(new TextDecoder().decode(response.body));

    // Parseamos la respuesta de Claude (asumiendo que devuelve JSON válido)
    const analysisResult = JSON.parse(responseBody.completion);

    return analysisResult;
  } catch (error) {
    console.error('Error al analizar el código:', error);
    throw new Error('Error en el análisis de código');
  }
};

const corsHeaders = {
  'Access-Control-Max-Age': '86400', // 24 horas de cache para el preflight
};

export const handler = async (event) => {
  // Manejar la petición OPTIONS (preflight)
  if (event.requestContext.http.method === 'OPTIONS') {
    return {
      statusCode: 204, // No Content
      headers: corsHeaders,
    };
  }

  // Solo aceptamos POST en /analyze
  if (event.requestContext.http.method !== 'POST' || !event.rawPath.endsWith('/analyze')) {
    return {
      statusCode: 405,
      headers: {
        'Content-Type': 'application/json',
        ...corsHeaders,
      },
      body: JSON.stringify({
        error: 'Method not allowed',
      }),
    };
  }

  try {
    const analysis = await analyzeCode(body.code);
    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        ...corsHeaders,
      },
      body: JSON.stringify(analysis),
    };
  } catch (error) {
    console.error('Error:', error);
    return {
      statusCode: 500,
      headers: {
        'Content-Type': 'application/json',
        ...corsHeaders,
      },
      body: JSON.stringify({
        error: 'Internal server error',
      }),
    };
  }
};
