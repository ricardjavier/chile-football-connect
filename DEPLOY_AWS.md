# Deploy en AWS (barato y escalable)

Este proyecto (Vite + React) se despliega muy bien como sitio estatico con:

- S3 (archivos estaticos)
- CloudFront (CDN global)
- ACM (certificado SSL gratis)
- Route 53 (DNS, opcional)

## 1) Arquitectura recomendada

- Build local o en CI: genera `dist/`
- GitHub Actions sube `dist/` a S3
- CloudFront sirve el sitio con HTTPS
- CloudFront redirige rutas SPA a `index.html`

## 2) Crear recursos AWS

### S3 bucket

- Nombre sugerido: `chile-football-connect-prod`
- Bloquear acceso publico del bucket (recomendado)
- No usar "Static website hosting" si usaras CloudFront con OAC

### CloudFront distribution

- Origin: bucket S3
- Viewer protocol: Redirect HTTP to HTTPS
- Default root object: `index.html`
- SPA fallback:
  - Custom error responses:
    - `403 -> /index.html (200)`
    - `404 -> /index.html (200)`

### Certificado SSL (ACM)

- Crear en `us-east-1` para CloudFront
- Validar dominio (DNS)

### Route53 (opcional)

- Crear zona hospedada y registro `A/AAAA` alias a CloudFront

## 3) Configurar GitHub Actions

Este repo ya incluye workflow en `.github/workflows/deploy-aws.yml`.

Debes crear estos Secrets en GitHub:

- `AWS_REGION` (ej: `us-east-1`)
- `S3_BUCKET_NAME`
- `CLOUDFRONT_DISTRIBUTION_ID`
- `AWS_ROLE_TO_ASSUME` (rol IAM para OIDC)
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`

## 4) Configurar IAM/OIDC (sin claves largas)

Recomendado: GitHub OIDC con `aws-actions/configure-aws-credentials`.

Permisos minimos del rol:

- `s3:ListBucket` en tu bucket
- `s3:PutObject`, `s3:DeleteObject` en `bucket/*`
- `cloudfront:CreateInvalidation` en tu distribucion

Trust policy: limitar al repo y branch `main`.

## 5) Flujo de despliegue

- Push a `main` -> workflow ejecuta lint/test/build
- Si pasa, publica en S3 e invalida CloudFront
- Tambien puedes ejecutar manualmente desde "Actions"

## 6) Costos estimados (MVP)

- S3: ~USD 0.5-2/mes (sitio chico)
- CloudFront: ~USD 1-8/mes (depende del trafico)
- Route53: ~USD 0.5/mes por zona + dominio

Total tipico inicial: ~USD 2-10/mes.

## 7) Comandos utiles locales (opcional)

```bash
npm run build
aws s3 sync dist/ s3://TU_BUCKET --delete
aws cloudfront create-invalidation --distribution-id TU_DISTRIBUCION --paths "/*"
```
