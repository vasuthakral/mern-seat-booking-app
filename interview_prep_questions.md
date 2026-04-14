# Seat Booking System: Interview Preparation Guide

This document contains potential technical and behavioral questions an interviewer might ask about your project, along with suggested answers to help you explain your specific implementation.

---

## 1. Architecture and Technology Stack

> **Q: What is the technology stack of your application, and why did you choose it?**
**A:** The application is a full-stack system. 
- **Frontend:** React.js powered by Vite for a fast, modern, and highly responsive user interface. I used Tailwind CSS for rapid and professional styling.
- **Backend:** Node.js with Express.js. It's lightweight, fast, and handles the REST API routes perfectly.
- **Database:** PostgreSQL. Since booking data is highly relational (Employees belong to Squads, Bookings link Employees to Seats), a SQL database is the perfect fit. It allows me to enforce strict data integrity rules directly at the database level.

> **Q: How does the frontend communicate with the backend?**
**A:** The React frontend consumes RESTful APIs exposed by the Express backend. I use HTTP methods like `GET` for fetching seat availability and `POST` for submitting a new booking. Cross-Origin Resource Sharing (CORS) is enabled on the backend to allow the frontend to access it.

---

## 2. Core Business Logic & Algorithms

> **Q: Can you explain the 2-week cycle and batch scheduling logic?**
**A:** To divide the 80 employees across the 50 available seats, the staff is split into two batches. I implemented a function `getWeekInCycle(date)` that determines if a given date falls in "Week 1" or "Week 2" of a rolling 14-day cycle anchored to a specific Monday. Depending on the week, Batch 1 might be designated for Monday–Wednesday, while Batch 2 takes Thursday–Friday, swapping the next week.

> **Q: What happens if an employee wants to come to the office on a day their batch isn't scheduled?**
**A:** My backend logic checks the employee's batch against the requested date (`isDesignatedDay` function). If it's a non-designated day for them, the system enforces a rule that they can *only* book one of the 10 "floater" seats (seats 41-50). If they try to book a regular seat (1-40), the API rejects the request with a 400 Bad Request error.

> **Q: How do you handle weekend bookings?**
**A:** I implemented a strict safeguard. Before any database insertion happens, a helper function `isWeekend(date)` checks the day of the week. If it returns true (Saturday or Sunday), the server immediately rejects the booking.

---

## 3. Data Integrity & Conflict Prevention (Crucial Topic)

> **Q: What happens if two employees try to book the exact same seat at the exact same time?**
**A:** This is a classic race condition. While the frontend updates the UI, the ultimate source of truth is the PostgreSQL database. I added a `UNIQUE (seat_id, date)` constraint on the `bookings` table. If two requests hit the database simultaneously, the first one inserts successfully, and the second one triggers a constraint violation error (code '23505'). My Express server catches this exact error code and returns a clean 409 Conflict response to the user.

> **Q: How do you prevent an employee from booking multiple seats on the same day?**
**A:** Similar to the double-booking protection, I added a `UNIQUE (employee_id, date)` constraint on the database. Even if someone bypassed the frontend UI, the database physically rejects a second booking for the same employee on the same date.

---

## 4. Feature Specifics

> **Q: How does the "seat blocking" feature work for admins?**
**A:** Seats can be blocked using a specific API endpoint. However, there is a business rule: a seat can only be blocked for the next working day *after 3:00 PM*. My backend checks the current server time using `new Date().getHours()`. If it's before 15 (3:00 PM), tracking the block request returns an error. If allowed, it updates the `is_blocked` boolean on the `seats` table.

> **Q: If I wanted to scale this application to support multiple office locations, what would you change in the database?**
**A:** I would normalize the database further by introducing a `locations` or `offices` table. The `seats` table would get a `location_id` foreign key. The `employees` table could also have a `primary_location_id`. The API routes would then require a location parameter to filter seats and bookings accordingly.
