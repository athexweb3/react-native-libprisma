export const dartCode = `/// Advanced Dart application with modern features
import 'dart:async';
import 'dart:collection';

/// Generic repository interface
abstract class Repository<T> {
  Future<T?> findById(String id);
  Future<T> save(T item);
  Future<bool> delete(String id);
  Future<List<T>> findAll();
}

/// User model with freezed-style immutability
class User {
  final String id;
  final String name;
  final String email;
  final Set<String> roles;
  final DateTime created;

  const User({
    required this.id,
    required this.name,
    required this.email,
    required this.roles,
    required this.created,
  });

  bool hasRole(String role) => roles.contains(role);
  bool get isAdmin => hasRole('admin');

  User copyWith({
    String? id,
    String? name,
    String? email,
    Set<String>? roles,
    DateTime? created,
  }) {
    return User(
      id: id ?? this.id,
      name: name ?? this.name,
      email: email ?? this.email,
      roles: roles ?? this.roles,
      created: created ?? this.created,
    );
  }

  Map<String, dynamic> toJson() => {
    'id': id,
    'name': name,
    'email': email,
    'roles': roles.toList(),
    'created': created.toIso8601String(),
  };

  factory User.fromJson(Map<String, dynamic> json) => User(
    id: json['id'] as String,
    name: json['name'] as String,
    email: json['email'] as String,
    roles: Set.from(json['roles'] as List),
    created: DateTime.parse(json['created'] as String),
  );
}

/// User repository implementation
class UserRepository implements Repository<User> {
  final Map<String, User> _users = {};

  @override
  Future<User?> findById(String id) async {
    await Future.delayed(const Duration(milliseconds: 10));
    return _users[id];
  }

  @override
  Future<User> save(User item) async {
    _users[item.id] = item;
    return item;
  }

  @override
  Future<bool> delete(String id) async {
    return _users.remove(id) != null;
  }

  @override
  Future<List<User>> findAll() async {
    return _users.values.toList();
  }

  Stream<User> findByRoleStream(String role) async* {
    final users = await findAll();
    for (final user in users) {
      if (user.hasRole(role)) {
        await Future.delayed(const Duration(milliseconds: 1));
        yield user;
      }
    }
  }
}

/// Event types
sealed class UserEvent {
  final DateTime timestamp;
  const UserEvent(this.timestamp);
}

class UserCreated extends UserEvent {
  final User user;
  const UserCreated(this.user, DateTime timestamp) : super(timestamp);
}

class UserUpdated extends UserEvent {
  final User user;
  const UserUpdated(this.user, DateTime timestamp) : super(timestamp);
}

class UserDeleted extends UserEvent {
  final String userId;
  const UserDeleted(this.userId, DateTime timestamp) : super(timestamp);
}

/// Service with streams
class UserService {
  final Repository<User> repository;
  final StreamController<UserEvent> _eventController = 
      StreamController<UserEvent>.broadcast();

  Stream<UserEvent> get events => _eventController.stream;

  UserService(this.repository);

  Future<User> createUser({
    required String name,
    required String email,
    Set<String>? roles,
  }) async {
    final user = User(
      id: 'user-\${DateTime.now().millisecondsSinceEpoch}',
      name: name,
      email: email,
      roles: roles ?? {'user'},
      created: DateTime.now(),
    );

    await repository.save(user);
    _eventController.add(UserCreated(user, DateTime.now()));

    return user;
  }

  Future<List<User>> getAdminUsers() async {
    final users = await repository.findAll();
    return users.where((user) => user.isAdmin).toList();
  }

  /// Retry with exponential backoff
  Future<T> retryWithBackoff<T>(
    Future<T> Function() operation, {
    int maxAttempts = 3,
    Duration initialDelay = const Duration(milliseconds: 100),
    double factor = 2.0,
  }) async {
    var currentDelay = initialDelay;
    for (var i = 0; i < maxAttempts; i++) {
      try {
        return await operation();
      } catch (e) {
        if (i == maxAttempts - 1) rethrow;
        await Future.delayed(currentDelay);
        currentDelay *= factor;
      }
    }
    throw Exception('Should never reach here');
  }

  void dispose() {
    _eventController.close();
  }
}

/// Extension methods
extension UserListExtensions on List<User> {
  List<User> sortedByName() {
    return this..sort((a, b) => a.name.compareTo(b.name));
  }

  Map<String, List<User>> groupByRole() {
    final result = <String, List<User>>{};
    for (final user in this) {
      for (final role in user.roles) {
        result.putIfAbsent(role, () => []).add(user);
      }
    }
    return result;
  }
}

/// Main function
void main() async {
  final repository = UserRepository();
  final service = UserService(repository);

  // Listen to events
  service.events.listen((event) {
    switch (event) {
      case UserCreated(:final user):
        print('User created: \${user.name}');
      case UserUpdated(:final user):
        print('User updated: \${user.name}');
      case UserDeleted(:final userId):
        print('User deleted: \$userId');
    }
  });

  // Create users concurrently
  final users = await Future.wait([
    service.createUser(
      name: 'Alice',
      email: 'alice@example.com',
      roles: {'admin', 'user'},
    ),
    service.createUser(
      name: 'Bob',
      email: 'bob@example.com',
    ),
    service.createUser(
      name: 'Charlie',
      email: 'charlie@example.com',
      roles: {'user', 'moderator'},
    ),
  ]);

  print('Created \${users.length} users');

  // Get admin users
  final admins = await service.getAdminUsers();
  print('Admin users: \${admins.map((u) => u.name).join(', ')}');

  // Use stream
  await for (final admin in repository.findByRoleStream('admin')) {
    print('Found admin: \${admin.name}');
  }

  // Cleanup
  service.dispose();
}
`;
