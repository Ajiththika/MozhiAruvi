# Use Case Diagram - Mozhi Aruvi

The following diagram illustrates the primary interactions between the different user roles (Student, Tutor, Admin) and the Mozhi Aruvi platform.

```mermaid
useCaseDiagram
    actor Student
    actor Tutor
    actor Admin

    package "Student Features" {
        usecase "Register & Login" as UC1
        usecase "Browse/Search Lessons" as UC2
        usecase "Take Lesson (Quiz/MCQ/Speaking)" as UC3
        usecase "Track Progress (XP/Streaks)" as UC4
        usecase "Chat with MozhiAruvi AI" as UC5
        usecase "Book Tutor Session" as UC6
        usecase "Manage Subscription" as UC7
        usecase "Attend Events" as UC8
    }

    package "Tutor Features" {
        usecase "Apply to be a Tutor" as UC9
        usecase "Manage Profile & Bio" as UC10
        usecase "Set Availability Schedule" as UC11
        usecase "Manage Bookings" as UC12
        usecase "View Earnings/Analytics" as UC13
    }

    package "Admin Features" {
        usecase "Manage Users & Roles" as UC14
        usecase "Approve/Reject Tutor Applications" as UC15
        usecase "Manage Content (Lessons/Questions)" as UC16
        usecase "System Configuration & Plans" as UC17
        usecase "View Platform Analytics" as UC18
    }

    Student --> UC1
    Student --> UC2
    Student --> UC3
    Student --> UC4
    Student --> UC5
    Student --> UC6
    Student --> UC7
    Student --> UC8

    Tutor --> UC1
    Tutor --> UC9
    Tutor --> UC10
    Tutor --> UC11
    Tutor --> UC12
    Tutor --> UC13

    Admin --> UC1
    Admin --> UC14
    Admin --> UC15
    Admin --> UC16
    Admin --> UC17
    Admin --> UC18
```

## Actor Descriptions

- **Student**: The primary user who learns Tamil through lessons, tracks their gamified progress, interacts with AI, and books expert tutors.
- **Tutor**: Language experts who provide 1-on-1 sessions, manage their schedules, and track their performance.
- **Admin**: Platform managers who oversee content quality, user behavior, and platform health.
