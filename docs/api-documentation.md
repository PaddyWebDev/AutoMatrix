# API Documentation for Auto Matrix Frontend

This document provides detailed documentation for all API endpoints in the Next.js application.

## Admin APIs

### 6.1 Get Appointments

**URL:** /api/admin/appointments

**Method:** GET

**Description:** Fetch a list of appointments with pagination and search functionality.

**Access:** Admin

**Headers:** None

**Request Parameters:**
- Query:
  - page (number, optional, default 1): Page number
  - limit (number, optional, default 10): Number of items per page
  - search (string, optional): Search term for serviceType, vehicleName, vehicleMake, owner name, email, serviceCenter name

**BODY:** None

**Success Response:**
- Status: 200
- Body:
```json
{
  "appointment_data": [
    {
      "id": "string",
      "serviceType": "string",
      "status": "string",
      "requestedDate": "date",
      "Vehicle": { ... },
      "owner": { ... },
      "serviceCenter": { ... },
      "JobCards": [ ... ],
      "Invoice": { ... }
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 100,
    "totalPages": 10
  }
}
```

**Error codes and response:**
- 500: { "error": "Failed to fetch appointments" }

### 6.2 Get Appointment by ID

**URL:** /api/admin/appointments/[id]

**Method:** GET

**Description:** Fetch details of a specific appointment by ID.

**Access:** Admin

**Headers:** None

**Request Parameters:**
- Path:
  - id (string, required): Appointment ID

**BODY:** None

**Success Response:**
- Status: 200
- Body: Appointment object with Vehicle, owner, serviceCenter, JobCards, Invoice

**Error codes and response:**
- 400: "AppointmentId is required"
- 404: { "error": "Appointment not found" }
- 500: { "error": "Failed to fetch appointment" }

### 6.3 Get Stats

**URL:** /api/admin/stats

**Method:** GET

**Description:** Get statistics for users, service centers, appointments, invoices.

**Access:** Admin

**Headers:** None

**Request Parameters:** None

**BODY:** None

**Success Response:**
- Status: 200
- Body:
```json
{
  "stats": [userCount, serviceCenterCount, appointmentCount, invoiceCount],
  "message": "Success"
}
```

**Error codes and response:**
- 500: "Internal Server Error"

### 6.4 Get Service Centers

**URL:** /api/admin/service-centers

**Method:** GET

**Description:** Fetch list of service centers.

**Access:** Admin

**Headers:** None

**Request Parameters:** None

**BODY:** None

**Success Response:**
- Status: 200
- Body:
```json
{
  "message": "Success",
  "service_center_data": [
    {
      "name": "string",
      "city": "string",
      "id": "string"
    }
  ]
}
```

**Error codes and response:**
- 500: "Internal Server Error"

### 6.5 Get Reports for Service Centers

**URL:** /api/admin/reports/service-centers

**Method:** GET

**Description:** Fetch reports for service centers with optional date and service center filters.

**Access:** Admin

**Headers:** None

**Request Parameters:**
- Query:
  - startDate (string, optional): Start date for filtering (YYYY-MM-DD)
  - endDate (string, optional): End date for filtering (YYYY-MM-DD)
  - serviceCenterId (string, optional): Specific service center ID

**BODY:** None

**Success Response:**
- Status: 200
- Body:
```json
{
  "reports": [
    {
      "serviceCenterId": "string",
      "serviceCenterName": "string",
      "complaintVolume": { "serviceType": count },
      "avgResolutionTime": 0,
      "slaBreaches": 0,
      "agentKPIs": { "totalAppointments": 0, "completionRate": 0 },
      "recurringIssues": [["issue", count]],
      "hotspot": { "city": "string", "appointmentVolume": 0, "latitude": 0, "longitude": 0 }
    }
  ]
}
```

**Error codes and response:**
- 500: { "error": "Internal Server Error" }

### 6.6 Get Triage Appointments

**URL:** /api/admin/triage

**Method:** GET

**Description:** Fetch triage appointments for admin review.

**Access:** Admin

**Headers:** None

**Request Parameters:** None

**BODY:** None

