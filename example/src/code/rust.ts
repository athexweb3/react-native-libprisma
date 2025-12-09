export const rustCode = `/// Advanced Rust example with ownership, lifetimes, and async/await
use std::collections::HashMap;
use std::sync::{Arc, Mutex};
use tokio::sync::RwLock;
use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct User {
    pub id: u64,
    pub name: String,
    pub email: String,
    pub role: UserRole,
}

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
pub enum UserRole {
    Admin,
    User,
    Guest,
}

// Trait definition
pub trait Repository<T> {
    fn find_by_id(&self, id: u64) -> Option<&T>;
    fn insert(&mut self, item: T) -> Result<(), String>;
    fn delete(&mut self, id: u64) -> bool;
}

// Generic struct with lifetime parameters
pub struct Cache<'a, T> {
    data: HashMap<u64, T>,
    ttl: std::time::Duration,
    name: &'a str,
}

impl<'a, T: Clone> Cache<'a, T> {
    pub fn new(name: &'a str, ttl: std::time::Duration) -> Self {
        Cache {
            data: HashMap::new(),
            ttl,
            name,
        }
    }

    pub fn get(&self, key: &u64) -> Option<&T> {
        self.data.get(key)
    }

    pub fn set(&mut self, key: u64, value: T) {
        self.data.insert(key, value);
    }

    pub fn clear(&mut self) {
        self.data.clear();
        println!("Cache '{}' cleared", self.name);
    }
}

// Implementation of Repository trait
impl Repository<User> for Cache<'_, User> {
    fn find_by_id(&self, id: u64) -> Option<&User> {
        self.data.get(&id)
    }

    fn insert(&mut self, user: User) -> Result<(), String> {
        if self.data.contains_key(&user.id) {
            return Err(format!("User with id {} already exists", user.id));
        }
        self.data.insert(user.id, user);
        Ok(())
    }

    fn delete(&mut self, id: u64) -> bool {
        self.data.remove(&id).is_some()
    }
}

// Async function with error handling
pub async fn fetch_user(id: u64) -> Result<User, Box<dyn std::error::Error>> {
    let url = format!("https://api.example.com/users/{}", id);
    let response = reqwest::get(&url).await?;
    let user: User = response.json().await?;
    Ok(user)
}

// Thread-safe data structure
pub struct ThreadSafeCache<T> {
    data: Arc<RwLock<HashMap<u64, T>>>,
}

impl<T: Clone> ThreadSafeCache<T> {
    pub fn new() -> Self {
        ThreadSafeCache {
            data: Arc::new(RwLock::new(HashMap::new())),
        }
    }

    pub async fn get(&self, key: u64) -> Option<T> {
        let data = self.data.read().await;
        data.get(&key).cloned()
    }

    pub async fn set(&self, key: u64, value: T) {
        let mut data = self.data.write().await;
        data.insert(key, value);
    }
}

// Pattern matching and Result handling
pub fn process_user(user: &User) -> Result<String, String> {
    match user.role {
        UserRole::Admin => {
            println!("Processing admin user: {}", user.name);
            Ok(format!("Admin: {}", user.name))
        }
        UserRole::User => {
            println!("Processing regular user: {}", user.name);
            Ok(format!("User: {}", user.name))
        }
        UserRole::Guest => {
            Err("Cannot process guest users".to_string())
        }
    }
}

// Macro definition
macro_rules! create_user {
    ($id:expr, $name:expr, $email:expr) => {
        User {
            id: $id,
            name: $name.to_string(),
            email: $email.to_string(),
            role: UserRole::User,
        }
    };
    ($id:expr, $name:expr, $email:expr, admin) => {
        User {
            id: $id,
            name: $name.to_string(),
            email: $email.to_string(),
            role: UserRole::Admin,
        }
    };
}

// Iterator and closures
pub fn fibonacci() -> impl Iterator<Item = u64> {
    let mut a = 0u64;
    let mut b = 1u64;
    
    std::iter::from_fn(move || {
        let next = a;
        let sum = a.checked_add(b)?;
        a = b;
        b = sum;
        Some(next)
    })
}

// Higher-order functions
pub fn apply<F>(f: F, x: i32) -> i32
where
    F: Fn(i32) -> i32,
{
    f(x)
}

// Async main with tokio
#[tokio::main]
async fn main() -> Result<(), Box<dyn std::error::Error>> {
    // Using the macro
    let user1 = create_user!(1, "Alice", "alice@example.com");
    let user2 = create_user!(2, "Bob", "bob@example.com", admin);

    // Vector operations
    let numbers: Vec<i32> = (1..=10).collect();
    let squared: Vec<i32> = numbers
        .iter()
        .map(|&x| x * x)
        .filter(|&x| x > 25)
        .collect();

    println!("Squared and filtered: {:?}", squared);

    // Option and Result chaining
    let result = fibonacci()
        .take(10)
        .filter(|&x| x % 2 == 0)
        .map(|x| x * 2)
        .collect::<Vec<_>>();

    println!("Fibonacci result: {:?}", result);

    // Thread-safe cache usage
    let cache = ThreadSafeCache::new();
    cache.set(1, user1.clone()).await;

    if let Some(user) = cache.get(1).await {
        match process_user(&user) {
            Ok(msg) => println!("{}", msg),
            Err(e) => eprintln!("Error: {}", e),
        }
    }

    // Spawning async tasks
    let handles: Vec<_> = (1..=5)
        .map(|i| {
            tokio::spawn(async move {
                tokio::time::sleep(tokio::time::Duration::from_millis(100 * i)).await;
                println!("Task {} completed", i);
                i * i
            })
        })
        .collect();

    // Await all tasks
    for handle in handles {
        let result = handle.await?;
        println!("Result: {}", result);
    }

    Ok(())
}

// Tests
#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_cache() {
        let mut cache = Cache::new("test", std::time::Duration::from_secs(60));
        let user = create_user!(1, "Test", "test@example.com");
        
        assert!(cache.insert(user.clone()).is_ok());
        assert_eq!(cache.find_by_id(1), Some(&user));
        assert!(cache.delete(1));
        assert_eq!(cache.find_by_id(1), None);
    }

    #[tokio::test]
    async fn test_thread_safe_cache() {
        let cache = ThreadSafeCache::new();
        cache.set(1, "value".to_string()).await;
        assert_eq!(cache.get(1).await, Some("value".to_string()));
    }
}
`;
