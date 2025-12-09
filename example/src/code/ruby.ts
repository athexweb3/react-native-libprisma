export const rubyCode = `# frozen_string_literal: true

require 'json'
require 'logger'
require 'date'

# User model with value object pattern
class User
  attr_reader :id, :name, :email, :roles, :created
  
  def initialize(id:, name:, email:, roles: ['user'], created: Time.now)
    @id = id
    @name = name
    @email = email
    @roles = roles.freeze
    @created = created
    
    validate!
    freeze
  end
  
  def has_role?(role)
    @roles.include?(role)
  end
  
  def admin?
    has_role?('admin')
  end
  
  def with_role(role)
    User.new(
      id: @id,
      name: @name,
      email: @email,
      roles: @roles + [role],
      created: @created
    )
  end
  
  def to_h
    {
      id: @id,
      name: @name,
      email: @email,
      roles: @roles,
      created: @created.iso8601
    }
  end
  
  def to_json(*args)
    to_h.to_json(*args)
  end
  
  private
  
  def validate!
    raise ArgumentError, 'Name cannot be empty' if @name.nil? || @name.empty?
    raise ArgumentError, 'Invalid email' unless @email.match?(/\\A[^@]+@[^@]+\\.\\w+\\z/)
  end
end

# Generic repository module
module Repository
  def find_by_id(id)
    raise NotImplementedError
  end
  
  def save(item)
    raise NotImplementedError
  end
  
  def delete(id)
    raise NotImplementedError
  end
  
  def find_all
    raise NotImplementedError
  end
end

# Thread-safe repository implementation
class UserRepository
  include Repository
  
  def initialize(logger: Logger.new($stdout))
    @users = {}
    @mutex = Mutex.new
    @logger = logger
  end
  
  def find_by_id(id)
    @mutex.synchronize do
      sleep 0.01 # Simulate I/O
      @users[id]
    end
  end
  
  def save(user)
    @mutex.synchronize do
      @users[user.id] = user
      @logger.info "Saved user: #{user.name}"
      user
    end
  end
  
  def delete(id)
    @mutex.synchronize do
      @users.delete(id) ? true : false
    end
  end
  
  def find_all
    @mutex.synchronize do
      @users.values
    end
  end
  
  def find_by_role(role)
    find_all.lazy.select { |user| user.has_role?(role) }
  end
  
  def find_by_email(email)
    find_all.find { |user| user.email == email }
  end
end

# Event system with observer pattern
class EventEmitter
  def initialize
    @handlers = Hash.new { |h, k| h[k] = [] }
  end
  
  def on(event, &block)
    @handlers[event] << block
  end
  
  def emit(event, *args)
    @handlers[event].each { |handler| handler.call(*args) }
  end
end

# Service layer with dependency injection
class UserService
  attr_reader :events
  
  def initialize(repository:, logger: Logger.new($stdout))
    @repository = repository
    @logger = logger
    @events = EventEmitter.new
  end
  
  def create_user(name:, email:, roles: ['user'])
    user = User.new(
      id: "user-#{Time.now.to_i}-#{rand(1000)}",
      name: name,
      email: email,
      roles: roles
    )
    
    @repository.save(user)
    @events.emit(:user_created, user)
    
    user
  rescue ArgumentError => e
    @logger.error "Failed to create user: #{e.message}"
    raise
  end
  
  def get_admin_users
    @repository.find_all.select(&:admin?)
  end
  
  def update_user(id:, **attrs)
    user = @repository.find_by_id(id)
    return nil unless user
    
    updated = User.new(
      id: user.id,
      name: attrs[:name] || user.name,
      email: attrs[:email] || user.email,
      roles: attrs[:roles] || user.roles,
      created: user.created
    )
    
    @repository.save(updated)
    @events.emit(:user_updated, updated)
    
    updated
  end
  
  # Retry with exponential backoff
  def with_retry(max_attempts: 3, base_delay: 0.5)
    attempt = 0
    begin
      yield
    rescue => e
      attempt += 1
      raise if attempt >= max_attempts
      
      delay = base_delay * (2 ** (attempt - 1))
      @logger.warn "Attempt #{attempt} failed: #{e.message}. Retrying in #{delay}s..."
      sleep delay
      retry
    end
  end
end

# Mixin for status determination
module UserStatus
  def status
    case
    when admin?
      'Administrator'
    when roles.length > 3
      'Power User'
    when has_role?('moderator')
      'Moderator'
    else
      'Regular User'
    end
  end
end

# Extend User class with mixin
User.include(UserStatus)

# DSL builder pattern
class UserBuilder
  def initialize
    @name = ''
    @email = ''
    @roles = ['user']
  end
  
  def name(value)
    @name = value
    self
  end
  
  def email(value)
    @email = value
    self
  end
  
  def role(value)
    @roles << value unless @roles.include?(value)
    self
  end
  
  def build
    User.new(
      id: "user-#{Time.now.to_i}",
      name: @name,
      email: @email,
      roles: @roles
    )
  end
end

def user(&block)
  builder = UserBuilder.new
  builder.instance_eval(&block) if block_given?
  builder.build
end

# Concurrent execution helper
def concurrent_map(items, &block)
  threads = items.map do |item|
    Thread.new { block.call(item) }
  end
  
  threads.map(&:value)
end

# Main execution
def main
  repository = UserRepository.new
  service = UserService.new(repository: repository)
  
  # Event handler
  service.events.on(:user_created) do |user|
    puts "User created: #{user.name}"
  end
  
  # Create users using DSL
  alice = user do
    name 'Alice'
    email 'alice@example.com'
    role 'admin'
  end
  
  # Create users concurrently
  names = %w[Bob Charlie David]
  users = concurrent_map(names) do |name|
    service.create_user(
      name: name,
      email: "#{name.downcase}@example.com"
    )
  end
  
  # Get admin users
  admins = service.get_admin_users
  puts "Admin users: #{admins.map(&:name).join(', ')}"
  
  # Use lazy enumeration
  service.repository.find_by_role('admin').each do |admin|
    puts "Found admin: #{admin.name} (#{admin.status})"
  end
  
  # Retry example
  service.with_retry(max_attempts: 3) do
    user = repository.find_by_id('user-123')
    raise 'User not found' unless user
    user
  end
rescue => e
  puts "Error: #{e.message}"
end

# Run if executed directly
main if __FILE__ == $PROGRAM_NAME
`;
