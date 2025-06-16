@echo off
start "" python3 -m http.server 8000
timeout /t 2 /nobreak >nul
start "" http://localhost:8000/src/mainMenu/main_menu.html
