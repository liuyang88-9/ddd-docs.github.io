# 电子商务系统中应用 DDD

本案例研究探讨了如何在电子商务系统中应用领域驱动设计 (DDD) 原则，从问题分析到架构设计，再到代码实现。

## 业务背景

某在线零售公司正面临以下挑战：

- 系统复杂度随业务增长而失控
- 不同部门使用的系统无法有效协作
- 新功能开发周期长且容易引入缺陷
- 系统难以适应业务变化和市场需求

管理层决定采用领域驱动设计方法重构系统，以提高业务适应性和开发效率。

## 战略设计阶段

### 领域探索

团队与各个部门的领域专家进行了一系列事件风暴工作坊，绘制了主要业务流程：

1. 顾客浏览商品并下单
2. 支付处理和订单确认
3. 库存检查和调整
4. 订单履行和物流管理
5. 退款和退货处理

### 识别限界上下文

根据业务活动和组织结构，识别出以下限界上下文：

- **产品目录上下文**：产品信息、分类、搜索和推荐
- **订单上下文**：订单管理、状态跟踪和处理
- **客户上下文**：用户账户、个人资料和偏好
- **支付上下文**：交易处理、退款和支付方式管理
- **库存上下文**：库存管理、仓库分配和库存预测
- **配送上下文**：物流、运输和配送跟踪

### 上下文映射

绘制上下文映射图，确定各上下文间的关系：

```
                  +---------------+
                  | 客户上下文(C) |
                  +-------+-------+
                          |
                  ACL     |     OHS/ACL
                          v
+---------------+   +---------------+   +---------------+
| 产品目录上下文| <-| 订单上下文(U) |-> | 支付上下文(D) |
+---------------+   +-------+-------+   +---------------+
                          |
                 +--------+---------+
                 |                  |
                 v                  v
      +---------------+    +---------------+
      | 库存上下文(D) |    | 配送上下文(D) |
      +---------------+    +---------------+

图例：
(U) - 上游系统
(D) - 下游系统
(C) - 符合者关系
ACL - 防腐层
OHS - 开放主机服务
```

## 战术设计阶段

### 订单上下文深入分析

作为示例，我们详细分析订单上下文的战术设计：

#### 识别聚合

- **订单聚合**：以Order为聚合根，包含订单项、配送地址等
- **购物车聚合**：以Cart为聚合根，包含购物车项和优惠券

#### 实体与值对象

实体：

- Order(订单)
- OrderItem(订单项)
- Cart(购物车)
- CartItem(购物车项)

值对象：

- Money(金额)
- Address(地址)
- OrderStatus(订单状态)
- Discount(折扣)

#### 领域事件

- OrderCreated(订单创建)
- OrderConfirmed(订单确认)
- OrderCancelled(订单取消)
- OrderShipped(订单发货)

#### 仓储接口

- OrderRepository
- CartRepository

### 使用通用语言

建立通用语言词汇表，确保所有团队成员和领域专家使用统一术语：

| 术语  | 定义                    |
|-----|-----------------------|
| 订单  | 客户确认购买的商品集合，包含支付和配送信息 |
| 购物车 | 客户暂存待购买商品的临时容器        |
| SKU | 库存单位，用于唯一标识可销售的特定商品   |
| 配送  | 将订单商品从仓库送达客户指定地址的过程   |

## 技术实现

### 架构选择

采用六边形架构（端口与适配器），将领域模型与技术实现细节分离：

