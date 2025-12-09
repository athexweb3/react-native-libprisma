export const goCode = `package main

import (
	"context"
	"encoding/json"
	"fmt"
	"log"
	"sync"
	"time"
)

// Generic constraint
type Identifiable interface {
	GetID() string
}

// Generic repository
type Repository[T Identifiable] struct {
	mu    sync.RWMutex
	items map[string]T
}

func NewRepository[T Identifiable]() *Repository[T] {
	return &Repository[T]{
		items: make(map[string]T),
	}
}

func (r *Repository[T]) Save(ctx context.Context, item T) error {
	r.mu.Lock()
	defer r.mu.Unlock()
	
	select {
	case <-ctx.Done():
		return ctx.Err()
	default:
		r.items[item.GetID()] = item
		return nil
	}
}

func (r *Repository[T]) FindByID(ctx context.Context, id string) (T, error) {
	r.mu.RLock()
	defer r.mu.RUnlock()
	
	var zero T
	item, ok := r.items[id]
	if !ok {
		return zero, fmt.Errorf("item not found: %s", id)
	}
	
	return item, nil
}

func (r *Repository[T]) FindAll(ctx context.Context) ([]T, error) {
	r.mu.RLock()
	defer r.mu.RUnlock()
	
	result := make([]T, 0, len(r.items))
	for _, item := range r.items {
		result = append(result, item)
	}
	
	return result, nil
}

// User model
type User struct {
	ID       string   \`json:"id"\`
	Name     string   \`json:"name"\`
	Email    string   \`json:"email"\`
	Roles    []string \`json:"roles"\`
	Created  time.Time \`json:"created"\`
}

func (u User) GetID() string {
	return u.ID
}

func (u User) HasRole(role string) bool {
	for _, r := range u.Roles {
		if r == role {
			return true
		}
	}
	return false
}

func (u User) MarshalJSON() ([]byte, error) {
	type Alias User
	return json.Marshal(&struct {
		*Alias
		Created string \`json:"created"\`
	}{
		Alias:   (*Alias)(&u),
		Created: u.Created.Format(time.RFC3339),
	})
}

// Service with dependency injection
type UserService struct {
	repo      *Repository[User]
	events    chan Event
	logger    *log.Logger
}

func NewUserService(repo *Repository[User], logger *log.Logger) *UserService {
	return &UserService{
		repo:   repo,
		events: make(chan Event, 100),
		logger: logger,
	}
}

// Event system
type EventType string

const (
	UserCreated EventType = "user.created"
	UserUpdated EventType = "user.updated"
	UserDeleted EventType = "user.deleted"
)

type Event struct {
	Type      EventType
	Timestamp time.Time
	Data      interface{}
}

func (s *UserService) CreateUser(ctx context.Context, name, email string, roles []string) (*User, error) {
	user := &User{
		ID:      fmt.Sprintf("user-%d", time.Now().UnixNano()),
		Name:    name,
		Email:   email,
		Roles:   roles,
		Created: time.Now(),
	}
	
	if err := s.repo.Save(ctx, *user); err != nil {
		return nil, fmt.Errorf("failed to save user: %w", err)
	}
	
	// Emit event
	select {
	case s.events <- Event{
		Type:      UserCreated,
		Timestamp: time.Now(),
		Data:      user,
	}:
	default:
		s.logger.Println("event channel full, dropping event")
	}
	
	return user, nil
}

func (s *UserService) GetAdminUsers(ctx context.Context) ([]User, error) {
	users, err := s.repo.FindAll(ctx)
	if err != nil {
		return nil, err
	}
	
	admins := make([]User, 0)
	for _, user := range users {
		if user.HasRole("admin") {
			admins = append(admins, user)
		}
	}
	
	return admins, nil
}

// Worker pool pattern
type Job func(context.Context) error

type WorkerPool struct {
	workers   int
	jobs      chan Job
	wg        sync.WaitGroup
	ctx       context.Context
	cancel    context.CancelFunc
}

func NewWorkerPool(workers int) *WorkerPool {
	ctx, cancel := context.WithCancel(context.Background())
	return &WorkerPool{
		workers: workers,
		jobs:    make(chan Job, workers*2),
		ctx:     ctx,
		cancel:  cancel,
	}
}

func (p *WorkerPool) Start() {
	for i := 0; i < p.workers; i++ {
		p.wg.Add(1)
		go p.worker(i)
	}
}

func (p *WorkerPool) worker(id int) {
	defer p.wg.Done()
	
	for {
		select {
		case job, ok := <-p.jobs:
			if !ok {
				return
			}
			if err := job(p.ctx); err != nil {
				log.Printf("worker %d: job failed: %v", id, err)
			}
		case <-p.ctx.Done():
			return
		}
	}
}

func (p *WorkerPool) Submit(job Job) error {
	select {
	case p.jobs <- job:
		return nil
	case <-p.ctx.Done():
		return p.ctx.Err()
	}
}

func (p *WorkerPool) Shutdown() {
	close(p.jobs)
	p.wg.Wait()
	p.cancel()
}

// Main application
func main() {
	logger := log.New(log.Writer(), "app: ", log.LstdFlags)
	
	// Setup repository and service
	repo := NewRepository[User]()
	service := NewUserService(repo, logger)
	
	// Start event listener
	go func() {
		for event := range service.events {
			logger.Printf("Event: %s at %s", event.Type, event.Timestamp)
		}
	}()
	
	// Create context with timeout
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()
	
	// Worker pool for concurrent operations
	pool := NewWorkerPool(4)
	pool.Start()
	defer pool.Shutdown()
	
	// Submit jobs
	users := []struct{ name, email string }{
		{"Alice", "alice@example.com"},
		{"Bob", "bob@example.com"},
		{"Charlie", "charlie@example.com"},
	}
	
	for _, u := range users {
		name, email := u.name, u.email
		pool.Submit(func(ctx context.Context) error {
			_, err := service.CreateUser(ctx, name, email, []string{"user"})
			return err
		})
	}
	
	// Wait a bit for jobs to complete
	time.Sleep(100 * time.Millisecond)
	
	// Query users
	allUsers, err := repo.FindAll(ctx)
	if err != nil {
		logger.Fatal(err)
	}
	
	logger.Printf("Total users: %d", len(allUsers))
}
`;
