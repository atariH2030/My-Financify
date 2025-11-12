@echo off
REM Script para inicializar o ambiente de desenvolvimento
REM Adiciona Node.js ao PATH e inicia o servidor

echo 🚀 Iniciando My-Financify v2.0...
echo.

REM Adicionar Node.js ao PATH temporariamente
set "PATH=C:\Program Files\nodejs;%PATH%"

REM Verificar se Node.js está funcionando
echo ✅ Verificando Node.js...
node --version
npm --version
echo.

REM Instalar dependências se necessário
echo 📦 Verificando dependências...
npm install
echo.

REM Iniciar servidor de desenvolvimento
echo 🌐 Iniciando servidor de desenvolvimento...
echo 📍 URL: http://localhost:3000/
echo ⚡ Para parar o servidor, pressione Ctrl+C
echo.
npm run dev

pause