# 🏟️ SISTEMA DE RESERVAS DEPORTIVAS
**PLATAFORMA INTEGRAL PARA LA GESTIÓN EFICIENTE DE CANCHAS, USUARIOS Y RESERVAS DEPORTIVAS**


---

## 👥 Equipo de Desarrollo

**Asignatura**: Entornos de Programación - Grupo E1 

**Integrantes**: 

* Juan David Saavedra González - 2214111

* Yosert Alejandro Higuera Lizarazo - 2205003

**Periodo**: 2025-2

**Universidad Industrial de Santander**

---

## 🛠️ Stack Tecnológico

### **BackEnd**
[![Spring Boot](https://img.shields.io/badge/Spring%20Boot-3.5.6-6DB33F?logo=springboot)]() 
[![Spring Data JPA](https://img.shields.io/badge/Spring%20Data%20JPA-Active-217346?logo=spring)]() 
[![Maven](https://img.shields.io/badge/Maven-4.0.0-C71A36?logo=apachemaven)]()

### **FrontEnd**
[![React](https://img.shields.io/badge/React-18-61DAFB?logo=react&logoColor=white)]() 
[![HTML5](https://img.shields.io/badge/HTML5-E34F26?logo=html5&logoColor=white)]() 
[![CSS3](https://img.shields.io/badge/CSS3-1572B6?logo=css3&logoColor=white)]() 
[![JavaScript](https://img.shields.io/badge/JavaScript-ES6-F7DF1E?logo=javascript&logoColor=black)]() 

### **Base de Datos**
[![MySQL](https://img.shields.io/badge/MySQL-8.0-00618A?logo=mysql&logoColor=white)]() 
[![Hibernate](https://img.shields.io/badge/Hibernate-ORM-59666C?logo=hibernate&logoColor=white)]()

### **Herramientas de Desarrollo**
[![Git](https://img.shields.io/badge/Git-F05032?logo=git&logoColor=white)]() 
[![GitHub](https://img.shields.io/badge/GitHub-181717?logo=github&logoColor=white)]() 
[![Azure DevOps](https://img.shields.io/badge/Azure%20DevOps-0078D7?logo=azuredevops&logoColor=white)]() 
[![Eclipse](https://img.shields.io/badge/Eclipse%20IDE-2C2255?logo=eclipseide&logoColor=white)]() 
[![Spring Tools Suite](https://img.shields.io/badge/Spring%20Tools%20Suite-6DB33F?logo=spring&logoColor=white)]()


---

## Gestión del Proyecto (Azure):

### Para ver las historias de usuario que hemos realizado en los diferentes Sprints de este Proyecto usando la metodología de desarrollo de proyectos SCRUM ve al enlace de abajo y sigue esta ruta:

- En Projects seleccionas "Reserva de canchas".
- Menú de la izquierda en la opción "Boards".
- Y luego en "Sprints".

https://dev.azure.com/reservadechanchas/


---

## 📖 Descripción del Proyecto

**Sistema de Reservas Deportivas** es una plataforma web completa diseñada para optimizar la gestión de instalaciones deportivas. Desarrollado como proyecto académico para la asignatura de Entornos de Programación, ofrece una solución integral que conecta administradores y usuarios en un ecosistema deportivo eficiente.

https://github.com/user-attachments/assets/9b6cc939-887c-49b8-ad15-beffec6dc7ff


---

### 🎯 Objetivos Principales
- Digitalizar y automatizar el proceso de reservas deportivas
- Mejorar la experiencia del usuario final
- Optimizar la utilización de instalaciones deportivas
- Proporcionar herramientas avanzadas de gestión para administradores


---

## ✨ Características Destacadas

### 👨‍💻 Para Administradores
- **Gestión Completa de Usuarios**: Control de roles y permisos (ADMIN, OPERATOR, USER)
- **Administración de Canchas**: Configuración de deportes, ubicaciones y tarifas
- **Monitoreo en Tiempo Real**: Visualización instantánea de reservas activas
- **Reportes Avanzados**: Estadísticas detalladas y métricas de uso
- **Configuración Flexible**: Horarios, precios y disponibilidad

### 👥 Para Usuarios
- **Reserva Intuitiva**: Interfaz amigable para reservar canchas disponibles
- **Disponibilidad en Tiempo Real**: Visualización actualizada de horarios
- **Gestión Personal**: Control de reservas activas e historial completo
- **Notificaciones Automáticas**: Recordatorios y confirmaciones
- **Perfil Personalizado**: Preferencias y historial de actividades


---

## 🗃️ Diseño de la Base de Datos

### Diagrama Entidad-Relación
<img width="952" height="472" alt="Diagrama de la BD" src="https://github.com/user-attachments/assets/25a45f4d-d894-4259-9d9d-fec4cd979547" />


---

### Entidades Principales

#### 👤 **Usuarios**
```sql
- id, cédula, nombre, email, usuario, contraseña, rol, creado_en
- Roles: ADMIN, OPERATOR, USER
- Contraseña encriptada con BCrypt
```

#### 🏟️ **Canchas**
```sql
- id, nombre, deporte, ubicacion, precio_hora, capacidad, hora_apertura, hora_cierre, estado, creado_en
- Deportes: Fútbol, Tenis, Baloncesto, Vóley, etc.
- Estados: ACTIVA, INACTIVA
- Capacidad: depende del deporte.
- Horario: formato de 12 horas.
```

#### 📅 **Reservas**
```sql
- id, usuario_id, cancha_id, fecha, hora_inicio, hora_fin, estado, creado_en
- Estados: ACTIVA, FINALIZADA, CANCELADA
```

### Relaciones
- Un usuario puede tener muchas reservas
- Una cancha puede tener muchas reservas


---

## 🚀 Instalación y Configuración

### Prerrequisitos

* Java JDK 17 o superior
* MySQL Server 8.0+
* Maven 3.6+
* Git

### Pasos de Instalación

1. **Clonar el Repositorio**

   ```bash
   git clone https://github.com/JuanDavidSaavedra/ProyectoinicialEntornosDeProgramacion.git
   cd ProyectoinicialEntornosDeProgramacion
   ```

2. **Configurar Base de Datos**

   ```sql
   CREATE DATABASE reservas_deportivas;
   CREATE USER 'reservas_user'@'localhost' IDENTIFIED BY 'password';
   GRANT ALL PRIVILEGES ON reservas_deportivas.* TO 'reservas_user'@'localhost';
   ... Resto del Script SQL contenido en este Repositorio llamado "ProyectoInicial.sql"
   ```

3. **Configurar Application Properties**

   ```properties
   spring.datasource.url=jdbc:mysql://localhost:3306/reservas_deportivas
   spring.datasource.username=reservas_user
   spring.datasource.password=password
   spring.datasource.driver-class-name=com.mysql.cj.jdbc.Driver

   spring.jpa.database-platform=org.hibernate.dialect.MySQL8Dialect
   spring.jpa.hibernate.ddl-auto=update
   spring.jpa.show-sql=true
   spring.jpa.properties.hibernate.dialect=org.hibernate.dialect.MySQLDialect
   spring.jpa.hibernate.naming.physical-strategy=org.hibernate.boot.model.naming.PhysicalNamingStrategyStandardImpl

   spring.web.resources.static-locations=classpath:/static/

   logging.level.org.hibernate.orm.connections.pooling=WARN
   logging.level.org.hibernate=INFO
   logging.level.org.hibernate.SQL=DEBUG
   logging.level.org.hibernate.type.descriptor.sql.BasicBinder=TRACE

   spring.datasource.hikari.connection-timeout=20000
   spring.datasource.hikari.maximum-pool-size=10
   spring.datasource.hikari.minimum-idle=2
   spring.datasource.hikari.idle-timeout=300000
   spring.datasource.hikari.max-lifetime=1200000

   spring.jackson.time-zone=America/Bogota
   spring.jackson.locale=es_CO

   server.port=8095
   ```

4. **Ejecutar la Aplicación**

   **BackEnd: Ejecuta directamente desde tu IDE o con:**

   ```
   mvn spring-boot:run
   ```

   **FrontEnd: En otra terminal, dentro de src/main/resources/static/FrontEnd-reservas:**

   
   PS C:\Users\juanj\Documents\workspace-spring-tools-for-eclipse-4.31.0.RELEASE\ProyectoInicial\src\main\resources\static\FrontEnd-reservas>
   

   Y ejecutas el comando:

   ```
   npm start
   ```
   
   Si no tienes npm, lo puedes instalar con:

   ```
   npm install
   npm start
   ```
   
5. **Acceder al Sistema**

   # Para revisar el BackEnd (Endpoints):
   * http://localhost:8095/api/usuarios # o .../api/canchas o /api/reservas
   
   # Para el FrontEnd:
   * http://localhost:3000

   
---

## 📁 Estructura del Proyecto

```
C:...\ProyectoInicial\src\main\java\uis\edu\entorno\proyecto\inicial> (BackEnd)
C:.
|   ProyectoInicialApplication.java
|
+---config
|       CorsConfig.java
|
+---controller
|       AuthController.java
|       CanchaController.java
|       ReservaController.java
|       SpaController.java
|       UsuarioController.java
|
+---exception
|       ResourceNotFoundException.java
|
+---model
|   |   Cancha.java
|   |   Reserva.java
|   |   Usuario.java
|   |
|   \---dto
|           ApiResponse.java
|           LoginRequest.java
|           ReservaRequest.java
|           ReservaResponse.java
|
+---repository
|       CanchaRepository.java
|       ReservaRepository.java
|       UsuarioRepository.java
|
\---service
    |   ICanchaService.java
    |   IReservaService.java
    |   IUsuarioService.java
    |
    \---impl
            CanchaServiceImpl.java
            ReservaServiceImpl.java
            UsuarioServiceImpl.java
```

```
C:...\ProyectoInicial\src\main\resources\static\FrontEnd-reservas> (FrontEnd)
C:.
|-- node
  |-- public
  |-- src
  |-- .gitignore
  |-- package-lock.json
  |-- package.json
  |-- README.md
    |-- css
    |-- img
    |-- favicon.ico
    |-- index.html
    |-- logo192.png
    |-- logo512.png
    |-- manifest.json
    |-- robots.txt
      |-- styles.css
      |-- cancha.png
      |-- logo.png
      |-- reservas.png
      |-- usuarios.png
    |-- components
    |-- context
    |-- services
    |-- styles
    |-- App.css
    |-- App.js
    |-- App.test.js
    |-- index.css
    |-- index.js
    |-- logo.svg
    |-- reportWebVitals.js
    |-- setupTests.js
      |-- Auth.css
      |-- Bienvenida.css
      |-- Bienvenida.js
      |-- Canchas.css
      |-- Canchas.js
      |-- FormCanchas.css
      |-- FormCanchas.js
      |-- FormReservas.css
      |-- FormReservas.js
      |-- FormUsuarios.css
      |-- FormUsuarios.js
      |-- Login.css
      |-- Login.js
      |-- Menu.css
      |-- Menu.js
      |-- Navbar.js
      |-- Register.js
      |-- Reservas.css
      |-- Reservas.js
      |-- Usuarios.css
      |-- Usuarios.js
      |-- AuthContext.js
      |-- api.js
      |-- original.css
```


---

## 🎮 Funcionalidades por Módulo

### 🔐 Módulo de Autenticación

* Login de usuarios con validación contra la base de datos SQL.
* Acceso diferenciado por roles: **ADMIN, OPERATOR y USER**.
* Inicio de sesión con credenciales preconfiguradas para pruebas.
* Gestión segura de contraseñas mediante hash.
* Manejo de sesiones y control de acceso según permisos.

### 👥 Módulo de Gestión de Usuarios

* Creación de nuevos usuarios con datos como cédula, nombre, email, usuario, contraseña y rol.
* Consulta de usuarios por ID, cédula, nombre, email o nombre de usuario.
* Actualización de la información de un usuario.
* Eliminación de usuarios con validaciones de seguridad.

### 🏟️ Módulo de Gestión de Canchas

* Creación de nuevas canchas con atributos como nombre, deporte, ubicación y precio por hora.
* Consulta de canchas por diferentes criterios, incluyendo ID, nombre, ubicación, precio/hora, capacidad y horarios.
* Edición o actualización de la información de una cancha.
* Desactivación de canchas por mantenimiento.

### 📅 Módulo de Reservas

* Creación de reservas seleccionando la fecha y el rango de horas.
* Consulta de reservas por ID, usuario, cancha, fecha y horario.
* Prevención de reservas solapadas mediante validaciones automáticas.
* Consulta de reservas activas.
* Cancelación de reservas existentes.

---

### ⚙️ Requerimientos No Funcionales

* Escalabilidad para soportar aumento de usuarios y reservas.
* Interfaz intuitiva, con formularios simples y validaciones de usabilidad.
* Código mantenible, documentado y versionado en GitHub.
* Tiempo de respuesta menor a 2 segundos en operaciones CRUD.


---

## 🤝 Metodología de Desarrollo

### 🎯 Enfoque SCRUM

* **Sprints** quincenales
* **Daily Stand-ups** virtuales
* **Review y Retrospectiva** al final de cada sprint
* **Azure Boards** para seguimiento de tareas

### ✅ Criterios de Aceptación

* Código limpio y documentado
* Pruebas unitarias implementadas
* Interfaz responsive y accesible
* Seguridad aplicada en todos los niveles

---

## 📞 Soporte y Contacto

¿Encuentras un error o tienes sugerencias?

* 🐛 **Issues**: [Reportar un problema](https://github.com/JuanDavidSaavedra/ProyectoinicialEntornosDeProgramacion/issues)
* 💬 **Discusiones**: [Foro del proyecto](https://github.com/JuanDavidSaavedra/ProyectoinicialEntornosDeProgramacion/discussions)

---

**⭐ ¿Te gusta este proyecto? ¡Dale una estrella al repositorio!**

---

*Última actualización: Noviembre 2025*
