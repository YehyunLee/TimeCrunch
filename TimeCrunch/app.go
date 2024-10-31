package main

import (
    "context"
    "fmt"
    "time"
)

// Task struct
type Task struct {
    ID          int
    Name        string
    Description string
    TargetTime  time.Time
}

// App struct
type App struct {
    ctx   context.Context
    tasks map[int]Task
    nextID int
}

// NewApp creates a new App application struct
func NewApp() *App {
    return &App{
        tasks: make(map[int]Task),
        nextID: 1,
    }
}

// startup is called when the app starts. The context is saved
// so we can call the runtime methods
func (a *App) startup(ctx context.Context) {
    a.ctx = ctx
}

// Greet returns a greeting for the given name
func (a *App) Greet(name string) string {
    return fmt.Sprintf("Hello %s, It's show time!", name)
}

// AddTask adds a new task
func (a *App) AddTask(name, description, targetTime string) int {
    id := a.nextID
    parsedTime, err := time.Parse(time.RFC3339, targetTime)
    if err != nil {
        fmt.Println("Error parsing time:", err)
        parsedTime = time.Now() // Fallback to current time or handle appropriately
    }
    a.tasks[id] = Task{
        ID:          id,
        Name:        name,
        Description: description,
        TargetTime:  parsedTime,
    }
    a.nextID++
    return id
}

// EditTask edits an existing task
func (a *App) EditTask(id int, name, description string, targetTime time.Time) bool {
    if task, exists := a.tasks[id]; exists {
        task.Name = name
        task.Description = description
        task.TargetTime = targetTime
        a.tasks[id] = task
        return true
    }
    return false
}

// DeleteTask deletes a task
func (a *App) DeleteTask(id int) bool {
    if _, exists := a.tasks[id]; exists {
        delete(a.tasks, id)
        return true
    }
    return false
}

// GetTasks returns all tasks
func (a *App) GetTasks() map[int]Task {
    return a.tasks
}