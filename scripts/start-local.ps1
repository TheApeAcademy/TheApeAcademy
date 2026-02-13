param()

Write-Host "Starting local services (Postgres + app) via docker-compose..."
docker compose -f docker-compose.local.yml up -d db

Write-Host "Waiting for Postgres to be ready (sleep 4s)"
Start-Sleep -Seconds 4

Write-Host "Running Prisma generate and migrations inside app container"
docker compose -f docker-compose.local.yml run --rm app sh -c "npx prisma generate && npx prisma migrate deploy || npx prisma migrate dev --name init --preview-feature"

Write-Host "Starting app container"
docker compose -f docker-compose.local.yml up --build -d app

Write-Host "All services started. Tail server logs with:`docker compose -f docker-compose.local.yml logs -f app`"