**Success Response:**
- Status: 200
- Body:
```json
{
  "appointments": [
    {
      "id": "string",
      "vehicleName": "string",
      "serviceType": "string",
      "priority": "LOW|MEDIUM|HIGH",
      "status": "string",
      "requestedDate": "string",
      "slaDeadline": "string",
      "slaBreached": false,
      "escalated": false,
      "assignedServiceCenterId": "string",
      "assignedServiceCenterName": "string",
      "customerName": "string",
      "customerEmail": "string"
    }
  ]
}
```

**Error codes and response:**
- 500: { "error": "Failed to fetch triage appointments" }

## Customer APIs

### 6.7 Get Customer Appointments

**URL:** /api/customer/appointments

**Method:** GET

**Description:** Fetch appointments for a customer, with optional filters.

**Access:** Customer

**Headers:** None

**Request Parameters:**
- Query:
  - userId (string, required): Owner ID
  - page (number, optional, default 1): Page number
  - status (string, optional): Filter by status
  - serviceType (string, optional): Filter by service type

**BODY:** None

**Success Response:**
- Status: 200
- Body:
```json
{
  "success": true,
  "appointments": [
    {
      "id": "string",
      "serviceType": "string",
      "status": "string",
      "requestedDate": "date",
      "Vehicle": { "vehicleName": "string", "vehicleMake": "string", "vehicleModel": "string" },
      "serviceCenter": { "name": "string", "phoneNumber": "string" }
    }
  ],
  "totalCount": 10,
  "page": 1,
  "limit": 20,
  "totalPages": 1
}
```

**Error codes and response:**
- 400: "Service Center Id is required"
- 500: "Internal Server Error"

### 6.8 Get Customer Appointments Dashboard

**URL:** /api/customer/appointments/dashboard

**Method:** GET

**Description:** Fetch dashboard data for customer appointments.

**Access:** Customer

**Headers:** None

**Request Parameters:**
- Query:
  - userId (string, required): Owner ID

**BODY:** None

**Success Response:**
- Status: 200
- Body:
```json
{
  "message": "Success",
  "appointment_data": [
    {
      "id": "string",
      "status": "string",
      "requestedDate": "date",
      "serviceType": "string",
      "serviceCenter": { "city": "string", "name": "string", "phoneNumber": "string", "email": "string" }
    }
  ]
}
```

**Error codes and response:**
- 400: "Owner id is required"
- 404: "User Not Found"
- 500: "Internal Server Error"

### 6.9 Get Customer Appointment Details

**URL:** /api/customer/appointments/get

**Method:** GET

**Description:** Get detailed information for a specific customer appointment.

**Access:** Customer

**Headers:** None

**Request Parameters:**
- Query:
  - appointmentId (string, required): Appointment ID

**BODY:** None

**Success Response:**
- Status: 200
- Body:
```json
{
  "appointment_data": {
    "id": "string",
    "requestedDate": "date",
    "slaDeadline": "date",
    "actualCompletionDate": "date",
    "slaBreached": false,
    "status": "string",
    "serviceType": "string",
    "Vehicle": { ... },
    "serviceCenter": { ... },
    "JobCards": [ ... ],
    "Invoice": { ... },
    "onTimeDelivered": true
  },
  "message": "Success"
}
```

**Error codes and response:**
- 400: "AppointmentId is required"
- 404: "Appointment not found"
- 500: "Internal Server Error"

### 6.10 Get Customer Invoices

**URL:** /api/customer/invoices

**Method:** GET

**Description:** Fetch customer invoices.

**Access:** Customer

**Headers:** None

**Request Parameters:**
- Query:
  - userId (string, required): User ID

**BODY:** None

**Success Response:**
- Status: 200
- Body:
```json
{
  "invoice_data": [
    {
      "id": "string",
      "invoiceNumber": "string",
      "totalAmount": 0,
      "billingDate": "date",
      "dueDate": "date",
      "status": "string",
      "appointmentId": "string",
      "appointment": { ... }
    }
  ],
  "message": "Success"
}
```

**Error codes and response:**
- 400: "UserId is required"
- 500: "Internal Server Error"

### 6.11 Get Customer Notifications

**URL:** /api/customer/notifications

**Method:** GET

**Description:** Fetch customer notifications.

**Access:** Customer

**Headers:** None

**Request Parameters:**
- Query:
  - userId (string, required): User ID

**BODY:** None

**Success Response:**
- Status: 200
- Body:
```json
{
  "message": "Success",
  "notification_data": [
    {
      "id": "string",
      "message": "string",
      "createdAt": "date"
    }
  ]
}
```