```
+-----------------------------------------------------+
|                   用户界面层                          |
| +------------------------+  +---------------------+ |
| |      Web 适配器        |  |   移动应用适配器     | |
| +------------------------+  +---------------------+ |
+-----------------------------------------------------+
                     |
+-----------------------------------------------------+
|                   应用服务层                         |
| +------------------------+  +---------------------+ |
| |     订单应用服务       |  |   购物车应用服务    | |
| +------------------------+  +---------------------+ |
+-----------------------------------------------------+
                     |
+-----------------------------------------------------+
|                   领域层                            |
| +------------------------+  +---------------------+ |
| |      聚合/实体         |  |   领域服务          | |
| +------------------------+  +---------------------+ |
| +------------------------+  +---------------------+ |
| |      值对象           |  |   领域事件          | |
| +------------------------+  +---------------------+ |
+-----------------------------------------------------+
                     |
+-----------------------------------------------------+
|                   基础设施层                         |
| +------------------------+  +---------------------+ |
| |     持久化适配器       |  |   消息队列适配器    | |
| +------------------------+  +---------------------+ |
| +------------------------+  +---------------------+ |
| |     外部服务适配器     |  |   缓存适配器        | |
| +------------------------+  +---------------------+ |
+-----------------------------------------------------+
```

### 代码实现示例

#### 订单聚合根

```java
public class Order {
    private OrderId id;
    private CustomerId customerId;
    private List<OrderItem> items;
    private Money totalAmount;
    private Address shippingAddress;
    private OrderStatus status;
    private PaymentDetails paymentDetails;
    
    // 构造函数
    private Order(OrderId id, CustomerId customerId, Address shippingAddress) {
        this.id = id;
        this.customerId = customerId;
        this.shippingAddress = shippingAddress;
        this.items = new ArrayList<>();
        this.status = OrderStatus.CREATED;
        this.totalAmount = Money.ZERO;
    }
    
    // 工厂方法
    public static Order create(OrderId id, CustomerId customerId, Address shippingAddress) {
        Order order = new Order(id, customerId, shippingAddress);
        DomainEventPublisher.publish(new OrderCreated(id));
        return order;
    }
    
    // 业务行为
    public void addItem(ProductId productId, int quantity, Money unitPrice) {
        validateOrderIsEditable();
        
        // 检查是否已有该商品
        Optional<OrderItem> existingItem = findItemByProductId(productId);
        
        if (existingItem.isPresent()) {
            existingItem.get().increaseQuantity(quantity);
        } else {
            OrderItem newItem = new OrderItem(OrderItemId.generate(), productId, quantity, unitPrice);
            items.add(newItem);
        }
        
        recalculateTotal();
    }
    
    public void confirm() {
        validateCanBeConfirmed();
        status = OrderStatus.CONFIRMED;
        DomainEventPublisher.publish(new OrderConfirmed(id));
    }
    
    public void pay(PaymentDetails paymentDetails) {
        if (status != OrderStatus.CONFIRMED) {
            throw new IllegalStateException("Only confirmed orders can be paid");
        }
        
        this.paymentDetails = paymentDetails;
        status = OrderStatus.PAID;
        DomainEventPublisher.publish(new OrderPaid(id));
    }
    
    public void ship() {
        if (status != OrderStatus.PAID) {
            throw new IllegalStateException("Only paid orders can be shipped");
        }
        
        status = OrderStatus.SHIPPED;
        DomainEventPublisher.publish(new OrderShipped(id));
    }
    
    public void cancel(String reason) {
        if (status == OrderStatus.SHIPPED || status == OrderStatus.DELIVERED) {
            throw new IllegalStateException("Cannot cancel an order that has been shipped or delivered");
        }
        
        status = OrderStatus.CANCELLED;
        DomainEventPublisher.publish(new OrderCancelled(id, reason));
    }
    
    // 私有辅助方法
    private void validateOrderIsEditable() {
        if (status != OrderStatus.CREATED) {
            throw new IllegalStateException("Order can only be modified when in CREATED state");
        }
    }
    
    private void validateCanBeConfirmed() {
        if (status != OrderStatus.CREATED) {
            throw new IllegalStateException("Only created orders can be confirmed");
        }
        
        if (items.isEmpty()) {
            throw new IllegalStateException("Cannot confirm order with no items");
        }
    }
    
    private Optional<OrderItem> findItemByProductId(ProductId productId) {
        return items.stream()
            .filter(item -> item.getProductId().equals(productId))
            .findFirst();
    }
    
    private void recalculateTotal() {
        totalAmount = items.stream()
            .map(OrderItem::getSubtotal)
            .reduce(Money.ZERO, Money::add);
    }
    
    // Getter方法
    public OrderId getId() {
        return id;
    }
    
    public OrderStatus getStatus() {
        return status;
    }
    
    public Money getTotalAmount() {
        return totalAmount;
    }
    
    public List<OrderItem> getItems() {
        // 返回不可变列表，保护内部状态
        return Collections.unmodifiableList(items);
    }
    
    // 其他 getter 方法...
}
```

