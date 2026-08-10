@echo off
title Kayip Esya Sistem Baslatici
echo ========================================================
echo   KAYIP ESYA ACIK ARTIRMA VE SATIN ALMA SISTEMI
echo   Veritabani, Backend ve Frontend Baslatiliyor...
echo ========================================================
echo.

echo [1/3] PostgreSQL Veritabani Kontrol Ediliyor ve Baslatiliyor...
start "PostgreSQL Database" /min "C:\Program Files\PostgreSQL\18\bin\postgres.exe" -D "C:\Program Files\PostgreSQL\18\data"

echo.
echo [2/3] ASP.NET Core Secure Backend (Port 5031 SSL / 5030) Baslatiliyor...
start "Backend (ASP.NET Core SSL)" cmd /k "cd /d %~dp0backend && dotnet run"

echo [3/3] React Secure Frontend (Port 5173 SSL) Baslatiliyor...
start "Frontend (React Vite SSL)" cmd /k "cd /d %~dp0frontend && npm run dev"

echo.
echo ========================================================
echo   Sistem Basariyla (HTTPS / SSL Güvenli) Baslatildi!
echo   Güvenli Tarayici Adresi: https://localhost:5173
echo   Güvenli API Adresi: https://localhost:5031
echo ========================================================