**Error codes and response:**
- 400: { "error": "User ID required" }
- 500: { "error": "Internal Server Error" }

### 6.12 Get Customer Vehicles

**URL:** /api/customer/vehicles

**Method:** GET

**Description:** Fetch customer vehicles.

**Access:** Customer

**Headers:** None

**Request Parameters:**
- Query:
  - userId (string, required): User ID

**BODY:** None

**Success Response:**
- Status: 200
- Body:
```json
{
  "message": "Success",
  "vehicle_data": [
    {
      "id": "string",
      "vehicleName": "string",
      "vehicleMake": "string",
      "vehicleModel": "string"
    }
  ]
}
```

**Error codes and response:**
- 400: "UserId is required"
- 500: "Internal Server Error"

## Auth APIs

### 6.13 Login

**URL:** /api/login

**Method:** POST

**Description:** Login user.

**Access:** Public

**Headers:** None

**Request Parameters:** None

**BODY:**
```json
{
  "role": "string",
  "email": "string",
  "password": "string"
}
```

**Success Response:**
- Status: 200
- Body: "Login Success"

**Error codes and response:**
- 400: "Missing fields"
- 401: "Invalid password"
- 404: "User doesn't exist on the system"
- 500: "Internal Server Error"

### 6.14 Register

**URL:** /api/register

**Method:** POST

**Description:** Register a new user (customer or service center).

**Access:** Public

**Headers:** None

**Request Parameters:** None

**BODY:**
```json
{
  "name": "string",
  "email": "string",
  "password": "string",
  "phoneNumber": "string",
  "role": "number",
  "city": "string",
  "latitude": "number",
  "longitude": "number"
}
```

**Success Response:**
- Status: 201
- Body: "User created successfully"

**Error codes and response:**
- 400: "Missing fields"
- 409: "User Already Exist"
- 500: "Internal Server Error"

## Service Centers APIs

### 6.15 Get Service Centers

**URL:** /api/service-centers

**Method:** GET

**Description:** Fetch list of service centers.

**Access:** Public

**Headers:** None

**Request Parameters:** None

**BODY:** None

**Success Response:**
- Status: 200
- Body:
```json
{
  "service_center_data": [
    {
      "id": "string",
      "name": "string",
      "city": "string"
    }
  ],
  "message": "Success"
}
```

**Error codes and response:**
- 500: "Internal Server Error"

### 6.16 Get Service Center Appointments

**URL:** /api/service-centers/appointments

**Method:** GET

**Description:** Fetch appointments for service centers, with optional filters.

**Access:** Service Center

**Headers:** None

**Request Parameters:**
- Query:
  - userId (string, required): Service Center ID
  - page (number, optional, default 1): Page number
  - status (string, optional): Filter by status
  - priority (string, optional): Filter by priority

**BODY:** None

**Success Response:**
- Status: 200
- Body:
```json
{
  "success": true,
  "appointments": [
    {
      "id": "string",
      "serviceType": "string",
      "status": "string",
      "requestedDate": "date",
      "actualCompletionDate": "date",
      "priority": "string",
      "isAccidental": false,
      "photos": [],
      "slaDeadline": "date",
      "Vehicle": { ... },
      "owner": { ... }
    }
  ],
  "totalCount": 10,
  "page": 1,
  "limit": 20,
  "totalPages": 1
}
```

**Error codes and response:**
- 400: "Service Center Id is required"
- 500: "Internal Server Error"

### 6.17 Get Service Center Appointments Dashboard

**URL:** /api/service-centers/appointments/dashboard

**Method:** GET

**Description:** Fetch dashboard data for service center appointments.

**Access:** Service Center

**Headers:** None

**Request Parameters:**
- Query:
  - scId (string, required): Service Center ID

**BODY:** None

**Success Response:**
- Status: 200
- Body:
```json
{
  "appointment_data": [
    {
      "id": "string",
      "serviceType": "string",
      "requestedDate": "date",
      "status": "string",
      "Vehicle": { ... },
      "owner": { ... }
    }
  ],
  "message": "Success"
}
```

**Error codes and response:**
- 400: "Service Center Id is required"
- 500: "Internal Server Error"

### 6.18 Get Service Center Appointment Details

**URL:** /api/service-centers/appointments/get

**Method:** GET

**Description:** Get detailed information for a specific service center appointment.

