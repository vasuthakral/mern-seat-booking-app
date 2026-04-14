# Database Architecture & Design

This document outlines the schema, logic, and reasoning behind the PostgreSQL database design for the Seat Booking Application. This is perfect for presenting to an interviewer.

---

## 1. Entity Relationship Overview

The database is built on a highly normalized relational model consisting of **4 core tables**:

1.  **`squads`**: Teams within the company.
2.  **`employees`**: The workforce, organized into squads and batches.
3.  **`seats`**: The physical office desks, marked with special properties.
4.  **`bookings`**: The transactional table linking an employee to a seat on a specific date.

---

## 2. Table Definitions & Schema

### `squads` Table
Represents the 10 teams in the company (Alpha, Bravo, etc.).
*   `id` (SERIAL, PRIMARY KEY)
*   `name` (VARCHAR) - *Must be UNIQUE*

### `employees` Table
Holds the 80 staff members.
*   `id` (SERIAL, PRIMARY KEY)
*   `name` (VARCHAR)
*   `squad_id` (INTEGER) - *Foreign Key linking to `squads(id)` with ON DELETE CASCADE.*
*   `batch` (SMALLINT) - *Restricted natively by a CHECK constraint `CHECK (batch IN (1, 2))` to prevent invalid data.*

### `seats` Table
Holds the 50 office desks. It doesn't hold who is sitting there, only the physical properties of the desk.
*   `id` (SERIAL, PRIMARY KEY)
*   `is_floater` (BOOLEAN) - *Flags seats 41-50. Defaults to FALSE.*
*   `is_blocked` (BOOLEAN) - *Flags seats temporarily out of commission. Defaults to FALSE.*

### `bookings` Table (The Core Transaction Table)
This is where the magic happens. It connects an Employee to a Seat on a Date.
*   `id` (SERIAL, PRIMARY KEY)
*   `employee_id` (INTEGER) - *Foreign Key linking to `employees`.*
*   `seat_id` (INTEGER) - *Foreign Key linking to `seats`.*
*   `date` (DATE) - *The day the booking is for.*

---

## 3. Database-Level Protections (Why this design is strong)

The most impressive part of this database design is that it **does not rely on JavaScript to prevent data corruption.** It uses PostgreSQL constraints to guarantee integrity.

### 1. The "Double Booking" Prevention
```sql
CONSTRAINT unique_seat_date UNIQUE (seat_id, date)
```
**Why it matters:** Even if two people click "Book Desk 5" at the exact millisecond, the database physically prevents the second record from being written. The backend catches this rejection and alerts the second user.

### 2. The "Greedy Employee" Prevention
```sql
CONSTRAINT unique_employee_date UNIQUE (employee_id, date)
```
**Why it matters:** An employee cannot accidentally (or maliciously) book Desk 5 and Desk 12 on the same day. 

### 3. Data Cleanup Maintenance
```sql
ON DELETE CASCADE (on Foreign Keys)
```
**Why it matters:** If an employee leaves the company and is deleted from the `employees` table, the database is smart enough to automatically wipe out all of their future `bookings` instantly, freeing up those seats without needing a manual cleanup script.

---

## 4. Indexing for Performance
To ensure the backend API remains lightning-fast even as thousands of bookings are recorded over the months, specific indexes were added to the schema:

*   `CREATE INDEX idx_bookings_date ON bookings(date);`
    *   * Speeds up the main dashboard query: "Show me all occupied seats for today."
*   `CREATE INDEX idx_bookings_employee_id ON bookings(employee_id);`
    *   * Speeds up the "My Bookings" page.
