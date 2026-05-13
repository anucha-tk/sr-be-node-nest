#!/usr/bin/env bash

# This script exports the current Keycloak realm configuration to the keycloak-init directory.
# The exported JSON will automatically be imported next time Keycloak starts with a fresh database.

set -e

# Configuration
CONTAINER_NAME="sr-keycloak"
REALM_NAME="sr-realm"
EXPORT_DIR="./keycloak-init"
EXPORT_FILE="realm-export.json"

echo "=== Keycloak Realm Exporter ==="

# Check if container is running
if ! docker ps | grep -q "$CONTAINER_NAME"; then
  echo "Error: Keycloak container ($CONTAINER_NAME) is not running."
  echo "Please start it using 'docker-compose up -d' first."
  exit 1
fi

# Ensure export directory exists locally
mkdir -p "$EXPORT_DIR"

echo "Exporting realm '$REALM_NAME' from $CONTAINER_NAME..."

# Run export inside the container. We export to /tmp first, then copy it out.
# This uses the built-in kc.sh tool to export a single realm
docker exec -t "$CONTAINER_NAME" /opt/keycloak/bin/kc.sh export \
  --dir /tmp/export \
  --realm "$REALM_NAME"

echo "Copying exported files to host directory: $EXPORT_DIR"

# Keycloak exports might be multiple files if the realm is large or multiple realms.
# We will just copy the entire directory out
docker cp "$CONTAINER_NAME:/tmp/export/." "$EXPORT_DIR/"

# Clean up inside container
docker exec -t "$CONTAINER_NAME" rm -rf /tmp/export

echo "=== Export Complete ==="
echo "Your Keycloak configuration has been saved to $EXPORT_DIR/"
echo "Because 'docker-compose.yml' mounts this folder to '/opt/keycloak/data/import' and uses '--import-realm',"
echo "your realm, clients, users, and API keys will be automatically restored even after 'docker-compose down -v'."
