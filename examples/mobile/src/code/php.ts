export const phpCode = `<?php

declare(strict_types=1);

namespace App;

use DateTimeImmutable;
use InvalidArgumentException;
use Generator;

// PHP 8+ Attributes
#[\\Attribute]
class Route
{
    public function __construct(
        public readonly string $path,
        public readonly string $method = 'GET'
    ) {}
}

// Enum (PHP 8.1+)
enum UserRole: string
{
    case ADMIN = 'admin';
    case USER = 'user';
    case MODERATOR = 'moderator';
    
    public function hasPermission(string $permission): bool
    {
        return match($this) {
            self::ADMIN => true,
            self::MODERATOR => in_array($permission, ['read', 'write']),
            self::USER => $permission === 'read',
        };
    }
}

// Readonly class (PHP 8.2+)
readonly class User
{
    public function __construct(
        public string $id,
        public string $name,
        public string $email,
        public array $roles,
        public DateTimeImmutable $created = new DateTimeImmutable()
    ) {
        if (empty($name)) {
            throw new InvalidArgumentException('Name cannot be empty');
        }
        
        if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
            throw new InvalidArgumentException('Invalid email format');
        }
    }
    
    public function hasRole(UserRole $role): bool
    {
        return in_array($role, $this->roles, true);
    }
    
    public function isAdmin(): bool
    {
        return $this->hasRole(UserRole::ADMIN);
    }
}

// Generic repository interface
interface Repository
{
    public function findById(string $id): ?User;
    public function save(User $user): User;
    public function delete(string $id): bool;
    public function findAll(): array;
}

// Repository implementation with typed properties
class UserRepository implements Repository
{
    private array $users = [];
    
    public function __construct(
        private readonly \\Psr\\Log\\LoggerInterface $logger
    ) {}
    
    public function findById(string $id): ?User
    {
        return $this->users[$id] ?? null;
    }
    
    public function save(User $user): User
    {
        $this->users[$user->id] = $user;
        $this->logger->info("Saved user: {$user->name}");
        return $user;
    }
    
    public function delete(string $id): bool
    {
        if (isset($this->users[$id])) {
            unset($this->users[$id]);
            return true;
        }
        return false;
    }
    
    public function findAll(): array
    {
        return array_values($this->users);
    }
    
    public function findByRole(UserRole $role): Generator
    {
        foreach ($this->users as $user) {
            if ($user->hasRole($role)) {
                yield $user;
            }
        }
    }
}

// Service with constructor property promotion
class UserService
{
    private array $eventHandlers = [];
    
    public function __construct(
        private readonly Repository $repository,
        private readonly \\Psr\\Log\\LoggerInterface $logger
    ) {}
    
    public function on(string $event, callable $handler): void
    {
        $this->eventHandlers[$event][] = $handler;
    }
    
    private function emit(string $event, mixed $data): void
    {
        $handlers = $this->eventHandlers[$event] ?? [];
        foreach ($handlers as $handler) {
            $handler($data);
        }
    }
    
    public function createUser(
        string $name,
        string $email,
        array $roles = [UserRole::USER]
    ): User {
        $user = new User(
            id: 'user-' . uniqid(),
            name: $name,
            email: $email,
            roles: $roles
        );
        
        $this->repository->save($user);
        $this->emit('user.created', $user);
        
        return $user;
    }
    
    public function getAdminUsers(): array
    {
        return array_filter(
            $this->repository->findAll(),
            fn(User $user) => $user->isAdmin()
        );
    }
    
    // Named arguments usage (PHP 8+)
    public function updateUser(
        string $id,
        ?string $name = null,
        ?string $email = null,
        ?array $roles = null
    ): ?User {
        $user = $this->repository->findById($id);
        
        if ($user === null) {
            return null;
        }
        
        $updated = new User(
            id: $user->id,
            name: $name ?? $user->name,
            email: $email ?? $user->email,
            roles: $roles ?? $user->roles,
            created: $user->created
        );
        
        return $this->repository->save($updated);
    }
}

// Controller with attributes
class UserController
{
    public function __construct(
        private readonly UserService $service
    ) {}
    
    #[Route('/users', 'GET')]
    public function index(): array
    {
        return $this->service->getAdminUsers();
    }
    
    #[Route('/users', 'POST')]
    public function create(array $data): User
    {
        return $this->service->createUser(
            name: $data['name'],
            email: $data['email'],
            roles: $data['roles'] ?? [UserRole::USER]
        );
    }
    
    #[Route('/users/{id}', 'PUT')]
    public function update(string $id, array $data): ?User
    {
        return $this->service->updateUser(
            id: $id,
            name: $data['name'] ?? null,
            email: $data['email'] ?? null,
            roles: $data['roles'] ?? null
        );
    }
}

// Match expression (PHP 8+)
function getUserStatus(User $user): string
{
    return match(true) {
        $user->isAdmin() => 'Administrator',
        count($user->roles) > 3 => 'Power User',
        $user->hasRole(UserRole::MODERATOR) => 'Moderator',
        default => 'Regular User'
    };
}

// Main execution
function main(): void
{
    // PSR-3 logger mock
    $logger = new class implements \\Psr\\Log\\LoggerInterface {
        public function info(string $message, array $context = []): void {
            echo "[INFO] $message\\n";
        }
        // ... other PSR-3 methods
        public function emergency(\\Stringable|string $message, array $context = []): void {}
        public function alert(\\Stringable|string $message, array $context = []): void {}
        public function critical(\\Stringable|string $message, array $context = []): void {}
        public function error(\\Stringable|string $message, array $context = []): void {}
        public function warning(\\Stringable|string $message, array $context = []): void {}
        public function notice(\\Stringable|string $message, array $context = []): void {}
        public function debug(\\Stringable|string $message, array $context = []): void {}
        public function log($level, \\Stringable|string $message, array $context = []): void {}
    };
    
    $repository = new UserRepository($logger);
    $service = new UserService($repository, $logger);
    
    // Event handler
    $service->on('user.created', function(User $user) {
        echo "User created: {$user->name}\\n";
    });
    
    // Create users
    $users = [
        $service->createUser('Alice', 'alice@example.com', [UserRole::ADMIN, UserRole::USER]),
        $service->createUser('Bob', 'bob@example.com'),
        $service->createUser('Charlie', 'charlie@example.com', [UserRole::MODERATOR])
    ];
    
    // Get admin users
    $admins = $service->getAdminUsers();
    echo "Admin users: " . implode(', ', array_map(fn($u) => $u->name, $admins)) . "\\n";
    
    // Use generator
    foreach ($repository->findByRole(UserRole::ADMIN) as $admin) {
        echo "Found admin: {$admin->name}\\n";
    }
}

// Run if executed directly
if (basename(__FILE__) === basename($_SERVER['SCRIPT_FILENAME'] ?? '')) {
    main();
}
`;