#### 领域事件

```java
public class OrderConfirmed implements DomainEvent {
    private final OrderId orderId;
    private final Instant occurredAt;
    
    public OrderConfirmed(OrderId orderId) {
        this.orderId = orderId;
        this.occurredAt = Instant.now();
    }
    
    public OrderId getOrderId() {
        return orderId;
    }
    
    public Instant getOccurredAt() {
        return occurredAt;
    }
}
```

#### 仓储接口

```java
public interface OrderRepository {
    void save(Order order);
    Optional<Order> findById(OrderId id);
    List<Order> findByCustomerId(CustomerId customerId);
    List<Order> findByStatus(OrderStatus status);
}
```

## 防腐层示例

订单上下文与支付上下文之间的防腐层：

```java
public class PaymentServiceAdapter implements PaymentService {
    private final ExternalPaymentService externalPaymentService;
    
    public PaymentServiceAdapter(ExternalPaymentService externalPaymentService) {
        this.externalPaymentService = externalPaymentService;
    }
    
    @Override
    public PaymentResult processPayment(OrderId orderId, Money amount, PaymentMethod paymentMethod) {
        // 转换为外部服务所需的数据格式
        String externalOrderId = orderId.getValue();
        BigDecimal externalAmount = amount.getAmount();
        String currency = amount.getCurrency().getCode();
        String externalPaymentMethod = convertPaymentMethod(paymentMethod);
        
        // 调用外部服务
        ExternalPaymentResult externalResult = externalPaymentService.processPayment(
            externalOrderId, 
            externalAmount, 
            currency, 
            externalPaymentMethod
        );
        
        // 将外部结果转换回领域模型格式
        return convertToDomainResult(externalResult);
    }
    
    private String convertPaymentMethod(PaymentMethod paymentMethod) {
        // 将领域支付方式转换为外部系统格式
        switch (paymentMethod) {
            case CREDIT_CARD: return "CARD";
            case PAYPAL: return "PP";
            case BANK_TRANSFER: return "BANK";
            default: throw new IllegalArgumentException("Unsupported payment method: " + paymentMethod);
        }
    }
    
    private PaymentResult convertToDomainResult(ExternalPaymentResult externalResult) {
        // 将外部结果转换为领域模型形式
        PaymentStatus status;
        switch (externalResult.getStatus()) {
            case "SUCCESS": status = PaymentStatus.COMPLETED; break;
            case "PENDING": status = PaymentStatus.PENDING; break;
            case "FAILED": status = PaymentStatus.FAILED; break;
            default: status = PaymentStatus.UNKNOWN;
        }
        
        return new PaymentResult(
            new PaymentId(externalResult.getTransactionId()),
            status,
            externalResult.getMessage()
        );
    }
}
```

## 从事件风暴到代码的映射

展示如何将事件风暴中的用户故事转化为实际代码：

**用户故事**：顾客将商品添加到购物车，提交订单并支付

**事件风暴**：

1. 顾客将商品添加到购物车
2. 顾客结算购物车
3. 系统创建订单
4. 顾客选择支付方式并付款
5. 系统确认支付并更新订单状态

**代码实现**：

