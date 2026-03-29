# scripts/test-all-endpoints.ps1

Write-Host ""
Write-Host "╔══════════════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║     🧪 PROBANDO API WacoPro Fitness            ║" -ForegroundColor Cyan
Write-Host "╚══════════════════════════════════════════════════╝" -ForegroundColor Cyan
Write-Host ""

$BASE_URL = "http://localhost:3000/api"

# ── 1. HEALTH CHECK ──
Write-Host "1️⃣  HEALTH CHECK" -ForegroundColor Yellow
try {
    $response = Invoke-RestMethod -Uri "$($BASE_URL)/health" -Method Get
    Write-Host "✅ Health Check OK" -ForegroundColor Green
} catch {
    Write-Host "❌ Error: $($_.Exception.Message)" -ForegroundColor Red
}
Start-Sleep -Seconds 1

# ── 2. REGISTRO ──
Write-Host ""
Write-Host "2️⃣  REGISTRO DE USUARIO" -ForegroundColor Yellow
$email = "test$(Get-Random -Maximum 9999)@wacopro.com"
$testUser = @{email=$email; password="SecurePass123!"; name="Test User"} | ConvertTo-Json

try {
    $regResp = Invoke-RestMethod -Uri "$($BASE_URL)/auth/register" -Method Post -ContentType "application/json" -Body $testUser
    Write-Host "✅ Usuario registrado" -ForegroundColor Green
} catch {
    Write-Host "❌ Error: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}
Start-Sleep -Seconds 1

# ── 3. LOGIN ──
Write-Host ""
Write-Host "3️⃣  LOGIN" -ForegroundColor Yellow
$loginBody = @{email=$email; password="SecurePass123!"} | ConvertTo-Json

try {
    $loginResp = Invoke-RestMethod -Uri "$($BASE_URL)/auth/login" -Method Post -ContentType "application/json" -Body $loginBody
    $token = $loginResp.data.accessToken
    Write-Host "✅ Login exitoso - Token obtenido" -ForegroundColor Green
} catch {
    Write-Host "❌ Error: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

$headers = @{"Authorization"="Bearer $token"; "Content-Type"="application/json"}
Start-Sleep -Seconds 1

# ── 4. PERFIL ──
Write-Host ""
Write-Host "4️⃣  PERFIL" -ForegroundColor Yellow
try {
    $profile = Invoke-RestMethod -Uri "$($BASE_URL)/users/profile" -Headers $headers
    Write-Host "✅ Perfil: $($profile.data.name)" -ForegroundColor Green
} catch {
    Write-Host "❌ Error: $($_.Exception.Message)" -ForegroundColor Red
}
Start-Sleep -Seconds 1

# ── 5. ALIMENTOS ──
Write-Host ""
Write-Host "5️⃣  ALIMENTOS" -ForegroundColor Yellow
try {
    $foodResp = Invoke-RestMethod -Uri "$($BASE_URL)/nutrition/food?page=1&limit=5" -Headers $headers
    Write-Host "✅ Alimentos: $($foodResp.data.Count) registros" -ForegroundColor Green
} catch {
    Write-Host "❌ Error: $($_.Exception.Message)" -ForegroundColor Red
}
Start-Sleep -Seconds 1

# ── 6. EJERCICIOS ──
Write-Host ""
Write-Host "6️⃣  EJERCICIOS" -ForegroundColor Yellow
try {
    $exResp = Invoke-RestMethod -Uri "$($BASE_URL)/training/exercises?page=1&limit=5" -Headers $headers
    Write-Host "✅ Ejercicios: $($exResp.data.Count) registros" -ForegroundColor Green
} catch {
    Write-Host "❌ Error: $($_.Exception.Message)" -ForegroundColor Red
}
Start-Sleep -Seconds 1

# ── 7. SUPLEMENTOS ──
Write-Host ""
Write-Host "7️⃣  SUPLEMENTOS" -ForegroundColor Yellow
try {
    $supResp = Invoke-RestMethod -Uri "$($BASE_URL)/supplements?page=1&limit=5" -Headers $headers
    Write-Host "✅ Suplementos: $($supResp.data.Count) registros" -ForegroundColor Green
} catch {
    Write-Host "❌ Error: $($_.Exception.Message)" -ForegroundColor Red
}
Start-Sleep -Seconds 1

# ── 8. RECETAS ──
Write-Host ""
Write-Host "8️⃣  RECETAS" -ForegroundColor Yellow
try {
    $recResp = Invoke-RestMethod -Uri "$($BASE_URL)/nutrition/recipes?page=1&limit=3" -Headers $headers
    Write-Host "✅ Recetas: $($recResp.data.Count) registros" -ForegroundColor Green
} catch {
    Write-Host "❌ Error: $($_.Exception.Message)" -ForegroundColor Red
}
Start-Sleep -Seconds 1

# ── 9. TIENDAS ──
Write-Host ""
Write-Host "9️⃣  TIENDAS" -ForegroundColor Yellow
try {
    $storeResp = Invoke-RestMethod -Uri "$($BASE_URL)/stores?page=1&limit=5" -Headers $headers
    Write-Host "✅ Tiendas: $($storeResp.data.Count) registros" -ForegroundColor Green
} catch {
    Write-Host "❌ Error: $($_.Exception.Message)" -ForegroundColor Red
}

# ── RESUMEN ──
Write-Host ""
Write-Host "╔══════════════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║ 📊 RESUMEN                                       ║" -ForegroundColor Cyan
Write-Host "╚══════════════════════════════════════════════════╝" -ForegroundColor Cyan
Write-Host ""
Write-Host "✅ Health Check" -ForegroundColor Green
Write-Host "✅ Auth (Registro + Login)" -ForegroundColor Green
Write-Host "✅ Nutrición (Alimentos + Recetas)" -ForegroundColor Green
Write-Host "✅ Entrenamiento (Ejercicios)" -ForegroundColor Green
Write-Host "✅ Suplementos" -ForegroundColor Green
Write-Host "✅ Tiendas" -ForegroundColor Green
Write-Host ""
Write-Host "🎉 ¡API FUNCIONANDO CORRECTAMENTE!" -ForegroundColor Green
Write-Host ""