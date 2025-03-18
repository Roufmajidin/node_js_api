test

### 🔑 **Autentikasi**
#### **1. Login**
- **URL:** `/api/auth/login`
- **Method:** `POST`
- **Body:**
  ```json
  {
    "email": "user@example.com",
    "password": "password123"
  }
reponse : 
  ```json
{
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiJhMzY3NmZiMi0wMjA2LTRmZWMtOWNjNC0wYzQzMGQxODQ2N2QiLCJpYXQiOjE3NDIzMDg5MzIsImV4cCI6MTc0MjMxMjUzMn0.G7IJ4TWONS2WPmiiJl1piWFCGLDM9Fp3HKwlSt7GqZQ",
    "user": {
        "id": "a3676fb2-0206-4fec-9cc4-0c430d18467d",
        "name": "Rouf Majid",
        "email": "rouf@gmail.com",
        "password": "$2a$10$WRXjkh4S64k5JKMCn1ccw.H4I0t8PZ0jRXDiaIW0fuqhQaFxm64yK",
        "image": null,
        "is_admin": 0,
        "is_verified": 0,
        "last_login": "2025-03-18T14:42:12.422Z",
        "created_at": "2025-02-26T09:59:28.890Z",
        "updated_at": "2025-02-26T09:59:28.890Z"
    }
}
