# 🌾 Farm House Booking & Management System - Complete Setup Guide

## Project Overview

A full-stack web application for booking and managing farm houses with online payments, built with **React (Frontend)** and **Spring Boot (Backend)**.

---

## 🏗️ Project Structure

```
demo/
├── src/main/java/com/example/demo/
│   ├── entity/
│   │   ├── User.java
│   │   ├── FarmHouse.java
│   │   ├── Booking.java
│   │   └── Payment.java
│   ├── repository/
│   │   ├── UserRepository.java
│   │   ├── FarmHouseRepository.java
│   │   ├── BookingRepository.java
│   │   └── PaymentRepository.java
│   ├── service/
│   │   ├── AuthenticationService.java
│   │   ├── UserService.java
│   │   ├── FarmHouseService.java
│   │   ├── BookingService.java
│   │   └── PaymentService.java
│   ├── controller/
│   │   ├── AuthenticationController.java
│   │   ├── UserController.java
│   │   ├── FarmHouseController.java
│   │   ├── BookingController.java
│   │   └── PaymentController.java
│   ├── dto/
│   │   ├── UserDTO.java
│   │   ├── UserRegistrationDTO.java
│   │   ├── FarmHouseDTO.java
│   │   ├── BookingDTO.java
│   │   ├── PaymentDTO.java
│   │   └── PaymentResponseDTO.java
│   └── DemoApplication.java
├── my-react-app/
│   ├── src/
│   │   ├── api/
│   │   │   └── axiosInstance.js
│   │   ├── pages/
│   │   │   ├── Login.jsx
│   │   │   ├── Register.jsx
│   │   │   ├── Home.jsx
│   │   │   ├── FarmHouseList.jsx
│   │   │   ├── FarmHouseDetail.jsx
│   │   │   ├── BookingPage.jsx
│   │   │   ├── UserBookings.jsx
│   │   │   ├── AdminDashboard.jsx
│   │   │   ├── OwnerDashboard.jsx
│   │   │   └── NotFound.jsx
│   │   ├── components/
│   │   │   └── Navbar.jsx
│   │   ├── App.jsx
│   │   ├── App.css
│   │   └── main.jsx
│   └── package.json
├── pom.xml
└── README.md
```

---

## 🚀 Setup Instructions

### Backend Setup

#### Prerequisites:
- Java 17+
- Maven 3.8+
- MySQL 5.7+

#### Steps:

1. **Update Database Configuration**
   ```properties
   # src/main/resources/application.properties
   spring.datasource.url=jdbc:mysql://localhost:3306/program
   spring.datasource.username=root
   spring.datasource.password=Prachi@015
   ```

2. **Create Database**
   ```sql
   CREATE DATABASE IF NOT EXISTS program;
   ```

3. **Build Project**
   ```bash
   cd demo
   mvn clean install
   ```

4. **Run Backend**
   ```bash
   mvn spring-boot:run
   ```
   Backend runs on: **http://localhost:8080**

---

### Frontend Setup

#### Prerequisites:
- Node.js 16+
- npm or yarn

#### Steps:

1. **Install Dependencies**
   ```bash
   cd my-react-app
   npm install
   ```

2. **Start Development Server**
   ```bash
   npm run dev
   ```
   Frontend runs on: **http://localhost:5173** (default Vite port)

3. **Build for Production**
   ```bash
   npm run build
   ```

---

## 📋 Database Schema

### User Table
```sql
CREATE TABLE users (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(100) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  phone VARCHAR(20) NOT NULL,
  role ENUM('ADMIN', 'OWNER', 'CUSTOMER') NOT NULL,
  is_blocked BOOLEAN DEFAULT false,
  is_verified BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
```

### FarmHouse Table
```sql
CREATE TABLE farmhouses (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(200) NOT NULL,
  location VARCHAR(200) NOT NULL,
  description LONGTEXT,
  price_per_day DECIMAL(10, 2) NOT NULL,
  owner_id BIGINT NOT NULL,
  available BOOLEAN DEFAULT true,
  is_approved BOOLEAN DEFAULT false,
  max_guests INT,
  bedrooms INT,
  bathrooms INT,
  amenities LONGTEXT,
  image_url VARCHAR(500),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (owner_id) REFERENCES users(id)
);
```

