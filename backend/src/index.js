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

  try {
    const command = new InvokeModelCommand({
      modelId: 'anthropic.claude-3-5-sonnet-20240620-v1:0',
      contentType: 'application/json',
      accept: 'application/json',
      body: JSON.stringify({
        messages: [
          {
            role: 'user',
            content: prompt,
          },
        ],
        max_tokens: 1024,
        temperature: 0.5,
        anthropic_version: 'bedrock-2023-05-31',
      }),
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

export const handler = async (event) => {
  // Manejar la petición OPTIONS (preflight)
  if (event.requestContext.http.method === 'OPTIONS') {
    return {
      statusCode: 204,
      'Access-Control-Max-Age': '86400',
    };
  }

  // Solo aceptamos POST en /analyze
  if (event.requestContext.http.method !== 'POST' || !event.rawPath.endsWith('/analyze')) {
    return {
      statusCode: 405,
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        error: 'Method not allowed',
      }),
    };
  }

  try {
    const body = JSON.parse(event.body);
    if (!body.code) {
      return {
        statusCode: 400,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          error: 'No code provided',
        }),
      };
    }
    const analysis = await analyzeCode(body.code);
    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(analysis),
    };
  } catch (error) {
    console.error('Error:', error);
    return {
      statusCode: 500,
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        error: 'Internal server error',
      }),
    };
  }
};
