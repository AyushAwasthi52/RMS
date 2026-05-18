# RMS - Restaurant Management System

RMS (Restaurant Management System) is a full-stack restaurant management platform built to handle and streamline restaurant operations through a role-based workflow system.

The platform provides separate access levels and dashboards for customers, waiters, chefs, and managers while integrating core restaurant functionalities such as inventory management, menu management, table booking, payment handling, and order processing.

This project was built to simulate a real-world production-style restaurant management ecosystem with scalable backend architecture and role-based access control.

---

## Features

### Role-Based Access Control

The system supports multiple user roles with separate workflows and permissions:

#### Customer
- Browse menu
- Book tables
- Place orders
- Make payments
- Track order status

#### Waiter
- Manage customer orders
- Update table status
- Coordinate with kitchen
- Handle active dining sessions

#### Chef
- View incoming orders
- Update food preparation status
- Manage kitchen workflow

#### Manager
- Inventory management
- Menu management
- Staff management
- Restaurant analytics
- Order monitoring
- Table management

---

## Core Functionalities

- Full authentication and authorization system
- Role-based dashboards
- Inventory management
- Menu management
- Table booking system
- Order tracking workflow
- Payment system integration
- Dynamic restaurant operations management
- Real-time order status workflow
- Responsive frontend UI

---

## Tech Stack

### Frontend
- React
- JavaScript
- HTML
- CSS

### Backend
- Node.js
- Express.js

### Database
- MongoDB
- Mongoose

### Authentication & Security
- JWT Authentication
- Role-based authorization

### Payment Integration
- Online payment workflow support

---

## Purpose of the Project

This project was built to explore:
- Full-stack application architecture
- Role-based systems
- Real-world workflow management
- Dashboard-based applications
- Authentication and authorization
- Inventory and order management systems
- Complex backend logic handling

---

## System Workflow

```text
Customer Places Order
            ↓
Waiter Confirms Order
            ↓
Chef Receives Order
            ↓
Food Preparation Updates
            ↓
Order Served
            ↓
Payment Processed
```

---

## Inventory Management

The platform includes:
- Ingredient tracking
- Inventory updates
- Stock management
- Low inventory handling
- Menu-item dependency management

---

## Menu Management

Managers can:
- Add menu items
- Edit menu details
- Update pricing
- Manage item availability
- Organize categories

---

## Table Booking System

Customers can:
- Reserve tables
- View table availability
- Manage bookings
- Schedule reservations

---

## Authentication System

The application implements:
- JWT-based authentication
- Secure login/signup
- Protected routes
- Role-based access control
- Session management

---

## Installation

Clone the repository:

```bash
git clone https://github.com/your-username/RMS.git
```

Move into the project directory:

```bash
cd RMS
```

Install dependencies:

```bash
npm install
```

Create a `.env` file:

```env
PORT=3000
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_secret_key
PAYMENT_API_KEY=your_payment_key
```

Run the development server:

```bash
npm run dev
```

---

## Project Structure

```text
RMS/
│
├── frontend/
├── backend/
├── routes/
├── controllers/
├── middleware/
├── models/
├── services/
├── utils/
└── package.json
```

---

## Learning Outcomes

This project helped me understand:
- Full-stack application development
- Role-based authorization systems
- Complex workflow architecture
- Inventory management systems
- Dashboard-based UI design
- Authentication systems
- Payment workflows
- Scalable backend structuring
- Real-world business logic implementation

---

## Future Improvements

- Real-time kitchen dashboard
- AI-based inventory prediction
- Advanced analytics
- QR-based ordering
- Multi-restaurant support
- Push notifications
- Real-time WebSocket updates
- Cloud deployment architecture

---

## License

This project is open-source and available under the MIT License.
