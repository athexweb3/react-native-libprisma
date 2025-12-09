export const csharpCode = `using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using Microsoft.Extensions.Logging;

namespace ExampleApp
{
    // Record type (C# 9+)
    public record User(
        string Id,
        string Name, 
        string Email,
        IReadOnlySet<string> Roles
    )
    {
        public bool HasRole(string role) => Roles.Contains(role);
        public bool IsAdmin => HasRole("admin");
    }
    
    // Generic repository interface
    public interface IRepository<T> where T : class
    {
        Task<T?> FindByIdAsync(string id, CancellationToken ct = default);
        Task<T> SaveAsync(T item, CancellationToken ct = default);
        Task<bool> DeleteAsync(string id, CancellationToken ct = default);
        Task<IEnumerable<T>> FindAllAsync(CancellationToken ct = default);
    }
    
    // Repository implementation with async
    public class UserRepository : IRepository<User>
    {
        private readonly Dictionary<string, User> _users = new();
        private readonly SemaphoreSlim _semaphore = new(1, 1);
        private readonly ILogger<UserRepository> _logger;
        
        public UserRepository(ILogger<UserRepository> logger)
        {
            _logger = logger;
        }
        
        public async Task<User?> FindByIdAsync(string id, CancellationToken ct = default)
        {
            await _semaphore.WaitAsync(ct);
            try
            {
                await Task.Delay(10, ct); // Simulate I/O
                return _users.GetValueOrDefault(id);
            }
            finally
            {
                _semaphore.Release();
            }
        }
        
        public async Task<User> SaveAsync(User item, CancellationToken ct = default)
        {
            await _semaphore.WaitAsync(ct);
            try
            {
                _users[item.Id] = item;
                _logger.LogInformation("Saved user {UserId}", item.Id);
                return item;
            }
            finally
            {
                _semaphore.Release();
            }
        }
        
        public async Task<bool> DeleteAsync(string id, CancellationToken ct = default)
        {
            await _semaphore.WaitAsync(ct);
            try
            {
                return _users.Remove(id);
            }
            finally
            {
                _semaphore.Release();
            }
        }
        
        public async Task<IEnumerable<User>> FindAllAsync(CancellationToken ct = default)
        {
            await _semaphore.WaitAsync(ct);
            try
            {
                return _users.Values.ToList();
            }
            finally
            {
                _semaphore.Release();
            }
        }
        
        public async IAsyncEnumerable<User> FindByRoleAsync(string role)
        {
            var users = await FindAllAsync();
            foreach (var user in users.Where(u => u.HasRole(role)))
            {
                await Task.Delay(1); // Simulate streaming
                yield return user;
            }
        }
    }
    
    // Event types
    public abstract record UserEvent(DateTime Timestamp)
    {
        public record Created(User User, DateTime Timestamp) : UserEvent(Timestamp);
        public record Updated(User User, DateTime Timestamp) : UserEvent(Timestamp);
        public record Deleted(string UserId, DateTime Timestamp) : UserEvent(Timestamp);
    }
    
    // Service with LINQ and pattern matching
   public class UserService
    {
        private readonly IRepository<User> _repository;
        private readonly ILogger<UserService> _logger;
        private readonly List<Func<UserEvent, Task>> _eventHandlers = new();
        
        public UserService(IRepository<User> repository, ILogger<UserService> logger)
        {
            _repository = repository;
            _logger = logger;
        }
        
        public void On<TEvent>(Func<TEvent, Task> handler) where TEvent : UserEvent
        {
            _eventHandlers.Add(async e =>
            {
                if (e is TEvent typedEvent)
                    await handler(typedEvent);
            });
        }
        
        private async Task EmitAsync(UserEvent @event)
        {
            var tasks = _eventHandlers.Select(handler => handler(@event));
            await Task.WhenAll(tasks);
        }
        
        public async Task<User> CreateUserAsync(
            string name,
            string email,
            IReadOnlySet<string>? roles = null,
            CancellationToken ct = default)
        {
            var user = new User(
                Id: $"user-{DateTime.UtcNow.Ticks}",
                Name: name,
                Email: email,
                Roles: roles ?? new HashSet<string> { "user" }
            );
            
            await _repository.SaveAsync(user, ct);
            await EmitAsync(new UserEvent.Created(user, DateTime.UtcNow));
            
            return user;
        }
        
        public async Task<IEnumerable<User>> GetAdminUsersAsync(CancellationToken ct = default)
        {
            var users = await _repository.FindAllAsync(ct);
            return users.Where(u => u.IsAdmin);
        }
        
        // Pattern matching and switch expressions (C# 8+)
        public string GetUserStatus(User user) => user switch
        {
            { IsAdmin: true } => "Administrator",
            { Roles.Count: > 3 } => "Power User",
            { Roles: var r } when r.Contains("moderator") => "Moderator",
            _ => "Regular User"
        };
        
        // Retry with exponential backoff
        public async Task<T> RetryAsync<T>(
            Func<Task<T>> operation,
            int maxAttempts = 3,
            CancellationToken ct = default)
        {
            var attempt = 0;
            while (true)
            {
                try
                {
                    return await operation();
                }
                catch (Exception ex) when (attempt < maxAttempts - 1)
                {
                    attempt++;
                    var delay = TimeSpan.FromMilliseconds(Math.Pow(2, attempt) * 100);
                    _logger.LogWarning(ex, "Attempt {Attempt} failed, retrying after {Delay}ms",
                        attempt, delay.TotalMilliseconds);
                    await Task.Delay(delay, ct);
                }
            }
        }
    }
    
    // Extension methods
    public static class EnumerableExtensions
    {
        public static async Task<List<T>> ToListAsync<T>(this IAsyncEnumerable<T> source)
        {
            var list = new List<T>();
            await foreach (var item in source)
            {
                list.Add(item);
            }
            return list;
        }
    }
    
    // Main program
    public class Program
    {
        public static async Task Main(string[] args)
        {
            using var loggerFactory = LoggerFactory.Create(builder => 
                builder.AddConsole());
            
            var repoLogger = loggerFactory.CreateLogger<UserRepository>();
            var serviceLogger = loggerFactory.CreateLogger<UserService>();
            
            var repository = new UserRepository(repoLogger);
            var service = new UserService(repository, serviceLogger);
            
            // Event handler
            service.On<UserEvent.Created>(async e =>
            {
                Console.WriteLine($"User created: {e.User.Name}");
                await Task.CompletedTask;
            });
            
            // Create users concurrently
            var userTasks = new[]
            {
                ("Alice", "alice@example.com", new HashSet<string> { "admin", "user" }),
                ("Bob", "bob@example.com", new HashSet<string> { "user" }),
                ("Charlie", "charlie@example.com", new HashSet<string> { "user", "moderator" })
            }.Select(u => service.CreateUserAsync(u.Item1, u.Item2, u.Item3));
            
            var users = await Task.WhenAll(userTasks);
            
            // Get admin users
            var admins = await service.GetAdminUsersAsync();
            Console.WriteLine($"Admin users: {string.Join(", ", admins.Select(u => u.Name))}");
            
            // Use async enumerable
            await foreach (var admin in repository.FindByRoleAsync("admin"))
            {
                Console.WriteLine($"Found admin: {admin.Name}");
            }
        }
    }
}
`;