### Booking Table
```sql
CREATE TABLE bookings (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  user_id BIGINT NOT NULL,
  farmhouse_id BIGINT NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  total_price DECIMAL(10, 2) NOT NULL,
  number_of_guests INT,
  special_requirements TEXT,
  status ENUM('PENDING', 'CONFIRMED', 'CANCELLED', 'COMPLETED') DEFAULT 'PENDING',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id),
  FOREIGN KEY (farmhouse_id) REFERENCES farmhouses(id)
);
```

### Payment Table
```sql
CREATE TABLE payments (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  booking_id BIGINT NOT NULL,
  amount DECIMAL(10, 2) NOT NULL,
  payment_status ENUM('PENDING', 'SUCCESS', 'FAILED', 'REFUNDED') DEFAULT 'PENDING',
  transaction_id VARCHAR(100),
  payment_method VARCHAR(50),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (booking_id) REFERENCES bookings(id)
);
```

---

## 📡 API Endpoints

### Authentication

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Register new user |
| POST | `/api/auth/login` | User login |
| POST | `/api/auth/verify/{userId}` | Verify email |

**Register Request:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123",
  "phone": "9876543210",
  "role": "CUSTOMER"
}
```

**Login Request:**
```json
{
  "email": "john@example.com",
  "password": "password123"
}
```

### Users

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/users` | Get all users (Admin) |
| GET | `/api/users/{id}` | Get user by ID |
| GET | `/api/users/email/{email}` | Get user by email |
| GET | `/api/users/role/{role}` | Get users by role |
| PUT | `/api/users/{id}` | Update user |
| DELETE | `/api/users/{id}` | Delete user |
| GET | `/api/users/count/total` | Get total users count |

### Farm Houses

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/farmhouses` | Add farmhouse (headers: owner-id) |
| GET | `/api/farmhouses` | Get all approved farmhouses (paginated) |
| GET | `/api/farmhouses/{id}` | Get farmhouse by ID |
| GET | `/api/farmhouses/owner/{ownerId}` | Get owner's farmhouses |
| GET | `/api/farmhouses/search/location?query=Delhi` | Search by location |
| GET | `/api/farmhouses/search/price?minPrice=1000&maxPrice=5000` | Search by price |
| PUT | `/api/farmhouses/{id}` | Update farmhouse |
| PUT | `/api/farmhouses/{id}/approve` | Approve farmhouse (Admin) |
| DELETE | `/api/farmhouses/{id}` | Delete farmhouse |

**Add FarmHouse Request:**
```json
{
  "name": "Sunny Farm House",
  "location": "Delhi",
  "description": "Beautiful farmhouse with pool and garden",
  "pricePerDay": 5000,
  "maxGuests": 10,
  "bedrooms": 3,
  "bathrooms": 2,
  "amenities": "[\"WiFi\", \"Pool\", \"Garden\", \"Party Hall\"]",
  "imageUrl": "https://example.com/image.jpg"
}
```

### Bookings

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/bookings` | Create booking (headers: user-id) |
| GET | `/api/bookings/{id}` | Get booking by ID |
| GET | `/api/bookings` | Get all bookings (Admin) |
| GET | `/api/bookings/user/{userId}` | Get user's bookings |
| GET | `/api/bookings/farmhouse/{farmHouseId}` | Get farmhouse bookings |
| PUT | `/api/bookings/{id}/confirm` | Confirm booking |
| PUT | `/api/bookings/{id}/cancel` | Cancel booking |
| GET | `/api/bookings/check/availability?farmHouseId=1&startDate=2024-05-01&endDate=2024-05-05` | Check availability |
| DELETE | `/api/bookings/{id}` | Delete booking |

**Create Booking Request:**
```json
{
  "farmHouseId": 1,
  "startDate": "2024-05-01",
  "endDate": "2024-05-05",
  "timeSlot": "DAY",
  "numberOfGuests": 4,
  "specialRequirements": "Need extra bed"
}
```
For a one-day booking, use the same date for `startDate` and `endDate`, then select `DAY`, `NIGHT`, or `FULL_DAY`. The same date can have one day booking and one night booking, while a full-day booking occupies both. `AM` and `PM` remain accepted as legacy aliases for `DAY` and `NIGHT`.

