# Usa una imagen base oficial de Python
FROM python:3.9-slim

# Establece el directorio de trabajo en el contenedor
WORKDIR /app

# Copia el archivo de requisitos (requirements.txt)
COPY /server/requirements.txt .

# Instala las dependencias
RUN pip install --no-cache-dir -r requirements.txt

# Copia el código de la aplicación al contenedor
COPY . .

# Expone el puerto en el que la aplicación está corriendo (opcional)
EXPOSE ${SERVER_PORT}

# Comando para ejecutar la aplicación
CMD ["python", "./server/main.py"]
