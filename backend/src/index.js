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
    // Aquí iría la lógica de análisis de código
    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        ...corsHeaders,
      },
      body: JSON.stringify({
        message: 'Hello World!',
        recommendations: [
          {
            title: 'Test Recommendation',
            description: 'This is a test recommendation for your code.',
          },
        ],
      }),
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
