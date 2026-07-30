# CloudShare

CloudShare is a full-stack cloud storage platform that enables users to securely upload, organize, search, and share files and folders. It uses JWT-based authentication, role-based access control, PostgreSQL for metadata storage, Redis for caching, and Cloudinary for scalable cloud file storage.

---

## Features

* JWT Authentication and Authorization
* Role-Based Access Control
* File upload, download, and deletion
* Folder creation, renaming, and deletion
* Nested folder support
* File and folder sharing
* Search files and folders
* Cloudinary integration for file storage
* Redis caching for improved performance
* RESTful APIs with Swagger documentation

---

## Tech Stack

### Backend

* Java
* Spring Boot
* Spring Security
* Spring Data JPA
* JWT
* PostgreSQL
* Redis
* Cloudinary
* Maven

### Documentation

* Swagger / OpenAPI

---

## Project Structure

```text
src
├── controller
├── service
├── repository
├── entity
├── dto
├── security
├── config
├── exception
└── util
```

---

## Authentication

The application uses JWT to secure protected APIs.

### Public APIs

* Register User
* Login User

### Protected APIs

* File Management
* Folder Management
* Search
* Sharing
* User Profile

---

## Cloudinary Integration

Files are uploaded to Cloudinary while file metadata such as file name, size, type, owner, and Cloudinary public ID is stored in PostgreSQL. This approach reduces server storage requirements and provides scalable cloud-based file management.

---

## File Management

* Upload files
* Download files
* Delete files
* Search files
* View file details

---

## Folder Management

* Create folders
* Rename folders
* Delete folders
* Organize files using nested folders

---

## Sharing

* Share files with other users
* Share folders
* Role-based access permissions

---

## Redis Caching

Redis is used to cache frequently accessed data, reducing database load and improving response time.

---

## Database

PostgreSQL stores:

* User information
* Folder hierarchy
* File metadata
* Sharing permissions

Actual files are stored securely in Cloudinary.

---

## API Documentation

Interactive API documentation is available through Swagger after running the application.

---

## Running the Application

### Build

```bash
mvn clean install
```

### Run

```bash
mvn spring-boot:run
```

---

## Future Enhancements

* File versioning
* Trash and restore functionality
* File previews
* Activity logs
* Email notifications
* Storage quota management
* Team workspaces

---

## License

This project is intended for educational and learning purposes.
