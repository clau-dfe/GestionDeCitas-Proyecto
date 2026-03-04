<h1> DOCUMENTACION</h1>
---

# 📌 Plataforma de Citas Dermatológicas

*Nombre de la aprendiz:* Claudia Rincon
*Número de ficha:* 3118300

---

## 🧴 Sobre el proyecto

Este proyecto es una *plataforma de citas dermatológicas, desarrollada con **HTML, CSS y JavaScript puro*, como parte del proceso de aprendizaje inicial.

Actualmente, falta conectar el backend con el frontend, y terminar de desarrollar unos modulos del frontend
---

## 🚀 Cómo visualizar el proyecto

Para ver la plataforma en funcionamiento:

1. Clona este repositorio:
```
   bash
   git clone https://github.com/usuario/repositorio.git
```

2. Abre el archivo:
```   
   index.html
```

3. Debes iniciar sesiòn con los siguientes datos:
```  
* Correo: admin@gmail.com
* Contraseña: 1234
```  

4. Desde el menu podrás acceder a los módulos disponibles:

* Creación de citas
* Registro de pacientes
* Registro de médicos


Características principales:
- Registro y autenticación** de usuarios (pacientes y dermatólogos)
- Gestión de citas** (crear, consultar, cancelar)
- Historial médico** por paciente
- Autenticación segura** con JWT
- Base de datos** MySQL con Sequelize

 Pasos para ejecutar el proyecto


3. Configurar el backend
cd backend
cp .env.example .env
# Editar el archivo .env con tus datos (contraseña de MySQL, etc.)
npm install
npm run dev

Notas para el Profesor
El backend corre en http://localhost:5000

El frontend se abre directamente con index.html

La base de datos debe llamarse gestion de citas medicas (con espacios)

La contraseña de MySQL utilizada es la que está en el archivo .env (no incluida en el repositorio por seguridad)

El archivo .env.example muestra las variables necesarias