### Payments

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/payments` | Create payment |
| POST | `/api/payments/{id}/process` | Process payment |
| GET | `/api/payments/{id}` | Get payment by ID |
| GET | `/api/payments/booking/{bookingId}` | Get payment by booking |
| GET | `/api/payments` | Get all payments |
| GET | `/api/payments/status/{status}` | Get payments by status |
| POST | `/api/payments/{id}/refund` | Refund payment |

**Create Payment Request:**
```json
{
  "bookingId": 1,
  "paymentMethod": "CARD"
}
```

---

## 👥 User Roles

### 1. **Admin**
   - View all users
   - Approve/Reject farmhouses
   - View all bookings
   - View all payments

### 2. **Owner**
   - Add farm houses
   - Update farm house details
   - View bookings for their farmhouses
   - Track revenue

### 3. **Customer**
   - Browse farm houses
   - Search by location/price
  - Make day-only, night-only, or full-day bookings
   - Make payments
   - View their bookings

---

## 🔐 Security Features

1. **Password Encryption** - BCrypt password hashing
2. **JWT Tokens** - Token-based authentication (ready to integrate)
3. **CORS Enabled** - Cross-origin requests allowed
4. **Role-Based Access** - Role-based authorization
5. **Date Conflict Prevention** - Prevents double bookings

---

## 🎯 Key Features Implemented

✅ **User Authentication** - Registration, login, verification
✅ **FarmHouse Management** - Add, update, delete, approve
✅ **Booking System** - Date conflict prevention, booking management
✅ **Payment Integration** - Payment creation, processing, refunds
✅ **Search & Filter** - Search by location, price range
✅ **Admin Dashboard** - Approve farmhouses, manage users
✅ **Owner Dashboard** - Manage farmhouses and bookings
✅ **Customer Dashboard** - View and manage bookings
✅ **Pagination** - Efficient data loading
✅ **Error Handling** - Comprehensive error messages

---

## 💾 Testing Quick Start

### Register as Customer:
```bash
curl -X POST http://localhost:8080/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"John","email":"john@test.com","password":"pass123","phone":"9876543210","role":"CUSTOMER"}'
```

### Login:
```bash
curl -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"john@test.com","password":"pass123"}'
```

### Get All Farmhouses:
```bash
curl http://localhost:8080/api/farmhouses?page=0&size=10
```

---

## 📦 Technologies Used

### Backend
- **Spring Boot 3.2.5** - Framework
- **Spring Security** - Authentication
- **Spring Data JPA** - ORM
- **MySQL** - Database
- **Lombok** - Reduce boilerplate
- **JWT** - Token generation

### Frontend
- **React 19.2** - UI Library
- **React Router 7** - Routing
- **Axios** - HTTP Client
- **Vite** - Build tool
- **CSS3** - Styling

---

## 🚀 Deployment Ready

### Environment Configuration
Set these in `application.properties` before deployment:
```properties
spring.jpa.hibernate.ddl-auto=validate
spring.jpa.show-sql=false
server.port=8080
```

### Build Production JAR:
```bash
mvn clean package
java -jar target/demo-0.0.1-SNAPSHOT.jar
```

### Build Production React:
```bash
npm run build
# Contents in dist/ folder ready for deployment
```

---

## 🐛 Troubleshooting

### Database Connection Error
- Ensure MySQL is running
- Check credentials in `application.properties`
- Verify database exists

### Port Already in Use
- Backend (8080): `lsof -i :8080` then `kill -9 <PID>`
- Frontend (5173): `lsof -i :5173` then `kill -9 <PID>`

### CORS Issues
- CORS is enabled in all controllers with `@CrossOrigin(origins = "*")`
- Adjust as needed for security

---

## 📞 Support & Notes

- All timestamps are in UTC
- Files are production-ready
- Add Spring Security Config for JWT in production
- Integrate real payment gateway (Razorpay/Stripe)
- Add email notifications
- Add image upload service (Cloudinary)

frontend project run cmd
   npm run dev

backend project run cmd
.\mvnw.cmd spring-boot:run

---

## Google Sign-in Configuration

Create a Google OAuth **Web application** client and add `http://localhost:5173` as an authorized JavaScript origin. Use the same client ID for the frontend and backend; do not add a Google client secret to the React app.

Copy `frontend/.env.example` to `frontend/.env` and set `VITE_GOOGLE_CLIENT_ID` to the client ID. In PowerShell, set `GOOGLE_CLIENT_ID` in the terminal used to start the backend:

```powershell
$env:GOOGLE_CLIENT_ID = "your-client-id.apps.googleusercontent.com"
.\mvnw.cmd spring-boot:run
```

Start Vite after setting the frontend value so it loads the environment variable. Google sign-in verifies the ID token on the backend and creates new Google accounts as verified customers.

---

**Project completed! 🎉**
