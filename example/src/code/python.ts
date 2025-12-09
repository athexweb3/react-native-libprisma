export const pythonCode = `"""
Advanced Python application demonstrating modern features
"""
from typing import TypeVar, Generic, Protocol, Callable, Optional
from dataclasses import dataclass, field
from abc import ABC, abstractmethod
from contextlib import asynccontextmanager
import asyncio
from functools import wraps, lru_cache
from collections import defaultdict
import logging

# Type variables and generics
T = TypeVar('T')
K = TypeVar('K')
V = TypeVar('V')

# Protocol for structural subtyping
class Drawable(Protocol):
    def draw(self) -> None: ...

# Dataclass with advanced features
@dataclass(frozen=True)
class User:
    id: int
    name: str
    email: str
    roles: list[str] = field(default_factory=list)
    metadata: dict[str, any] = field(default_factory=dict)
    
    def has_role(self, role: str) -> bool:
        return role in self.roles
    
    @property
    def is_admin(self) -> bool:
        return 'admin' in self.roles

# Generic repository pattern
class Repository(Generic[T], ABC):
    def __init__(self):
        self._items: dict[int, T] = {}
        self._logger = logging.getLogger(self.__class__.__name__)
    
    @abstractmethod
    async def find_by_id(self, id: int) -> Optional[T]:
        """Find item by ID"""
        pass
    
    async def save(self, item: T) -> T:
        """Save item to repository"""
        self._logger.info(f"Saving item: {item}")
        # Implementation here
        return item
    
    async def delete(self, id: int) -> bool:
        """Delete item by ID"""
        if id in self._items:
            del self._items[id]
            return True
        return False

# Async context manager
@asynccontextmanager
async def database_transaction():
    """Async context manager for database transactions"""
    print("Starting transaction")
    try:
        yield
        print("Committing transaction")
    except Exception as e:
        print(f"Rolling back transaction: {e}")
        raise
    finally:
        print("Closing connection")

# Decorator with parameters
def retry(max_attempts: int = 3, delay: float = 1.0):
    """Retry decorator for async functions"""
    def decorator(func: Callable):
        @wraps(func)
        async def wrapper(*args, **kwargs):
            for attempt in range(max_attempts):
                try:
                    return await func(*args, **kwargs)
                except Exception as e:
                    if attempt == max_attempts - 1:
                        raise
                    await asyncio.sleep(delay * (attempt + 1))
            return None
        return wrapper
    return decorator

# User repository implementation
class UserRepository(Repository[User]):
    def __init__(self):
        super().__init__()
        self._cache: dict[int, User] = {}
    
    @lru_cache(maxsize=128)
    async def find_by_id(self, id: int) -> Optional[User]:
        """Find user by ID with caching"""
        if id in self._cache:
            return self._cache[id]
        
        # Simulate database query
        await asyncio.sleep(0.01)
        user = self._items.get(id)
        
        if user:
            self._cache[id] = user
        
        return user
    
    @retry(max_attempts=3, delay=0.5)
    async def find_by_email(self, email: str) -> Optional[User]:
        """Find user by email with retry logic"""
        for user in self._items.values():
            if user.email == email:
                return user
        return None
    
    async def find_by_role(self, role: str) -> list[User]:
        """Find all users with specific role"""
        return [
            user for user in self._items.values()
            if user.has_role(role)
        ]

# Service layer with dependency injection
class UserService:
    def __init__(self, repository: UserRepository):
        self.repository = repository
        self._event_handlers: defaultdict[str, list[Callable]] = defaultdict(list)
    
    def on(self, event: str, handler: Callable) -> None:
        """Register event handler"""
        self._event_handlers[event].append(handler)
    
    async def _emit(self, event: str, *args, **kwargs) -> None:
        """Emit event to all handlers"""
        handlers = self._event_handlers.get(event, [])
        await asyncio.gather(*[
            handler(*args, **kwargs) for handler in handlers
        ])
    
    async def create_user(
        self, 
        name: str, 
        email: str, 
        roles: list[str] = None
    ) -> User:
        """Create new user"""
        async with database_transaction():
            user = User(
                id=len(self.repository._items) + 1,
                name=name,
                email=email,
                roles=roles or ['user']
            )
            
            await self.repository.save(user)
            await self._emit('user_created', user)
            
            return user
    
    async def get_admin_users(self) -> list[User]:
        """Get all admin users"""
        users = await self.repository.find_by_role('admin')
        return [user for user in users if user.is_admin]

# Main async application
async def main():
    """Main application entry point"""
    # Setup
    repository = UserRepository()
    service = UserService(repository)
    
    # Event handler
    async def on_user_created(user: User):
        print(f"New user created: {user.name}")
    
    service.on('user_created', on_user_created)
    
    # Create users
    users = await asyncio.gather(
        service.create_user("Alice", "alice@example.com", ["admin", "user"]),
        service.create_user("Bob", "bob@example.com", ["user"]),
        service.create_user("Charlie", "charlie@example.com", ["user", "moderator"])
    )
    
    # Query users
    admin_users = await service.get_admin_users()
    print(f"Admin users: {[u.name for u in admin_users]}")
    
    # Find specific user
    user = await repository.find_by_email("alice@example.com")
    if user:
        print(f"Found user: {user.name} with roles: {user.roles}")

if __name__ == "__main__":
    asyncio.run(main())
`;
