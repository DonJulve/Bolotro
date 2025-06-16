#!/bin/bash

python3 -m http.server 3000 > /dev/null 2>&1 &
xdg-open http://localhost:3000/src/mainMenu/main_menu.html
