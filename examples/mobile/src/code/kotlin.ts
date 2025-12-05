export const kotlinCode = `package com.example.app

import kotlinx.coroutines.*
import kotlinx.coroutines.flow.*
import kotlin.time.Duration
import kotlin.time.Duration.Companion.seconds

// Sealed class for result type
sealed class Result<out T> {
    data class Success<T>(val data: T) : Result<T>()
    data class Error(val exception: Exception) : Result<Nothing>()
    object Loading : Result<Nothing>()
}

// Data class with default values and validation
data class User(
    val id: String,
    val name: String,
    val email: String,
    val roles: Set<String> = setOf("user"),
    val metadata: Map<String, Any> = emptyMap()
) {
    init {
        require(name.isNotBlank()) { "Name cannot be blank" }
        require(email.contains("@")) { "Invalid email format" }
    }
    
    fun hasRole(role: String): Boolean = role in roles
    
    val isAdmin: Boolean
        get() = hasRole("admin")
    
    // Extension function
    fun withRole(role: String): User = copy(roles = roles + role)
}

// Generic repository interface
interface Repository<T> {
    suspend fun findById(id: String): T?
    suspend fun save(item: T): T
    suspend fun delete(id: String): Boolean
    suspend fun findAll(): List<T>
}

// Coroutine-based repository implementation
class UserRepository : Repository<User> {
    private val users = mutableMapOf<String, User>()
    private val mutex = kotlinx.coroutines.sync.Mutex()
    
    override suspend fun findById(id: String): User? = mutex.withLock {
        delay(10) // Simulate I/O
        users[id]
    }
    
    override suspend fun save(item: User): User = mutex.withLock {
        users[item.id] = item
        item
    }
    
    override suspend fun delete(id: String): Boolean = mutex.withLock {
        users.remove(id) != null
    }
    
    override suspend fun findAll(): List<User> = mutex.withLock {
        users.values.toList()
    }
    
    fun findByRoleFlow(role: String): Flow<User> = flow {
        val allUsers = findAll()
        allUsers.filter { it.hasRole(role) }.forEach { emit(it) }
    }
}

// Service layer with Flow
class UserService(private val repository: UserRepository) {
    private val _events = MutableSharedFlow<UserEvent>(replay = 0)
    val events: SharedFlow<UserEvent> = _events.asSharedFlow()
    
    suspend fun createUser(
        name: String,
        email: String,
        roles: Set<String> = setOf("user")
    ): Result<User> = try {
        val user = User(
            id = "user-\${System.currentTimeMillis()}",
            name = name,
            email = email,
            roles = roles
        )
        
        repository.save(user)
        _events.emit(UserEvent.Created(user))
        
        Result.Success(user)
    } catch (e: Exception) {
        Result.Error(e)
    }
    
    suspend fun getAdminUsers(): Flow<User> = flow {
        repository.findAll()
            .filter { it.isAdmin }
            .forEach { emit(it) }
    }
    
    // Retry logic with exponential backoff
    suspend fun <T> retryWithBackoff(
        times: Int = 3,
        initialDelay: Duration = 1.seconds,
        factor: Double = 2.0,
        block: suspend () -> T
    ): T {
        var currentDelay = initialDelay
        repeat(times - 1) {
            try {
                return block()
            } catch (e: Exception) {
                delay(currentDelay)
                currentDelay = (currentDelay * factor)
            }
        }
        return block() // last attempt
    }
}

// Event sealed class
sealed class UserEvent {
    data class Created(val user: User) : UserEvent()
    data class Updated(val user: User) : UserEvent()
    data class Deleted(val userId: String) : UserEvent()
}

// Extension functions
fun <T> Flow<T>.throttleFirst(windowDuration: Duration): Flow<T> = flow {
    var lastEmissionTime = 0L
    collect { value ->
        val currentTime = System.currentTimeMillis()
        if (currentTime - lastEmissionTime >= windowDuration.inWholeMilliseconds) {
            lastEmissionTime = currentTime
            emit(value)
        }
    }
}

// Delegated properties
class LazyCache<K, V>(private val loader: suspend (K) -> V) {
    private val cache = mutableMapOf<K, V>()
    private val mutex = kotlinx.coroutines.sync.Mutex()
    
    suspend operator fun get(key: K): V = mutex.withLock {
        cache.getOrPut(key) { loader(key) }
    }
}

// DSL builder
class UserBuilder {
    var name: String = ""
    var email: String = ""
    val roles: MutableSet<String> = mutableSetOf("user")
    
    fun role(role: String) {
        roles.add(role)
    }
    
    fun build(): User = User(
        id = "user-\${System.nanoTime()}",
        name = name,
        email = email,
        roles = roles
    )
}

fun user(init: UserBuilder.() -> Unit): User {
    val builder = UserBuilder()
    builder.init()
    return builder.build()
}

// Main application
suspend fun main() = coroutineScope {
    val repository = UserRepository()
    val service = UserService(repository)
    
    // Launch event listener
    launch {
        service.events.collect { event ->
            when (event) {
                is UserEvent.Created -> println("User created: \${event.user.name}")
                is UserEvent.Updated -> println("User updated: \${event.user.name}")
                is UserEvent.Deleted -> println("User deleted: \${event.userId}")
            }
        }
    }
    
    // Create users using DSL
    val alice = user {
        name = "Alice"
        email = "alice@example.com"
        role("admin")
        role("user")
    }
    
    // Create users concurrently
    val users = listOf("Bob", "Charlie", "David").map { name ->
        async {
            service.createUser(
                name = name,
                email = "\${name.lowercase()}@example.com"
            )
        }
    }.awaitAll()
    
    // Use Flow to get admin users
    service.getAdminUsers()
        .throttleFirst(100.seconds)
        .collect { user ->
            println("Admin user: \${user.name}")
        }
    
    // Retry example
    val result = service.retryWithBackoff(times = 3) {
        repository.findById("user-123")
            ?: throw Exception("User not found")
    }
    
    println("Operation complete with \${users.size} users created")
}
`;
