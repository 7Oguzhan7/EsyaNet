@echo off
chcp 65001 > nul
echo ==========================================
echo    EsyaNet GitHub Senkronizasyon Araci
echo ==========================================
echo.
echo 1. Degisiklikler taraniyor...
git add .
echo.
echo 2. Paket hazirlaniyor (Commit)...
git commit -m "EsyaNet Guncelleme - %date% %time%"
echo.
echo 3. GitHub'a aktariliyor (Push)...
git push origin main
echo.
echo ==========================================
echo    OK! GitHub Senkronizasyonu Tamamlandi!
echo ==========================================
pause
