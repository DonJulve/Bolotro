# Bolotro

Este repositorio contiene un videojuego de Bolos 3D compatible para cualquier OS y con un motor creado desde 0 en javascript.

## Imágenes del juego

### Menú principal
![overview1](/Screenshots/overview1.png "overview1")

### Controles
![overview2](/Screenshots/overview2.png "overview1")

### Juego
![overview3](/Screenshots/overview1.png "overview3")

## Contenido

- **`main.js`**  
  Es el archivo principal del juego. Inicializa los componentes clave como la escena y la cámara, y arranca el bucle de animación.

- **`Camera.js`**  
  Define la cámara del juego y su comportamiento.

- **`InputManager.js`**  
  Se encarga de gestionar las respuestas a las pulsaciones de teclado del usuario.

- **`Geometría.js`**  
  Define la geometría de los cubos, bolas y planos del juego.

- **`SceneManager.js`**  
  Administra los objetos de la escena, y coordina la renderización de los mismos junto al `WebGLManager`.

- **`WebGLManager.js`**  
  Maneja directamente la inicialización y configuración del contexto WebGL, incluyendo shaders, buffers y texturas necesarias para el renderizado.

- **`Objects.js`**  
  Define las entidades del juego (bola de bolos, bolos y suelo), junto a sus atributos y comportamiento.

- **`PhysicsManager.js`**  
  Controla la física de la simulación, como movimiento, colisiones y fuerzas. Véase la sección motor-de-físicas en la memoria para entender el comportamiento en detalle.

- **`ForceBar.js`**  
  Controla el comportamiento visual de la barra de fuerza y la fuerza aplicada a la bola una vez que esta es lanzada.

- **`MassManager.js`**  
  Gestiona la masa que tiene la bola antes de que la misma sea lanzada. El cómo afecta a la jugabilidad puede ser consultado en la sección motor de físicas.

- **`ScoreManager.js`**  
  Gestiona el sistema de puntos, manejando tanto los bonificadores y turno extra en la última jugada en caso de pleno, como la tabla visual de puntuaciones.

- **`OBJLoader.js`**  
  Es un parseador de OBJs que consiste en leer los vértices y normales de un OBJ para poder transformarlo en un modelo 3D en el juego ya renderizado.


## Requisitos

Tener instalado python3.

## Instalación y Uso

Clona el repositorio:
```sh
git clone https://github.com/DonJulve/Bolotro
```

### Windows

```sh
./Bolotro.bat
```

O hacer doble click sobre Bolotro.bat
### Linux
```sh
./Bolotro.sh
```

## Teclonogías empleadas:

- **Shell** y **Batch scripting**: Lenguaje de scripting usado para poder ejecutar el juego en cada sistema.
- **Python**: Lenguaje usado para crear un servidor y evitar problemas de CORS.
- **Javascript**: Lenguaje en el que está escrito todo el código del juego.


