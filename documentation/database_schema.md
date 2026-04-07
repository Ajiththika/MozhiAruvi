# Database Schema Report - Mozhi Aruvi

Mozhi Aruvi uses a MongoDB database managed with Mongoose. Below is the Entity-Relationship (ER) diagram and detailed model descriptions.

## ER Diagram

```mermaid
erDiagram
    USER ||--o{ PROGRESS : "tracks"
    USER ||--o{ BOOKING : "as Student/Tutor"
    USER ||--o{ PAYMENT : "makes"
    USER ||--o{ ORGANIZATION : "owns/belongs"
    LESSON ||--o{ QUESTION : "contains"
    LESSON ||--o{ PROGRESS : "is tracked in"
    CATEGORY ||--o{ LESSON : "groups"

    USER {
        ObjectId _id
        String name
        String email
        String role
        String tutorStatus
        Number credits
        Number xp
        Number points
        Number power
        Object subscription
        ObjectId[] completedLessons
    }

    LESSON {
        ObjectId _id
        String title
        String category
        String level
        Boolean isPremiumOnly
        String moduleName
        Number orderIndex
    }

    QUESTION {
        ObjectId _id
        ObjectId lessonId
        String type
        String text
        String[] options
        String correctAnswer
        Number scoreValue
    }

    PROGRESS {
        ObjectId _id
        ObjectId userId
        ObjectId lessonId
        Number score
        Number accuracy
        Boolean isCompleted
        Date completedAt
    }

    BOOKING {
        ObjectId _id
        ObjectId studentId
        ObjectId tutorId
        String status
        Date date
        Number fee
    }

    PAYMENT {
        ObjectId _id
        ObjectId userId
        Number amount
        String status
        String type
    }

    CATEGORY {
        ObjectId _id
        String name
        String description
        String icon
    }

    ORGANIZATION {
        ObjectId _id
        String name
        ObjectId owner
        String plan
        ObjectId[] members
    }
```

## Model Descriptions

- **User**: Stores profile, authentication details, and gamification metadata (XP, power, badges). It also manages subscription state and role-based permissions.
- **Lesson**: The core learning entity, representing a module or specific lesson. It belongs to a level (Basic, Beginner, etc.) and category.
- **Question**: Granular questions linked to lessons. Supports multiple types: Quiz, Speaking, Writing, Matching, etc.
- **Progress**: Tracks a specific user's performance on a specific lesson, including score and completion timestamp.
- **Booking**: Manages 1-on-1 language sessions between students and tutors.
- **Payment**: Records financial transactions related to subscriptions and tutor bookings.
- **Organization**: Allows businesses or educational groups to manage multiple student seats under a unified plan.
