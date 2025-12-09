export const scalaCode =
  `package com.example

import scala.concurrent.{Future, ExecutionContext}
import scala.util.{Try, Success, Failure}
import java.time.Instant

// ADT for User events
sealed trait UserEvent {
  def timestamp: Instant
}

case class UserCreated(user: User, timestamp: Instant) extends UserEvent
case class UserUpdated(user: User, timestamp: Instant) extends UserEvent
case class UserDeleted(userId: String, timestamp: Instant) extends UserEvent

// Case class for immutable User
case class User(
  id: String,
  name: String,
  email: String,
  roles: Set[String] = Set("user"),
  created: Instant = Instant.now()
) {
  def hasRole(role: String): Boolean = roles.contains(role)
  def isAdmin: Boolean = hasRole("admin")
  
  def withRole(role: String): User = copy(roles = roles + role)
  def withoutRole(role: String): User = copy(roles = roles - role)
}

// Generic repository trait
trait Repository[T] {
  def findById(id: String)(implicit ec: ExecutionContext): Future[Option[T]]
  def save(item: T)(implicit ec: ExecutionContext): Future[T]
  def delete(id: String)(implicit ec: ExecutionContext): Future[Boolean]
  def findAll()(implicit ec: ExecutionContext): Future[List[T]]
}

// User repository implementation
class UserRepository extends Repository[User] {
  private var users: Map[String, User] = Map.empty

  override def findById(id: String)(implicit ec: ExecutionContext): Future[Option[T]] =
    Future {
      Thread.sleep(10) // Simulate I/O
      users.get(id)
    }

  override def save(item: User)(implicit ec: ExecutionContext): Future[User] =
    Future {
      users = users + (item.id -> item)
      item
    }

  override def delete(id: String)(implicit ec: ExecutionContext): Future[Boolean] =
    Future {
      val existed = users.contains(id)
      users = users - id
      existed
    }

  override def findAll()(implicit ec: ExecutionContext): Future[List[User]] =
    Future(users.values.toList)

  def findByRole(role: String)(implicit ec: ExecutionContext): Future[List[User]] =
    findAll().map(_.filter(_.hasRole(role)))
}

// Service with effect handling
class UserService(repository: Repository[User])(implicit ec: ExecutionContext) {
  import scala.collection.mutable

  private val eventHandlers: mutable.Map[String, List[UserEvent => Unit]] = 
    mutable.Map.empty.withDefaultValue(List.empty)

  def on(event: String)(handler: UserEvent => Unit): Unit = {
    eventHandlers(event) = handler :: eventHandlers(event)
  }

  private def emit(event: UserEvent): Unit = {
    eventHandlers.foreach { case (_, handlers) =>
      handlers.foreach(handler => handler(event))
    }
  }

  def createUser(
    name: String,
    email: String,
    roles: Set[String] = Set("user")
  ): Future[User] = {
    val user = User(
      id = s"user-\${System.currentTimeMillis()}",
      name = name,
      email = email,
      roles = roles
    )

    repository.save(user).map { savedUser =>
      emit(UserCreated(savedUser, Instant.now()))
      savedUser
    }
  }

  def getAdminUsers(): Future[List[User]] =
    repository.findAll().map(_.filter(_.isAdmin))

  // Retry with exponential backoff
  def retryWithBackoff[T](
    operation: => Future[T],
    maxAttempts: Int = 3,
    delay: Long = 100
  ): Future[T] = {
    operation.recoverWith {
      case ex if maxAttempts > 1 =>
        Future {
          Thread.sleep(delay)
        }.flatMap(_ => retryWithBackoff(operation, maxAttempts - 1, delay * 2))
    }
  }
}

// Implicits and type classes
object UserImplicits {
  // Type class for JSON serialization
  trait JsonEncoder[T] {
    def encode(value: T): String
  }

  object JsonEncoder {
    def apply[T](implicit encoder: JsonEncoder[T]): JsonEncoder[T] = encoder

    implicit val userEncoder: JsonEncoder[User] = new JsonEncoder[User] {
      def encode(u: User): String = {
        s"""{"id":"` +
  `\${u.id}","name":"` +
  `\${u.name}","email":"` +
  `\${u.email}"}"""
      }
    }
  }

  // Extension methods using implicit class
  implicit class UserOps(u: User) {
    def toJson(implicit encoder: JsonEncoder[User]): String =
      encoder.encode(u)

    def status: String = u match {
      case User(_, _, _, roles, _) if roles.contains("admin") => "Administrator"
      case User(_, _, _, roles, _) if roles.size > 3 => "Power User"
      case User(_, _, _, roles, _) if roles.contains("moderator") => "Moderator"
      case _ => "Regular User"
    }
  }

  implicit class ListUserOps(users: List[User]) {
    def sortedByName: List[User] = users.sortBy(_.name)
    
    def groupByRole: Map[String, List[User]] =
      users.flatMap(user => user.roles.map(_ -> user))
           .groupBy(_._1)
           .view
           .mapValues(_.map(_._2))
           .toMap
  }
}

// Main application
object Main extends App {
  import scala.concurrent.ExecutionContext.Implicits.global
  import scala.concurrent.Await
  import scala.concurrent.duration._
  import UserImplicits._

  val repository = new UserRepository
  val service = new UserService(repository)

  // Event handler
  service.on("user") {
    case UserCreated(user, _) => println(s"User created: \${user.name}")
    case UserUpdated(user, _) => println(s"User updated: \${user.name}")
    case UserDeleted(userId, _) => println(s"User deleted: $userId")
  }

  // Create users concurrently
  val usersFuture = Future.sequence(List(
    service.createUser("Alice", "alice@example.com", Set("admin", "user")),
    service.createUser("Bob", "bob@example.com"),
    service.createUser("Charlie", "charlie@example.com", Set("user", "moderator"))
  ))

  val users = Await.result(usersFuture, 5.seconds)
  println(s"Created \${users.length} users")

  // Get admin users
  val adminsFuture = service.getAdminUsers()
  val admins = Await.result(adminsFuture, 5.seconds)
  println(s"Admin users: \${admins.map(_.name).mkString(", ")}")

  // Use extension methods
  users.sortedByName.foreach(user => println(s"\${user.name}: \${user.status}"))

  // JSON encoding
  users.foreach(user => println(user.toJson))
}
`;