```java
// 应用服务
public class OrderApplicationService {
    private final OrderRepository orderRepository;
    private final CartRepository cartRepository;
    private final PaymentService paymentService;
    
    // 构造函数注入依赖...
    
    @Transactional
    public OrderId createOrderFromCart(CustomerId customerId, CartId cartId, Address shippingAddress) {
        // 1. 获取购物车
        Cart cart = cartRepository.findById(cartId)
            .orElseThrow(() -> new EntityNotFoundException("Cart not found: " + cartId));
        
        // 2. 验证购物车属于该客户
        cart.validateBelongsToCustomer(customerId);
        
        // 3. 创建订单
        OrderId orderId = OrderId.generate();
        Order order = Order.create(orderId, customerId, shippingAddress);
        
        // 4. 将购物车商品转为订单项
        for (CartItem cartItem : cart.getItems()) {
            order.addItem(
                cartItem.getProductId(),
                cartItem.getQuantity(),
                cartItem.getUnitPrice()
            );
        }
        
        // 5. 确认订单
        order.confirm();
        
        // 6. 持久化订单
        orderRepository.save(order);
        
        // 7. 清空购物车
        cart.clear();
        cartRepository.save(cart);
        
        return orderId;
    }
    
    @Transactional
    public void processPayment(OrderId orderId, PaymentDetails paymentDetails) {
        // 1. 获取订单
        Order order = orderRepository.findById(orderId)
            .orElseThrow(() -> new EntityNotFoundException("Order not found: " + orderId));
        
        // 2. 处理支付
        PaymentResult result = paymentService.processPayment(
            orderId, 
            order.getTotalAmount(), 
            paymentDetails.getPaymentMethod()
        );
        
        // 3. 更新订单支付状态
        if (result.getStatus() == PaymentStatus.COMPLETED) {
            order.pay(paymentDetails);
            orderRepository.save(order);
        } else {
            throw new PaymentFailedException("Payment failed: " + result.getMessage());
        }
    }
}
```

## 微服务架构映射

电子商务系统的DDD限界上下文自然地映射到微服务架构：

```
+----------------+     +----------------+     +----------------+
|   产品目录微服务  | <-> |    订单微服务   | <-> |   支付微服务   |
+----------------+     +----------------+     +----------------+
                             ^   ^
                             |   |
                  +----------+   +-----------+
                  |                          |
        +----------------+           +----------------+
        |   库存微服务   |           |   配送微服务   |
        +----------------+           +----------------+
```

## 项目收益

应用DDD后，项目取得了以下成果：

1. **业务适应性提高**：基于领域模型的设计，使系统能够更快地响应业务变化
2. **开发效率提升**：清晰的上下文边界和责任划分，使并行开发更高效
3. **代码质量改善**：丰富的领域模型捕获了业务规则，减少了错误
4. **团队沟通改进**：通用语言的建立，减少了误解和沟通成本
5. **系统可扩展性增强**：良好设计的边界和接口，使系统扩展更容易

## 经验教训

项目实施过程中的关键经验：

1. **持续精炼模型**：初始模型往往不完美，需要通过持续反馈和迭代来完善
2. **权衡复杂度**：过度应用DDD可能引入不必要的复杂性，对简单部分可采用简化方法
3. **领域专家参与**：没有领域专家参与的DDD项目难以成功
4. **技术与领域平衡**：技术关注点不应掩盖领域建模的重要性
5. **组织因素考虑**：DDD不仅是技术决策，还涉及团队组织和沟通方式

## 总结

本案例研究展示了如何在电子商务系统中应用DDD原则，从战略设计识别限界上下文，到战术设计实现聚合、实体和值对象。通过建立通用语言、应用适当的架构模式和防腐层，实现了一个灵活、可维护的系统。

DDD的应用帮助团队更好地理解和捕获业务领域知识，创建了一个真正反映业务现实的软件系统，而不仅仅是数据处理系统。 