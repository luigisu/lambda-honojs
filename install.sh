#!/bin/sh

# Variables
LATEST=$(curl -v --stderr - https://github.com/aws/aws-sam-cli | grep "releases/tag/v" | cut -d"=" -f 5 | cut -d"v" -f2 | cut -d"\"" -f 1)
SAM_VERSION="${SAM_VERSION:-$LATEST}"
VENDOR_PATH="/opt"
TMP_PATH="/tmp"
AWSSAM_URL="https://github.com/aws/aws-sam-cli/releases/download/v${SAM_VERSION}/aws-sam-cli-linux-x86_64.zip"

# Función para verificar la arquitectura
get_arch() {
  uname -m
}

# Comprobar si sam ya está instalado
#if [ ! -f /usr/local/bin/sam ]; then
  ARCH=$(get_arch)

  # Instalación según la arquitectura
  if [ "$ARCH" = "arm" ]; then
    pip install --no-cache-dir --disable-pip-version-check aws-sam-cli
  else
    curl '-#' -fL -o "$TMP_PATH/sam.zip" "$AWSSAM_URL"
    unzip -q "$TMP_PATH/sam.zip" -d "$TMP_PATH/sam"
    rm -f "$TMP_PATH/sam.zip"
    "$TMP_PATH/sam/install" -i "$VENDOR_PATH/aws/sam" -b /usr/local/bin
    rm -rf "$TMP_PATH/sam"
  fi

  # Verificación de la instalación
  sam --version
#else
 # echo "SAM CLI ya está instalado."
#fi
