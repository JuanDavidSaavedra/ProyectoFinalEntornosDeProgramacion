# 🏟️ Sistema de Reservas Deportivas - Plataforma Integral

[![Spring Boot](https://img.shields.io/badge/Spring%20Boot-2.7.0-brightgreen.svg)](https://spring.io/projects/spring-boot)
[![MySQL](https://img.shields.io/badge/MySQL-8.0-blue.svg)](https://www.mysql.com/)
[![License](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

## Gestión del Proyecto aplicando la metodología SCRUM en Azure:

### ¡Para ver las historias de usuario que hemos realizado en los diferentes Sprints de este Proyecto ve al enlace de abajo!
- Sigue esta ruta: Menú de la izquierda en la opción "Boards" y luego en "Sprints"

https://dev.azure.com/reservadechanchas/


  

## 📖 Descripción del Proyecto

**Sistema de Reservas Deportivas** es una plataforma web completa diseñada para optimizar la gestión de instalaciones deportivas. Desarrollado como proyecto académico para la asignatura de Entornos de Programación, ofrece una solución integral que conecta administradores y usuarios en un ecosistema deportivo eficiente.

https://github.com/user-attachments/assets/31388d50-1ed3-4819-9732-073b00bfed24


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

## 🛠️ Stack Tecnológico

### **Backend**
- **Spring Boot 3.x** - Framework principal de Java
- **Spring Data JPA** - Persistencia de datos
- **Maven** - Gestión de dependencias

### **Frontend**
- **HTML5** - Estructura semántica
- **CSS3** - Estilos y diseño responsive
- **JavaScript** - Interactividad del cliente
- **Bootstrap 5** - Framework CSS
- **Materialize CSS** - Componentes UI

### **Base de Datos**
- **MySQL 8.0** - Sistema gestor de base de datos
- **JPA/Hibernate** - ORM para mapeo objeto-relacional

### **Herramientas de Desarrollo**
- **Git & GitHub** - Control de versiones
- **Azure DevOps** - Gestión ágil (SCRUM)
- **Eclipse/STS** - Entorno de desarrollo

---

## 🗃️ Diseño de la Base de Datos

### Diagrama Entidad-Relación
<img width="952" height="472" alt="Diagrama de la BD" src="https://github.com/user-attachments/assets/25a45f4d-d894-4259-9d9d-fec4cd979547" />


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
- Capacidad máxima: 30-50 personas
- Horario: 05:00 - 22:00
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
   ```

3. **Configurar Application Properties**

   ```properties
   spring.datasource.url=jdbc:mysql://localhost:3306/reservas_deportivas
   spring.datasource.username=reservas_user
   spring.datasource.password=password
   ```

4. **Ejecutar la Aplicación**

   ```bash
   mvn spring-boot:run
   ```

5. **Acceder al Sistema**

   ```
   http://localhost:8080
   ```

### 🔐 Credenciales de Prueba

* **Administrador**: usuario: `admin` | contraseña: `123`
* **Usuario Normal**: usuario: `mariagonz` | contraseña: `password123`

---

## 📁 Estructura del Proyecto

```
C:.ProyectoInicial
├───.idea
│   └───dataSources
│       └───1bfd48c9-f09b-4830-8320-ca3b776d8645
│           └───storage_v2
│               └───_src_
│                   └───schema
├───.mvn
│   └───wrapper
├───.settings
├───src
│   ├───main
│   │   ├───java
│   │   │   └───uis
│   │   │       └───edu
│   │   │           └───entorno
│   │   │               └───proyecto
│   │   │                   └───inicial
│   │   │                       ├───config
│   │   │                       ├───controller
│   │   │                       ├───exception
│   │   │                       ├───model
│   │   │                       │   └───dto
│   │   │                       ├───repository
│   │   │                       └───service
│   │   │                           └───impl
│   │   └───resources
│   │       ├───static
│   │       │   ├───css
│   │       │   ├───img
│   │       │   └───js
│   │       └───templates
│   └───test
│       └───java
│           └───uis
│               └───edu
│                   └───entorno
│                       └───proyecto
│                           └───inicial
└───target
    ├───classes
    │   ├───META-INF
    │   │   └───maven
    │   │       └───uis.edu.entorno.proyecto.inicial
    │   │           └───ProyectoInicial
    │   ├───static
    │   │   ├───css
    │   │   ├───img
    │   │   └───js
    │   └───uis
    │       └───edu
    │           └───entorno
    │               └───proyecto
    │                   └───inicial
    │                       ├───config
    │                       ├───controller
    │                       ├───exception
    │                       ├───model
    │                       │   └───dto
    │                       ├───repository
    │                       └───service
    │                           └───impl
    ├───generated-sources
    │   └───annotations
    ├───generated-test-sources
    │   └───test-annotations
    └───test-classes
        └───uis
            └───edu
                └───entorno
                    └───proyecto
                        └───inicial
```

---

## 🎮 Funcionalidades por Módulo

### 🔐 Módulo de Autenticación

* Registro de nuevos usuarios
* Login seguro con roles
* Recuperación de contraseña
* Gestión de sesiones

### 🏟️ Módulo de Canchas

* Catálogo de canchas disponibles
* Filtros por deporte y ubicación
* Gestión de precios y horarios
* Estados de disponibilidad

### 📅 Módulo de Reservas

* Sistema de reservas en tiempo real
* Calendario interactivo
* Confirmaciones automáticas
* Historial y cancelaciones

### 📊 Módulo de Reportes

* Métricas de uso por cancha
* Estadísticas de reservas
* Reportes financieros
* Análisis de tendencias

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

## 🛣️ Roadmap Futuro

### 🚀 Próximas Características

* [ ] App móvil nativa
* [ ] Sistema de pagos en línea
* [ ] Integración con redes sociales
* [ ] Notificaciones push
* [ ] API REST pública
* [ ] Sistema de torneos y ligas

---

## 👥 Equipo de Desarrollo

**Asignatura**: Entornos de Programación - Grupo E1 


**Integrantes**: 

* Juan David Saavedra González - 2214111

* Yosert Alejandro Higuera Lizarazo - 2205003


**Periodo**: 2025-2


**Universidad Industrial de Santander**

---

## 📞 Soporte y Contacto

¿Encuentras un error o tienes sugerencias?

* 🐛 **Issues**: [Reportar un problema](https://github.com/JuanDavidSaavedra/ProyectoinicialEntornosDeProgramacion/issues)
* 💬 **Discusiones**: [Foro del proyecto](https://github.com/JuanDavidSaavedra/ProyectoinicialEntornosDeProgramacion/discussions)

---

**⭐ ¿Te gusta este proyecto? ¡Dale una estrella al repositorio!**

---

*Última actualización: Octubre 2025*