**Access:** Service Center

**Headers:** None

**Request Parameters:**
- Query:
  - appointmentId (string, required): Appointment ID

**BODY:** None

**Success Response:**
- Status: 200
- Body:
```json
{
  "message": "Success",
  "appointment_data": {
    "id": "string",
    "serviceType": "string",
    "status": "string",
    "requestedDate": "date",
    "actualCompletionDate": "date",
    "isAccidental": false,
    "photos": [],
    "slaDeadline": "date",
    "Mechanic": { ... },
    "Vehicle": { ... },
    "owner": { ... },
    "Invoice": { ... },
    "JobCards": [ ... ]
  }
}
```

**Error codes and response:**
- 400: "Appointment Id is required"
- 500: "Internal Server Error"

### 6.19 Get Service Center Inventory

**URL:** /api/service-centers/inventory

**Method:** GET

**Description:** Fetch service center inventory.

**Access:** Service Center

**Headers:** None

**Request Parameters:**
- Query:
  - serviceCenterId (string, required): Service Center ID

**BODY:** None

**Success Response:**
- Status: 200
- Body:
```json
{
  "message": "Success",
  "inventory_data": [
    {
      "id": "string",
      "name": "string",
      "sku": "string",
      "quantity": 0,
      "unitPrice": 0
    }
  ]
}
```

**Error codes and response:**
- 400: "Service Center Id is required"
- 500: "Internal Server Error"

### 6.20 Get Service Center Invoices

**URL:** /api/service-centers/invoices

**Method:** GET

**Description:** Fetch service center invoices, with optional filters.

**Access:** Service Center

**Headers:** None

**Request Parameters:**
- Query:
  - userId (string, required): Service Center ID
  - status (string, optional): Filter by invoice status
  - startDate (string, optional): Start date for billing date filter
  - endDate (string, optional): End date for billing date filter

**BODY:** None

**Success Response:**
- Status: 200
- Body:
```json
{
  "message": "Success",
  "invoice_data": [
    {
      "id": "string",
      "invoiceNumber": "string",
      "totalAmount": 0,
      "billingDate": "date",
      "dueDate": "date",
      "status": "string",
      "appointment": { ... }
    }
  ]
}
```

**Error codes and response:**
- 400: "User id is required"
- 500: "Internal server error"

### 6.21 Get Service Center Mechanics

**URL:** /api/service-centers/mechanics

**Method:** GET

**Description:** Fetch service center mechanics.

**Access:** Service Center

**Headers:** None

**Request Parameters:**
- Query:
  - serviceCenterId (string, required): Service Center ID

**BODY:** None

**Success Response:**
- Status: 200
- Body:
```json
{
  "mechanic_data": [
    {
      "id": "string",
      "name": "string",
      "email": "string",
      "phoneNumber": "string",
      "speciality": "string",
      "status": "string"
    }
  ],
  "message": "Success"
}
```

**Error codes and response:**
- 400: "Service Center Id is required"
- 500: "Internal Server Error"

### 6.22 Get Nearest Service Centers

**URL:** /api/service-centers/nearest

**Method:** GET

**Description:** Fetch the top 5 nearest service centers based on user coordinates.

**Access:** Public

**Headers:** None

**Request Parameters:**
- Query:
  - lat (number, required): User latitude
  - lon (number, required): User longitude

**BODY:** None

**Success Response:**
- Status: 200
- Body:
```json
{
  "service_center_data": [
    {
      "id": "string",
      "name": "string",
      "email": "string",
      "city": "string",
      "latitude": 0,
      "longitude": 0,
      "distanceKm": 0
    }
  ]
}
```

**Error codes and response:**
- 400: "Longitude & Latitude are required"
- 500: "Internal Server Error"

### 6.23 Get Service Center Notifications

**URL:** /api/service-centers/notifications

**Method:** GET

**Description:** Fetch service center notifications.

**Access:** Service Center

**Headers:** None

**Request Parameters:**
- Query:
  - userId (string, required): Service Center ID

**BODY:** None

**Success Response:**
- Status: 200
- Body:
```json
{
  "message": "Success",
  "notification_data": [
    {
      "id": "string",
      "message": "string",
      "createdAt": "date"
    }
  ]
}
```

**Error codes and response:**
- 400: { "error": "User ID required" }
- 500: "Internal Server Error"
