# 实体 (Entities)

在领域驱动设计 (DDD) 的战术设计中，实体是最基础且核心的概念之一。理解和正确实现实体对于构建领域模型至关重要。

## 什么是实体

实体是领域模型中具有唯一标识的对象，不管其属性如何变化，它的身份始终保持不变。实体代表了领域中具有连续性和身份的事物，即便其状态随时间变化，我们仍能通过其标识追踪它。

### 实体的关键特征

1. **唯一标识**：每个实体都有一个唯一的标识符，可能是自然键或人工键
2. **生命周期**：实体通常有较长的生命周期，随时间演变
3. **可变性**：实体的属性可以改变，但其身份不变
4. **行为**：除了属性外，实体通常还封装了业务规则和行为

## 实体与值对象的区别

实体和值对象是DDD中两种最基本的模型元素，它们的区别在于：

| 特性   | 实体        | 值对象        |
|------|-----------|------------|
| 身份   | 有唯一标识     | 无唯一标识      |
| 可变性  | 通常可变      | 不可变        |
| 相等比较 | 基于标识      | 基于所有属性     |
| 生命周期 | 通常有独立生命周期 | 通常属于实体或聚合  |
| 示例   | 用户、订单、产品  | 地址、金额、日期范围 |

## 实体的设计原则

### 1. 身份优先

- 首先确定实体的唯一标识方式
- 可以使用自然键（业务属性）或人工键（如UUID或自增ID）
- 标识应该在实体的整个生命周期内保持稳定

### 2. 行为丰富

- 实体不应该是简单的数据容器
- 将相关的业务规则和行为封装在实体内部
- 减少实体的"贫血"，使其成为领域逻辑的载体

### 3. 保持内聚

- 实体应该只包含与其概念密切相关的属性和行为
- 避免将不相关的逻辑混入实体
- 考虑将复杂行为提取到领域服务中

### 4. 状态一致性

- 实体应该保持其内部状态的一致性
- 提供方法强制执行业务规则
- 确保状态变更操作不会违反业务约束

## 实体的实现技术

在代码中实现实体时，可以考虑以下技术和模式：

### 基本结构

```java
public class Order {
    private OrderId id;
    private CustomerId customerId;
    private List<OrderItem> items;
    private Money totalAmount;
    private OrderStatus status;
    
    // 构造函数确保必要属性
    public Order(OrderId id, CustomerId customerId) {
        this.id = id;
        this.customerId = customerId;
        this.items = new ArrayList<>();
        this.totalAmount = Money.ZERO;
        this.status = OrderStatus.CREATED;
    }
    
    // 业务行为方法
    public void addItem(Product product, int quantity) {
        // 业务规则验证
        if (status != OrderStatus.CREATED) {
            throw new IllegalStateException("Cannot add items to order in status: " + status);
        }
        
        OrderItem item = new OrderItem(product.getId(), quantity, product.getPrice());
        items.add(item);
        recalculateTotal();
    }
    
    // 更多业务方法
    public void confirm() {
        if (items.isEmpty()) {
            throw new IllegalStateException("Cannot confirm order with no items");
        }
        
        status = OrderStatus.CONFIRMED;
    }
    
    // 私有辅助方法
    private void recalculateTotal() {
        totalAmount = items.stream()
            .map(item -> item.getPrice().multiply(item.getQuantity()))
            .reduce(Money.ZERO, Money::add);
    }
    
    // 谨慎的getter方法
    public OrderId getId() {
        return id;
    }
    
    // 其他getter方法...
}
```

### 标识实现

实体标识可以有多种实现方式：

```java
// 使用值对象作为标识
public class OrderId {
    private final String value;
    
    public OrderId(String value) {
        if (value == null || value.trim().isEmpty()) {
            throw new IllegalArgumentException("OrderId cannot be empty");
        }
        this.value = value;
    }
    
    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        OrderId orderId = (OrderId) o;
        return value.equals(orderId.value);
    }
    
    @Override
    public int hashCode() {
        return value.hashCode();
    }
    
    @Override
    public String toString() {
        return value;
    }
}
```

### 相等性比较

实体的相等性比较应基于标识，而非属性：

```java
@Override
public boolean equals(Object o) {
    if (this == o) return true;
    if (o == null || getClass() != o.getClass()) return false;
    Order order = (Order) o;
    return id.equals(order.id);
}

@Override
public int hashCode() {
    return id.hashCode();
}
```

## 实体的生命周期管理

实体通常具有复杂的生命周期，需要在领域模型中妥善管理：

### 1. 创建

- 使用构造函数或工厂方法构建实体
- 确保实体创建时处于有效的初始状态
- 强制执行创建时的业务规则

### 2. 持久化和重建

- 通过仓储保存和获取实体
- 使用数据映射器在数据存储和领域模型之间转换
- 保持持久化细节与领域逻辑的分离

### 3. 引用和关系

- 考虑使用标识引用而非直接对象引用
- 管理实体之间的关系，考虑聚合边界
- 注意引用完整性和一致性约束

## 实体设计中的常见陷阱

### 1. 贫血模型

实体只包含数据属性和getter/setter方法，而没有业务行为。这违背了DDD的核心原则。

### 2. 过度使用实体

并非所有概念都应该是实体。考虑是否可以使用值对象或领域事件来表示某些概念。

### 3. 标识选择不当

选择不适当的标识（例如不稳定或不唯一的属性）会导致系统行为问题。

### 4. 忽略不变性约束

即使实体是可变的，某些规则和关系可能需要保持不变。

### 5. 过度暴露内部状态

无限制地提供状态修改方法会破坏实体的完整性和一致性。

## 实体设计实例

### 用户实体示例

```java
public class User {
    private UserId id;
    private String username;
    private Email email;
    private PasswordHash passwordHash;
    private Set<Role> roles;
    private boolean active;
    
    // 构造函数和业务方法
    
    public void changeEmail(Email newEmail, EmailVerificationService verificationService) {
        // 业务规则
        if (!active) {
            throw new IllegalStateException("Inactive user cannot change email");
        }
        
        // 发送验证邮件等逻辑
        verificationService.initiateEmailChange(this.id, newEmail);
        
        // 记录变更事件
        DomainEventPublisher.publish(new UserEmailChangeInitiated(this.id, newEmail));
    }
    
    public void assignRole(Role role) {
        if (role == Role.ADMIN && !this.roles.contains(Role.MODERATOR)) {
            throw new IllegalStateException("User must be a moderator before becoming admin");
        }
        
        this.roles.add(role);
    }
    
    // 更多业务方法...
}
```

## 总结

实体是DDD中的核心构建块，正确识别和实现它们对于构建表达力强、符合业务需求的领域模型至关重要。实体不仅仅是数据容器，更是业务逻辑和规则的载体，通过唯一标识维持其身份，通过丰富的行为表达领域知识。 