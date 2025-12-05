export const cppCode = `#include <iostream>
#include <vector>
#include <string>
#include <memory>
#include <algorithm>
#include <ranges>
#include <concepts>
#include <format>

// Concepts (C++20)
template<typename T>
concept Numeric = std::is_arithmetic_v<T>;

template<typename T>
concept Hashable = requires(T a) {
    { std::hash<T>{}(a) } -> std::convertible_to<std::size_t>;
};

// Template class with concepts
template<Numeric T>
class Matrix {
private:
    std::vector<std::vector<T>> data;
    size_t rows, cols;

public:
    Matrix(size_t r, size_t c) : rows(r), cols(c) {
        data.resize(rows, std::vector<T>(cols, T{}));
    }

    // Move semantics
    Matrix(Matrix&& other) noexcept 
        : data(std::move(other.data))
        , rows(other.rows)
        , cols(other.cols) {}

    Matrix& operator=(Matrix&& other) noexcept {
        if (this != &other) {
            data = std::move(other.data);
            rows = other.rows;
            cols = other.cols;
        }
        return *this;
    }

    // Operator overloading
    T& operator()(size_t i, size_t j) {
        return data[i][j];
    }

    const T& operator()(size_t i, size_t j) const {
        return data[i][j];
    }

    // Matrix multiplication
    Matrix operator*(const Matrix& other) const {
        if (cols != other.rows) {
            throw std::invalid_argument("Invalid matrix dimensions");
        }

        Matrix result(rows, other.cols);
        for (size_t i = 0; i < rows; ++i) {
            for (size_t j = 0; j < other.cols; ++j) {
                T sum = T{};
                for (size_t k = 0; k < cols; ++k) {
                    sum += data[i][k] * other.data[k][j];
                }
                result(i, j) = sum;
            }
        }
        return result;
    }

    // Ranges (C++20)
    auto getRow(size_t i) const {
        return data[i] | std::views::all;
    }

    void print() const {
        for (const auto& row : data) {
            for (const auto& elem : row) {
                std::cout << std::format("{:8.2f} ", elem);
            }
            std::cout << '\\n';
        }
    }
};

// Smart pointers and RAII
class Resource {
private:
    std::unique_ptr<int[]> buffer;
    size_t size;

public:
    explicit Resource(size_t n) : buffer(std::make_unique<int[]>(n)), size(n) {
        std::cout << "Resource acquired\\n";
    }

    ~Resource() {
        std::cout << "Resource released\\n";
    }

    // Delete copy, allow move
    Resource(const Resource&) = delete;
    Resource& operator=(const Resource&) = delete;
    Resource(Resource&&) = default;
    Resource& operator=(Resource&&) = default;

    int& operator[](size_t i) { return buffer[i]; }
    const int& operator[](size_t i) const { return buffer[i]; }
};

// Variadic templates
template<typename... Args>
void print(Args&&... args) {
    (std::cout << ... << args) << '\\n';
}

template<typename T, typename... Args>
std::unique_ptr<T> make_unique_helper(Args&&... args) {
    return std::make_unique<T>(std::forward<Args>(args)...);
}

// Lambda expressions and captures
auto makeLambda() {
    int x = 42;
    return [x, y = x * 2](int z) mutable {
        x += z;
        return x + y;
    };
}

// Coroutines (C++20)
#include <coroutine>

template<typename T>
struct Generator {
    struct promise_type {
        T current_value;

        auto get_return_object() {
            return Generator{std::coroutine_handle<promise_type>::from_promise(*this)};
        }
        
        auto initial_suspend() { return std::suspend_always{}; }
        auto final_suspend() noexcept { return std::suspend_always{}; }
        
        void unhandled_exception() { std::terminate(); }
        
        auto yield_value(T value) {
            current_value = value;
            return std::suspend_always{};
        }
        
        void return_void() {}
    };

    std::coroutine_handle<promise_type> coro;

    Generator(std::coroutine_handle<promise_type> h) : coro(h) {}
    ~Generator() { if (coro) coro.destroy(); }

    bool next() {
        coro.resume();
        return !coro.done();
    }

    T value() { return coro.promise().current_value; }
};

Generator<int> fibonacci() {
    int a = 0, b = 1;
    while (true) {
        co_yield a;
        auto next = a + b;
        a = b;
        b = next;
    }
}

// Main function with modern C++ features
int main() {
    // Structured bindings (C++17)
    auto [x, y, z] = std::make_tuple(1, 2.0, "three");
    
    // Range-based for with ranges
    std::vector<int> vec{1, 2, 3, 4, 5};
    auto even = vec | std::views::filter([](int n) { return n % 2 == 0; })
                    | std::views::transform([](int n) { return n * n; });

    for (int val : even) {
        std::cout << val << ' ';
    }
    std::cout << '\\n';

    // Smart pointers
    auto resource = std::make_unique<Resource>(100);
    (*resource)[0] = 42;

    // Matrix operations
    Matrix<double> m1(3, 3);
    Matrix<double> m2(3, 3);
    
    // Initialize matrices
    for (size_t i = 0; i < 3; ++i) {
        for (size_t j = 0; j < 3; ++j) {
            m1(i, j) = i * 3 + j;
            m2(i, j) = (i + j) * 0.5;
        }
    }

    auto m3 = m1 * m2;
    m3.print();

    // Coroutine usage
    auto fib = fibonacci();
    for (int i = 0; i < 10; ++i) {
        if (fib.next()) {
            std::cout << fib.value() << ' ';
        }
    }

    return 0;
}
`;
