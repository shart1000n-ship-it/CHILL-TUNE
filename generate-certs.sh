#!/bin/bash

# Generate SSL certificates for TRUE TALK HTTPS development

echo "🔐 Generating SSL certificates for TRUE TALK..."

# Create certs directory
mkdir -p server/certs

# Generate private key
openssl genrsa -out server/certs/key.pem 2048

# Generate certificate
openssl req -new -x509 -key server/certs/key.pem -out server/certs/cert.pem -days 365 -subj "/C=US/ST=State/L=City/O=TRUE TALK/CN=localhost"

echo "✅ SSL certificates generated successfully!"
echo "📁 Certificates saved in: server/certs/"
echo "🔑 Private key: server/certs/key.pem"
echo "📜 Certificate: server/certs/cert.pem"
echo ""
echo "⚠️  Note: These are self-signed certificates for development only."
echo "   Your browser will show a security warning - this is normal for local development."
echo "   Click 'Advanced' and 'Proceed to localhost' to continue."
echo ""
echo "🚀 You can now start your HTTPS server!"
