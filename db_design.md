# Database Schema — "gabits"

## Entity: User
| Field | Type | constraints | 
|-------|------|------------|
| id | UUID | PK, auto-generated (default uuid) | 
| email | String | unique, required | 
| password | String | required, bcrypt hashed | 
| name | String | required | 
| createdAt | DateTime | auto (default now) | 
| updatedAt | DateTime | auto-updated | 

## Entity: Category
| Field | Type | constraints | 
|-------|------|------------|
| id | UUID | PK, auto-generated | 
| name | String | required | 
| isCustomCategory | Boolean | default false | 
| userId | UUID | FK → User.id, nullable (null for predefined) | 
| createdAt | DateTime | auto | 
| updatedAt | DateTime | auto-updated | 

**indexes**: unique(name, userId) — prevents duplicate category names per user.

**seed data** (isCustomCategory=false, userId=null):
- Health
- Career
- Personal Development
- Financial
- relationships

## Entity: Goal
| Field | Type | constraints | 
|-------|------|------------|
| id | UUID | PK, auto-generated | 
| userId | UUID | FK → User.id, required, onDelete CASCADE | 
| title | String | required | 
| description | String | nullable | 
| categoryId | UUID | FK → Category.id, nullable, onDelete SET NULL | 
| priorityLevel | String | required, enum: "foundational", "priority", "important", "would-be-nice" | 
| createdAt | DateTime | auto | 
| updatedAt | DateTime | auto-updated | 

**indexes**: index(userId), index(categoryId), index(priorityLevel).

## Entity: MicroGoal
| Field | Type | constraints | 
|-------|------|------------|
| id | UUID | PK, auto-generated | 
| goalId | UUID | FK → Goal.id, required, onDelete CASCADE | 
| title | String | required | 
| isCompleted | Boolean | default false | 
| completedAt | DateTime | nullable | 
| order | Integer | required, default 0 | 
| createdAt | DateTime | auto | 
| updatedAt | DateTime | auto-updated | 

**indexes**: index(goalId), index(goalId, order).

## relationships
- User 1 → N Goal
- User 1 → N Category (custom only)
- Category 1 → N Goal
- Goal 1 → N MicroGoal

## Notes
- Delete User → cascade delete Goals → cascade delete micro-goals.
- Delete Category → set Goal.categoryId to null (SET NULL).
- Delete Goal → cascade delete micro-goals.
- predefined categories are seeded on first migration/deploy and have no userId.