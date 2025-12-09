export const swiftCode = `/// Modern Swift 5.9+ with async/await, Concurrency, and SwiftUI
import Foundation
import SwiftUI
import Combine

// Protocol-oriented programming
protocol Identifiable {
    var id: UUID { get }
}

protocol Repository {
    associatedtype T: Identifiable
    func findById(_ id: UUID) async throws -> T?
    func findAll() async throws -> [T]
    func save(_ entity: T) async throws -> T
    func delete(_ id: UUID) async throws
}

// Structures with protocols
struct User: Identifiable, Codable, Hashable {
    let id: UUID
    var name: String
    var email: String
    var role: UserRole
    let createdAt: Date
    
    init(name: String, email: String, role: UserRole = .user) {
        self.id = UUID()
        self.name = name
        self.email = email
        self.role = role
        self.createdAt = Date()
    }
}

enum UserRole: String, Codable, CaseIterable {
    case admin
    case user
    case guest
    
    var permissions: [Permission] {
        switch self {
        case .admin: return [.read, .write, .delete]
        case .user: return [.read, .write]
        case .guest: return [.read]
        }
    }
}

enum Permission: String {
    case read, write, delete
}

// Actor for thread-safe operations
actor UserRepository: Repository {
    typealias T = User
    
    private var storage: [UUID: User] = [:]
    private let lock = NSLock()
    
    func findById(_ id: UUID) async throws -> User? {
        storage[id]
    }
    
    func findAll() async throws -> [User] {
        Array(storage.values)
    }
    
    func save(_ user: User) async throws -> User {
        storage[user.id] = user
        return user
    }
    
    func delete(_ id: UUID) async throws {
        storage.removeValue(forKey: id)
    }
    
    // Custom query methods
    func findByRole(_ role: UserRole) async throws -> [User] {
        storage.values.filter { $0.role == role }
    }
    
    func findByEmail(_ email: String) async throws -> User? {
        storage.values.first { $0.email == email }
    }
}

// Service layer
@MainActor
class UserService: ObservableObject {
    @Published var users: [User] = []
    @Published var isLoading = false
    @Published var error: Error?
    
    private let repository = UserRepository()
    
    func loadUsers() async {
        isLoading = true
        defer { isLoading = false }
        
        do {
            users = try await repository.findAll()
        } catch {
            self.error = error
        }
    }
    
    func createUser(name: String, email: String, role: UserRole) async throws -> User {
        let user = User(name: name, email: email, role: role)
        let saved = try await repository.save(user)
        await loadUsers()
        return saved
    }
    
    func deleteUser(_ id: UUID) async throws {
        try await repository.delete(id)
        await loadUsers()
    }
}

// SwiftUI View with Combine
struct UserListView: View {
    @StateObject private var service = UserService()
    @State private var showingAddUser = false
    @State private var searchText = ""
    
    var filteredUsers: [User] {
        if searchText.isEmpty {
            return service.users
        }
        return service.users.filter { user in
            user.name.localizedCaseInsensitiveContains(searchText) ||
            user.email.localizedCaseInsensitiveContains(searchText)
        }
    }
    
    var body: some View {
        NavigationStack {
            List {
                ForEach(filteredUsers) { user in
                    UserRowView(user: user)
                        .swipeActions(edge: .trailing) {
                            Button(role: .destructive) {
                                Task {
                                    try? await service.deleteUser(user.id)
                                }
                            } label: {
                                Label("Delete", systemImage: "trash")
                            }
                        }
                }
            }
            .searchable(text: $searchText, prompt: "Search users")
            .navigationTitle("Users")
            .toolbar {
                ToolbarItem(placement: .primaryAction) {
                    Button {
                        showingAddUser = true
                    } label: {
                        Label("Add User", systemImage: "plus")
                    }
                }
            }
            .sheet(isPresented: $showingAddUser) {
                AddUserView(service: service)
            }
            .task {
                await service.loadUsers()
            }
            .refreshable {
                await service.loadUsers()
            }
            .overlay {
                if service.isLoading {
                    ProgressView()
                }
            }
        }
    }
}

struct UserRowView: View {
    let user: User
    
    var body: some View {
        VStack(alignment: .leading, spacing: 8) {
            HStack {
                Text(user.name)
                    .font(.headline)
                
                Spacer()
                
                Badge(role: user.role)
            }
            
            Text(user.email)
                .font(.subheadline)
                .foregroundStyle(.secondary)
            
            Text("Created: \\(user.createdAt, style: .relative)")
                .font(.caption)
                .foregroundStyle(.tertiary)
        }
        .padding(.vertical, 4)
    }
}

struct Badge: View {
    let role: UserRole
    
    var color: Color {
        switch role {
        case .admin: return .red
        case .user: return .blue
        case .guest: return .gray
        }
    }
    
    var body: some View {
        Text(role.rawValue.capitalized)
            .font(.caption.weight(.semibold))
            .foregroundStyle(.white)
            .padding(.horizontal, 8)
            .padding(.vertical, 4)
            .background(color, in: Capsule())
    }
}

// Generics and Extensions
extension Collection {
    func chunked(into size: Int) -> [[Element]] {
        stride(from: 0, to: count, by: size).map {
            Array(self[index(startIndex, offsetBy: $0) ..< Swift.min(index(startIndex, offsetBy: $0 + size), endIndex)])
        }
    }
}

extension Sequence {
    func asyncMap<T>(
        _ transform: @escaping (Element) async throws -> T
    ) async rethrows -> [T] {
        var values = [T]()
        for element in self {
            try await values.append(transform(element))
        }
        return values
    }
}

// Result builders
@resultBuilder
enum ViewArrayBuilder {
    static func buildBlock<C: View>(_ components: C...) -> [C] {
        components
    }
    
    static func buildEither<T, F>(first component: T) -> _ConditionalContent<T, F> {
        .first(component)
    }
    
    static func buildEither<T, F>(second component: F) -> _ConditionalContent<T, F> {
        .second(component)
    }
}

// Async/await networking
enum NetworkError: Error {
    case invalidURL
    case invalidResponse
    case serverError(Int)
}

class APIClient {
    let baseURL: URL
    private let session: URLSession
    
    init(baseURL: URL, configuration: URLSessionConfiguration = .default) {
        self.baseURL = baseURL
        self.session = URLSession(configuration: configuration)
    }
    
    func fetch<T: Decodable>(endpoint: String) async throws -> T {
        guard let url = URL(string: endpoint, relativeTo: baseURL) else {
            throw NetworkError.invalidURL
        }
        
        let (data, response) = try await session.data(from: url)
        
        guard let httpResponse = response as? HTTPURLResponse else {
            throw NetworkError.invalidResponse
        }
        
        guard (200...299).contains(httpResponse.statusCode) else {
            throw NetworkError.serverError(httpResponse.statusCode)
        }
        
        let decoder = JSONDecoder()
        decoder.keyDecodingStrategy = .convertFromSnakeCase
        return try decoder.decode(T.self, from: data)
    }
    
    func post<T: Encodable, R: Decodable>(endpoint: String, body: T) async throws -> R {
        guard let url = URL(string: endpoint, relativeTo: baseURL) else {
            throw NetworkError.invalidURL
        }
        
        var request = URLRequest(url: url)
        request.httpMethod = "POST"
        request.setValue("application/json", forHTTPHeaderField: "Content-Type")
        
        let encoder = JSONEncoder()
        encoder.keyEncodingStrategy = .convertToSnakeCase
        request.httpBody = try encoder.encode(body)
        
        let (data, response) = try await session.data(for: request)
        
        guard let httpResponse = response as? HTTPURLResponse else {
            throw NetworkError.invalidResponse
        }
        
        guard (200...299).contains(httpResponse.statusCode) else {
            throw NetworkError.serverError(httpResponse.statusCode)
        }
        
        let decoder = JSONDecoder()
        decoder.keyDecodingStrategy = .convertFromSnakeCase
        return try decoder.decode(R.self, from: data)
    }
}

// Task groups for concurrency
func fetchMultipleUsers(ids: [UUID]) async throws -> [User] {
    try await withThrowingTaskGroup(of: User?.self) { group in
        for id in ids {
            group.addTask {
                // Simulate API call
                try? await Task.sleep(nanoseconds: UInt64(Double.random(in: 0.1...0.5) * 1_000_000_000))
                return User(name: "User \\(id)", email: "user@example.com")
            }
        }
        
        var users: [User] = []
        for try await user in group {
            if let user = user {
                users.append(user)
            }
        }
        return users
    }
}
`;
