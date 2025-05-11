FROM python:3.11-slim

# Establece el directorio de trabajo
WORKDIR /app

# Copia todos los archivos al contenedor
COPY . .

# Expone el puerto 8000
EXPOSE 8000

# Comando por defecto: servir usando http.server
CMD ["python3", "-m", "http.server", "8000"]

