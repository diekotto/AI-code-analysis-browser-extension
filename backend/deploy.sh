#!/bin/bash

# Colores para los mensajes
GREEN='\033[0;32m'
RED='\033[0;31m'
NC='\033[0m' # No Color
YELLOW='\033[1;33m'

# Nombre de la función Lambda
LAMBDA_FUNCTION_NAME="tuxedo-dev-lmb-api-code-analysis-assistant"
REGION="eu-central-1"


# Set AWS default region
export AWS_DEFAULT_REGION=$REGION

# Directorio de trabajo
DIST_DIR="./dist"
DEPLOYMENT_PACKAGE="lambda-deploy.zip"

echo -e "${YELLOW}🚀 Iniciando deploy de la Lambda...${NC}"

# Verificar que existe el directorio dist
if [ ! -d "$DIST_DIR" ]; then
    echo -e "${RED}❌ Error: El directorio $DIST_DIR no existe. Ejecuta 'npm run build' primero${NC}"
    exit 1
fi

# Verificar que existe index.js en dist
if [ ! -f "$DIST_DIR/index.js" ]; then
    echo -e "${RED}❌ Error: No se encuentra $DIST_DIR/index.js${NC}"
    exit 1
fi

echo -e "${YELLOW}📦 Creando paquete de deployment...${NC}"

# Crear zip para el deployment
cd $DIST_DIR
zip -q $DEPLOYMENT_PACKAGE index.js*  # Incluye también source maps si existen
if [ $? -ne 0 ]; then
    echo -e "${RED}❌ Error al crear el zip${NC}"
    exit 1
fi

echo -e "${YELLOW}📤 Actualizando función Lambda...${NC}"

# Actualizar la función Lambda
aws lambda update-function-code \
    --function-name $LAMBDA_FUNCTION_NAME \
    --zip-file fileb://$DEPLOYMENT_PACKAGE \
    --publish

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Deploy completado con éxito${NC}"
    
    # Obtener y mostrar la URL de la función
    LAMBDA_URL=$(aws lambda get-function-url-config --function-name $LAMBDA_FUNCTION_NAME --query 'FunctionUrl' --output text)
    echo -e "${GREEN}🌍 URL de la función: ${YELLOW}$LAMBDA_URL${NC}"
else
    echo -e "${RED}❌ Error al actualizar la función Lambda${NC}"
fi

# Limpiar archivos temporales
echo -e "${YELLOW}🧹 Limpiando archivos temporales...${NC}"
rm $DEPLOYMENT_PACKAGE

echo -e "${GREEN}✨ Proceso completado${NC}"
