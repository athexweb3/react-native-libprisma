export const javaCode = `/**
 * Modern Java example with Streams, Generics, and Annotations
 */
package com.example.demo;

import java.util.*;
import java.util.stream.*;
import java.util.concurrent.*;
import java.util.function.*;
import java.time.*;
import java.lang.annotation.*;

// Custom annotations
@Retention(RetentionPolicy.RUNTIME)
@Target(ElementType.METHOD)
@interface Cacheable {
    int ttl() default 3600;
    String key() default "";
}

@Retention(RetentionPolicy.RUNTIME)
@Target(ElementType.TYPE)
@interface Entity {
    String table();
}

// Entity class
@Entity(table = "users")
public class User implements Serializable {
    private static final long serialVersionUID = 1L;
    
    private final Long id;
    private final String name;
    private final String email;
    private final UserRole role;
    private final LocalDateTime createdAt;

    public User(Long id, String name, String email, UserRole role) {
        this.id = Objects.requireNonNull(id, "ID cannot be null");
        this.name = Objects.requireNonNull(name, "Name cannot be null");
        this.email = Objects.requireNonNull(email, "Email cannot be null");
        this.role = Objects.requireNonNull(role, "Role cannot be null");
        this.createdAt = LocalDateTime.now();
    }

    // Getters
    public Long getId() { return id; }
    public String getName() { return name; }
    public String getEmail() { return email; }
    public UserRole getRole() { return role; }
    public LocalDateTime getCreatedAt() { return createdAt; }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (!(o instanceof User)) return false;
        User user = (User) o;
        return Objects.equals(id, user.id);
    }

    @Override
    public int hashCode() {
        return Objects.hash(id);
    }

    @Override
    public String toString() {
        return String.format("User{id=%d, name='%s', email='%s', role=%s}",
                id, name, email, role);
    }
}

enum UserRole {
    ADMIN("admin"),
    USER("user"),
    GUEST("guest");

    private final String value;

    UserRole(String value) {
        this.value = value;
    }

    public String getValue() {
        return value;
    }
}

// Generic Repository pattern
interface Repository<T, ID> {
    Optional<T> findById(ID id);
    List<T> findAll();
    T save(T entity);
    void delete(ID id);
}

class UserRepository implements Repository<User, Long> {
    private final Map<Long, User> storage = new ConcurrentHashMap<>();

    @Override
    @Cacheable(ttl = 600, key = "user:{id}")
    public Optional<User> findById(Long id) {
        return Optional.ofNullable(storage.get(id));
    }

    @Override
    public List<User> findAll() {
        return new ArrayList<>(storage.values());
    }

    @Override
    public User save(User user) {
        storage.put(user.getId(), user);
        return user;
    }

    @Override
    public void delete(Long id) {
        storage.remove(id);
    }

    // Custom query methods
    public List<User> findByRole(UserRole role) {
        return storage.values()
                .stream()
                .filter(user -> user.getRole() == role)
                .collect(Collectors.toList());
    }

    public Optional<User> findByEmail(String email) {
        return storage.values()
                .stream()
                .filter(user -> user.getEmail().equals(email))
                .findFirst();
    }
}

// Service layer with business logic
class UserService {
    private final UserRepository repository;
    private final ExecutorService executor;

    public UserService(UserRepository repository) {
        this.repository = repository;
        this.executor = Executors.newFixedThreadPool(10);
    }

    public CompletableFuture<User> createUserAsync(String name, String email, UserRole role) {
        return CompletableFuture.supplyAsync(() -> {
            Long id = System.currentTimeMillis();
            User user = new User(id, name, email, role);
            return repository.save(user);
        }, executor);
    }

    public List<User> getActiveUsers() {
        return repository.findAll()
                .stream()
                .filter(user -> !user.getRole().equals(UserRole.GUEST))
                .sorted(Comparator.comparing(User::getName))
                .collect(Collectors.toList());
    }

    public Map<UserRole, List<User>> getUsersByRole() {
        return repository.findAll()
                .stream()
                .collect(Collectors.groupingBy(User::getRole));
    }

    public Optional<User> findUserByEmail(String email) {
        return repository.findByEmail(email);
    }

    public void shutdown() {
        executor.shutdown();
        try {
            if (!executor.awaitTermination(60, TimeUnit.SECONDS)) {
                executor.shutdownNow();
            }
        } catch (InterruptedException e) {
            executor.shutdownNow();
            Thread.currentThread().interrupt();
        }
    }
}

// Functional interfaces and streams
class StreamExamples {
    public static void demonstrateStreams() {
        // Creating streams
        List<Integer> numbers = IntStream.rangeClosed(1, 100)
                .boxed()
                .collect(Collectors.toList());

        // Map, filter, reduce
        int sumOfSquares = numbers.stream()
                .filter(n -> n % 2 == 0)
                .map(n -> n * n)
                .reduce(0, Integer::sum);

        System.out.println("Sum of squares: " + sumOfSquares);

        // Collectors
        Map<Boolean, List<Integer>> partitioned = numbers.stream()
                .collect(Collectors.partitioningBy(n -> n % 2 == 0));

        // flatMap
        List<List<String>> nested = Arrays.asList(
                Arrays.asList("a", "b"),
                Arrays.asList("c", "d", "e")
        );

        List<String> flattened = nested.stream()
                .flatMap(Collection::stream)
                .collect(Collectors.toList());

        // Parallel streams
        long count = numbers.parallelStream()
                .filter(n -> isPrime(n))
                .count();

        System.out.println("Prime numbers count: " + count);
    }

    private static boolean isPrime(int n) {
        if (n <= 1) return false;
        return IntStream.rangeClosed(2, (int) Math.sqrt(n))
                .noneMatch(i -> n % i == 0);
    }
}

// Main application
public class Application {
    public static void main(String[] args) {
        UserRepository repository = new UserRepository();
        UserService service = new UserService(repository);

        try {
            // Create users asynchronously
            List<CompletableFuture<User>> futures = List.of(
                    service.createUserAsync("Alice", "alice@example.com", UserRole.ADMIN),
                    service.createUserAsync("Bob", "bob@example.com", UserRole.USER),
                    service.createUserAsync("Charlie", "charlie@example.com", UserRole.USER),
                    service.createUserAsync("Guest", "guest@example.com", UserRole.GUEST)
            );

            // Wait for all to complete
            CompletableFuture.allOf(futures.toArray(new CompletableFuture[0]))
                    .thenRun(() -> {
                        System.out.println("All users created");
                        
                        // Query users
                        List<User> activeUsers = service.getActiveUsers();
                        activeUsers.forEach(System.out::println);

                        // Group by role
                        Map<UserRole, List<User>> byRole = service.getUsersByRole();
                        byRole.forEach((role, users) -> {
                            System.out.println(role + ": " + users.size() + " users");
                        });
                    })
                    .join();

            // Demonstrate streams
            StreamExamples.demonstrateStreams();

        } finally {
            service.shutdown();
        }
    }
}
`;
