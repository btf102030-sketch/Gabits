# API Design — "gabits"

Base URL: `/api`

## Authentication

| Method | Path | Request Body | Response Body | Auth | 
|--------|------|-------------|---------------|------|
| POST | /api/signup | {email: string (required), password: string (required), name: string (required)} | {token: string, user: {id: UUID, email: string, name: string}} | No | 
| POST | /api/auth/login | {email: string (required), password: string (required)} | {token: string, user: {id: UUID, email: string, name: string}} | No | 
| GET | /api/auth/me | — | {user: {id: UUID, email: string, name: string}} | Bearer | 

## Categories

| Method | Path | Request Body | Response Body | Auth | 
|--------|------|-------------|---------------|------|
| GET | /api/categories | — | {categories: Category[]} | Bearer | 
| POST | /api/categories | {name: string (required)} | {id: UUID, name: string, isCustomCategory: boolean, userId: UUID, goalCount: integer} | Bearer | 
| DELETE | /api/categories/:id | — | {success: boolean} | Bearer | 

**Category object:**
```
{
  id: UUID,
  name: string,
  isCustomCategory: boolean,
  userId: UUID | null,
  goalCount: integer
}
```

Notes:
- GET returns predefined categories (isCustomCategory=false) + user's custom categories. `goalCount` is computed.
- DELETE only allowed on custom categories owned by user. If goals reference this category, set their categoryId to null.
- Cannot delete predefined categories (return 403).

## Goals

| Method | Path | Request Body | Response Body | Auth | 
|--------|------|-------------|---------------|------|
| GET | /api/goals | query: ?categoryId=UUID&priority=string | {goals: GoalWithProgress[]} | Bearer | 
| GET | /api/goals/:id | — | GoalDetail | Bearer | 
| POST | /api/goals | CreateGoalBody | GoalDetail | Bearer | 
| PUT | /api/goals/:id | UpdateGoalBody | GoalDetail | Bearer | 
| DELETE | /api/goals/:id | — | {success: boolean} | Bearer | 

**CreateGoalBody:**
```
{
  title: string (required),
  description: string (optional),
  categoryId: UUID (optional),
  priorityLevel: "foundational" | "priority" | "important" | "would-be-nice" (required),
  microGoals: {title: string, order: integer}[] (optional)
}
```

**UpdateGoalBody:**
```
{
  title: string (optional),
  description: string (optional),
  categoryId: UUID | null (optional),
  priorityLevel: "foundational" | "priority" | "important" | "would-be-nice" (optional)
}
```

**GoalWithProgress:**
```
{
  id: UUID,
  title: string,
  description: string | null,
  categoryId: UUID | null,
  category: {id: UUID, name: string} | null,
  priorityLevel: string,
  totalMicroGoals: integer,
  completedMicroGoals: integer,
  progressPercent: number,
  createdAt: ISO8601,
  updatedAt: ISO8601
}
```

**GoalDetail** (extends GoalWithProgress):
```
{
  ...GoalWithProgress,
  microGoals: MicroGoal[]
}
```

## micro-goals

| Method | Path | Request Body | Response Body | Auth | 
|--------|------|-------------|---------------|------|
| POST | /api/goals/:goalId/micro-goals | {title: string (required), order: integer (optional)} | MicroGoal | Bearer | 
| PUT | /api/micro-goals/:id | {title: string (optional), order: integer (optional)} | MicroGoal | Bearer | 
| DELETE | /api/micro-goals/:id | — | {success: boolean} | Bearer | 
| POST | /api/micro-goals/:id/toggle | — | MicroGoal | Bearer | 
| PUT | /api/goals/:goalId/micro-goals/reorder | {orderedIds: UUID[] (required)} | {success: boolean} | Bearer | 

**MicroGoal:**
```
{
  id: UUID,
  goalId: UUID,
  title: string,
  isCompleted: boolean,
  completedAt: ISO8601 | null,
  order: integer,
  createdAt: ISO8601,
  updatedAt: ISO8601
}
```

Notes:
- Toggle sets isCompleted to !current value. If completing, sets completedAt=now. If uncompleting, sets completedAt=null.
- All goal/micro-goal endpoints verify ownership (userId match).
- Delete goal cascades to delete all its micro-goals.
- reorder endpoint accepts full ordered list of micro-goal IDs and updates order field accordingly.

## Error Response Format
```
{
  statusCode: integer,
  message: string | string[],
  error: string
}
```
Standard HTTP codes: 400 (validation), 401 (unauthorized), 403 (forbidden), 404 (not found).