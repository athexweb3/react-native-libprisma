export const objcppCode = `/**
 * Modern Objective-C++ example with ARC, blocks, and C++ integration
 */

#import <Foundation/Foundation.h>
#import <UIKit/UIKit.h>
#include <memory>
#include <vector>
#include <map>
#include <functional>

// C++ class
class DataProcessor {
private:
    std::vector<int> data;
    std::map<std::string, std::function<void(int)>> callbacks;
    
public:
    DataProcessor() = default;
    
    void addData(int value) {
        data.push_back(value);
    }
    
    void registerCallback(const std::string& name, std::function<void(int)> callback) {
        callbacks[name] = callback;
    }
    
    void process() {
        for (int value : data) {
            for (auto& [name, callback] : callbacks) {
                callback(value);
            }
        }
    }
    
    std::vector<int> getData() const {
        return data;
    }
};

// Objective-C++ Protocol
@protocol DataSource <NSObject>
@required
- (NSArray<NSNumber *> *)loadData;
- (void)saveData:(NSArray<NSNumber *> *)data;

@optional
- (void)didUpdateData:(NSArray<NSNumber *> *)data;
@end

// Objective-C++ Class
@interface DataManager : NSObject

@property (nonatomic, strong) NSString *name;
@property (nonatomic, weak) id<DataSource> dataSource;
@property (nonatomic, copy) void (^completionHandler)(BOOL success, NSError *error);

- (instancetype)initWithName:(NSString *)name;
- (void)processDataWithCompletion:(void (^)(NSArray<NSNumber *> *result, NSError *error))completion;
- (void)asyncOperationWithProgress:(void (^)(CGFloat progress))progressBlock
                        completion:(void (^)(BOOL success))completionBlock;

@end

@implementation DataManager {
    std::unique_ptr<DataProcessor> _processor;
    dispatch_queue_t _processingQueue;
}

- (instancetype)initWithName:(NSString *)name {
    self = [super init];
    if (self) {
        _name = [name copy];
        _processor = std::make_unique<DataProcessor>();
        _processingQueue = dispatch_queue_create("com.example.datamanager", DISPATCH_QUEUE_CONCURRENT);
    }
    return self;
}

- (void)dealloc {
    NSLog(@"DataManager deallocated: %@", _name);
}

- (void)processDataWithCompletion:(void (^)(NSArray<NSNumber *> *result, NSError *error))completion {
    dispatch_async(_processingQueue, ^{
        @try {
            NSArray<NSNumber *> *sourceData = [self.dataSource loadData];
            
            // Convert NSArray to C++ vector
            for (NSNumber *num in sourceData) {
                self->_processor->addData([num intValue]);
            }
            
            // Register C++ callback
            self->_processor->registerCallback("log", [](int value) {
                NSLog(@"Processing value: %d", value);
            });
            
            // Process data
            self->_processor->process();
            
            // Convert back to NSArray
            std::vector<int> processed = self->_processor->getData();
            NSMutableArray<NSNumber *> *result = [NSMutableArray array];
            for (int value : processed) {
                [result addObject:@(value * 2)];
            }
            
            dispatch_async(dispatch_get_main_queue(), ^{
                if (completion) {
                    completion([result copy], nil);
                }
            });
        } @catch (NSException *exception) {
            dispatch_async(dispatch_get_main_queue(), ^{
                if (completion) {
                    NSError *error = [NSError errorWithDomain:@"DataManagerError"
                                                         code:1001
                                                     userInfo:@{
                        NSLocalizedDescriptionKey: exception.reason
                    }];
                    completion(nil, error);
                }
            });
        }
    });
}

- (void)asyncOperationWithProgress:(void (^)(CGFloat progress))progressBlock
                        completion:(void (^)(BOOL success))completionBlock {
    dispatch_async(_processingQueue, ^{
        for (int i = 0; i <= 100; i += 10) {
            [NSThread sleepForTimeInterval:0.1];
            
            dispatch_async(dispatch_get_main_queue(), ^{
                if (progressBlock) {
                    progressBlock(i / 100.0);
                }
            });
        }
        
        dispatch_async(dispatch_get_main_queue(), ^{
            if (completionBlock) {
                completionBlock(YES);
            }
        });
    });
}

@end

// UIKit Integration
@interface CustomView : UIView

@property (nonatomic, strong) UILabel *titleLabel;
@property (nonatomic, strong) UIButton *actionButton;
@property (nonatomic, copy) void (^actionHandler)(void);

- (void)setupUI;
- (void)animateWithDuration:(NSTimeInterval)duration
                 completion:(void (^)(BOOL finished))completion;

@end

@implementation CustomView

- (instancetype)initWithFrame:(CGRect)frame {
    self = [super initWithFrame:frame];
    if (self) {
        [self setupUI];
    }
    return self;
}

- (void)setupUI {
    self.backgroundColor = [UIColor systemBackgroundColor];
    
    // Title Label
    self.titleLabel = [[UILabel alloc] init];
    self.titleLabel.font = [UIFont systemFontOfSize:24 weight:UIFontWeightBold];
    self.titleLabel.textAlignment = NSTextAlignmentCenter;
    self.titleLabel.translatesAutoresizingMaskIntoConstraints = NO;
    [self addSubview:self.titleLabel];
    
    // Action Button
    self.actionButton = [UIButton buttonWithType:UIButtonTypeSystem];
    [self.actionButton setTitle:@"Action" forState:UIControlStateNormal];
    self.actionButton.translatesAutoresizingMaskIntoConstraints = NO;
    [self.actionButton addTarget:self
                          action:@selector(handleAction:)
                forControlEvents:UIControlEventTouchUpInside];
    [self addSubview:self.actionButton];
    
    // Constraints
    [NSLayoutConstraint activateConstraints:@[
        [self.titleLabel.centerXAnchor constraintEqualToAnchor:self.centerXAnchor],
        [self.titleLabel.centerYAnchor constraintEqualToAnchor:self.centerYAnchor constant:-50],
        [self.titleLabel.leadingAnchor constraintEqualToAnchor:self.leadingAnchor constant:20],
        [self.titleLabel.trailingAnchor constraintEqualToAnchor:self.trailingAnchor constant:-20],
        
        [self.actionButton.centerXAnchor constraintEqualToAnchor:self.centerXAnchor],
        [self.actionButton.topAnchor constraintEqualToAnchor:self.titleLabel.bottomAnchor constant:20],
    ]];
}

- (void)handleAction:(UIButton *)sender {
    [self animateWithDuration:0.3 completion:^(BOOL finished) {
        if (self.actionHandler) {
            self.actionHandler();
        }
    }];
}

- (void)animateWithDuration:(NSTimeInterval)duration
                 completion:(void (^)(BOOL finished))completion {
    [UIView animateWithDuration:duration
                          delay:0
         usingSpringWithDamping:0.7
          initialSpringVelocity:0.5
                        options:UIViewAnimationOptionCurveEaseInOut
                     animations:^{
        self.actionButton.transform = CGAffineTransformMakeScale(1.2, 1.2);
    } completion:^(BOOL finished) {
        [UIView animateWithDuration:duration animations:^{
            self.actionButton.transform = CGAffineTransformIdentity;
        } completion:completion];
    }];
}

@end

// Modern Objective-C features
@interface UserModel : NSObject

@property (nonatomic, copy, readonly) NSString *identifier;
@property (nonatomic, copy) NSString *name;
@property (nonatomic, strong) NSDate *createdAt;
@property (nonatomic, assign) NSInteger age;

+ (instancetype)modelWithName:(NSString *)name age:(NSInteger)age;
- (instancetype)initWithName:(NSString *)name age:(NSInteger)age NS_DESIGNATED_INITIALIZER;

@end

@implementation UserModel

+ (instancetype)modelWithName:(NSString *)name age:(NSInteger)age {
    return [[self alloc] initWithName:name age:age];
}

- (instancetype)initWithName:(NSString *)name age:(NSInteger)age {
    self = [super init];
    if (self) {
        _identifier = [[NSUUID UUID] UUIDString];
        _name = [name copy];
        _age = age;
        _createdAt = [NSDate date];
    }
    return self;
}

- (instancetype)init {
    return [self initWithName:@"" age:0];
}

- (NSString *)description {
    return [NSString stringWithFormat:@"<UserModel: %@, name=%@, age=%ld>",
            self.identifier, self.name, (long)self.age];
}

@end

// Collection operations
void demonstrateCollectionOperations() {
    NSArray<NSNumber *> *numbers = @[@1, @2, @3, @4, @5];
    
    // Map
    NSArray<NSNumber *> *squared = [numbers valueForKeyPath:@"@distinctUnionOfObjects.self"];
    
    // Filter
    NSPredicate *predicate = [NSPredicate predicateWithFormat:@"self > 2"];
    NSArray<NSNumber *> *filtered = [numbers filteredArrayUsingPredicate:predicate];
    
    // Reduce
    NSNumber *sum = [numbers valueForKeyPath:@"@sum.self"];
    
    NSLog(@"Squared: %@", squared);
    NSLog(@"Filtered: %@", filtered);
    NSLog(@"Sum: %@", sum);
}
`;
