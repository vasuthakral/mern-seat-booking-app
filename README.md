# SeatBook — Office Seat Booking System

A full-stack seat booking system for organizations practicing hybrid work scheduling.

## Tech Stack

| Layer    | Technology              |
|----------|-------------------------|
| Frontend | React 19 + Vite + Tailwind CSS v4 |
| Backend  | Node.js + Express       |
| Database | PostgreSQL (pgAdmin)     |

---

## System Overview

| Item              | Value                          |
|-------------------|-------------------------------|
| Total seats       | 50 (seats 1–50)                |
| Regular seats     | 40 (seats 1–40)                |
| Floater seats     | 10 (seats 41–50)               |
| Total employees   | 80 (10 squads × 8 members)     |
| Batches per squad | 2 (Batch 1: 4 members, Batch 2: 4 members) |

### 2-Week Schedule

| Batch   | Week 1      | Week 2      |
|---------|-------------|-------------|
| Batch 1 | Mon–Wed     | Thu–Fri     |
| Batch 2 | Thu–Fri     | Mon–Wed     |

Each squad works **5 days per 2-week cycle**.

---

## Prerequisites

- **Node.js** v18+  
- **PostgreSQL** 14+ (with pgAdmin or `psql`)

---

## Step-by-Step Setup

### 1. Database Setup

1. Open **pgAdmin** (or `psql`)
2. Create the database:
   ```sql
   CREATE DATABASE seat_booking;
   ```
3. Open the Query Tool on `seat_booking` and run **`backend/schema.sql`**  
   *(This creates all tables and inserts 10 squads, 80 employees, and 50 seats.)*

### 2. Backend

```bash
cd backend

# Copy env template and fill in your DB credentials
copy .env.example .env
# Then edit .env with your PostgreSQL password

# Install dependencies (if not already done)
npm install

# Start the API server
npm run dev
# → API running at http://localhost:3001
```

> **Tip:** If you use the default `postgres/postgres` credentials, no `.env` changes needed.

### 3. Frontend

Open a **new terminal**:

```bash
cd frontend
npm install   # if not already done
npm run dev
# → App running at http://localhost:5173
```

---

## API Endpoints

| Method   | Path                   | Description                          |
|----------|------------------------|--------------------------------------|
| `GET`    | `/employees`           | List all employees (with squad/batch)|
| `GET`    | `/seats`               | List all 50 seats                    |
| `GET`    | `/bookings?date=`      | Get bookings for a date              |
| `GET`    | `/my-bookings?employee_id=` | Get upcoming bookings for employee |
| `GET`    | `/week-info?date=`     | Cycle week info + next working days  |
| `GET`    | `/availability?dates=` | Booked/free counts for given dates   |
| `GET`    | `/holidays?year=`      | Get public holidays (optional year param) |
| `POST`   | `/book`                | Book a seat `{employee_id, seat_id, date}` |
| `DELETE` | `/booking/:id`         | Cancel a booking `{employee_id}` in body |
| `PATCH`  | `/seat/:id/block`      | Block/unblock a seat `{block: bool}` |
| `GET`    | `/health`              | Health check                         |

---

## Booking Rules (Enforced on Both Frontend & Backend)

1. **Weekend guard** — No bookings on Saturday or Sunday  
2. **Public holidays** — No bookings on Indian national holidays (Republic Day, Independence Day, Diwali, etc.)  
3. **Designated days** — Employees can book any regular seat on their scheduled days  
4. **Non-designated days** — Only floater seats (41–50) can be booked  
5. **Blocked seats** — Cannot be booked by anyone  
6. **Double booking** — DB-level UNIQUE constraints prevent same seat being booked twice on same day  
7. **One booking per day** — DB UNIQUE constraint prevents an employee booking multiple seats per day  
8. **Block timing** — Seats can only be ***blocked*** after 3:00 PM (for next working day); unblocking is always allowed  

---

## Color Legend

| Color  | Meaning         |
|--------|-----------------|
| 🟢 Green  | Available seat  |
| 🔴 Red    | Booked by someone else |
| 🔵 Blue   | Floater seat (available on non-designated days) |
| ⬜ Grey   | Blocked seat    |
| 🟣 Purple | Your own booking |

---

## Project Structure

```
seat-booking/
├── backend/
│   ├── server.js          # Express API
│   ├── holidays.js        # Indian public holidays data
│   ├── schema.sql         # PostgreSQL schema + seed data
│   ├── .env.example       # Environment template
│   └── package.json
└── frontend/
    ├── src/
    │   ├── App.jsx            # Root with state management
    │   ├── api.js             # Fetch helpers
    │   ├── index.css          # Design tokens + Tailwind
    │   └── components/
    │       ├── Navbar.jsx     # Header with employee selector
    │       ├── SeatGrid.jsx   # 50-seat visual grid
    │       ├── SeatCard.jsx   # Individual seat card
    │       ├── BookingPanel.jsx # Book/cancel/block actions
    │       ├── WeekView.jsx   # Weekly allocation view
    │       ├── Legend.jsx     # Color key
    │       └── Toast.jsx      # Notifications
    ├── index.html
    └── package.json
```
