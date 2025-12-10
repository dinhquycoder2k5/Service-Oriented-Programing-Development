package com.oder.order_service.service;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.Date;
import java.util.List;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import com.oder.order_service.client.CustomerClient;
import com.oder.order_service.client.RestaurantClient;
import com.oder.order_service.client.DeliveryClient; // 1. Import DeliveryClient
import com.oder.order_service.dto.OrderItemRequest;
import com.oder.order_service.dto.OrderItemResponse;
import com.oder.order_service.dto.OrderRequest;
import com.oder.order_service.dto.OrderResponse;
import com.oder.order_service.dto.external.DishResponse;
import com.oder.order_service.model.Order;
import com.oder.order_service.model.OrderItem;
import com.oder.order_service.model.OrderStatus;
import com.oder.order_service.repository.OrderRepository;

import feign.FeignException;
import lombok.Data;

@Data
@Service
public class OrderService {

    @Autowired
    private OrderRepository orderRepository;

    @Autowired
    private CustomerClient customerClient;

    @Autowired
    private RestaurantClient restaurantClient;

    @Autowired
    private DeliveryClient deliveryClient; // 2. Tiêm DeliveryClient vào đây

    @Transactional
    public OrderResponse createOrder(OrderRequest request) {
        // Basic validation
        if (request == null || request.getItems() == null || request.getItems().isEmpty()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Order must contain at least one item");
        }
        if (request.getUserId() == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "userId is required");
        }
        if (request.getRestaurantId() == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "restaurantId is required");
        }

        // Optional: validate customer exists (convert feign exceptions to 4xx/5xx)
        try {
            customerClient.getCustomerByUserId(request.getUserId());
        } catch (FeignException e) {
            if (e.status() == 404) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Customer not found");
            } else {
                throw new ResponseStatusException(HttpStatus.SERVICE_UNAVAILABLE, "Customer service unavailable");
            }
        } catch (Exception ex) {
            throw new ResponseStatusException(HttpStatus.SERVICE_UNAVAILABLE, "Customer service error: " + ex.getMessage());
        }

        // Tạo order
        Order order = new Order();
        order.setCustomerId(request.getUserId());
        order.setRestaurantId(request.getRestaurantId());
        order.setDeliveryAddress(request.getDeliveryAddress() == null ? "" : request.getDeliveryAddress());
        order.setStatus(OrderStatus.PENDING);
        order.setCreatedAt(new Date());

        List<OrderItem> orderItems = new ArrayList<>();
        BigDecimal totalAmount = BigDecimal.ZERO;

        for (OrderItemRequest itemRequest : request.getItems()) {
            if (itemRequest.getQuantity() == null || itemRequest.getQuantity() <= 0) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Quantity must be > 0 for dishId: " + itemRequest.getDishId());
            }
            // Gọi restaurant service để lấy thông tin món
            DishResponse dish;
            try {
                dish = restaurantClient.getDishById(itemRequest.getDishId());
            } catch (FeignException e) {
                if (e.status() == 404) {
                    throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Dish not found: " + itemRequest.getDishId());
                } else {
                    throw new ResponseStatusException(HttpStatus.SERVICE_UNAVAILABLE, "Restaurant service unavailable");
                }
            } catch (Exception ex) {
                throw new ResponseStatusException(HttpStatus.SERVICE_UNAVAILABLE, "Restaurant service error: " + ex.getMessage());
            }

            if (dish == null || dish.getPrice() == null) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Invalid dish data for id: " + itemRequest.getDishId());
            }
            // Build OrderItem
            OrderItem orderItem = new OrderItem();
            orderItem.setOrder(order); // quan trọng để JPA cascade save
            orderItem.setDishId(dish.getId());
            orderItem.setDishName(dish.getName());
            orderItem.setUnitPrice(dish.getPrice());
            orderItem.setQuantity(itemRequest.getQuantity());

            BigDecimal sub = dish.getPrice().multiply(BigDecimal.valueOf(itemRequest.getQuantity()));
            totalAmount = totalAmount.add(sub);
            orderItems.add(orderItem);
        }

        order.setTotalAmount(totalAmount);
        order.setItems(orderItems);

        Order saved = orderRepository.save(order);
        return mapToOrderResponse(saved);
    }
        
    // --- LẤY TẤT CẢ (Cho Admin) ---
    public List<OrderResponse> getAllOrders() {
        return orderRepository.findAll().stream()
                .map(this::mapToOrderResponse)
                .collect(Collectors.toList());
    }

    // --- LẤY THEO USER (Cho Frontend History) ---
    public List<OrderResponse> getOrdersByUserId(Long userId) {
        return orderRepository.findByCustomerId(userId).stream()
                .map(this::mapToOrderResponse)
                .collect(Collectors.toList());
    }

// --- 3. HÀM CẬP NHẬT TRẠNG THÁI (Đã thêm bảo mật) ---
    public OrderResponse updateOrderStatus(Long orderId, OrderStatus newStatus) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new RuntimeException("Order not found"));
        
        // 🔥 BẢO MẬT: CHẶN DUYỆT NẾU CHƯA THANH TOÁN
        // Nếu định chuyển sang CONFIRMED (Duyệt) mà trạng thái cũ vẫn là PENDING (Chưa trả tiền)
        if (newStatus == OrderStatus.CONFIRMED && order.getStatus() == OrderStatus.PENDING) {
            throw new RuntimeException("❌ Lỗi: Đơn hàng chưa thanh toán, không thể duyệt!");
        }

        // Cập nhật trạng thái
        order.setStatus(newStatus);
        Order savedOrder = orderRepository.save(order);

        // LOGIC GỌI DELIVERY (Giữ nguyên của bạn)
        if (newStatus == OrderStatus.DELIVERING || newStatus == OrderStatus.CONFIRMED) {
            try {
                System.out.println(">>> 🚚 Admin đã duyệt đơn #" + orderId + ". Đang gọi Delivery Service...");
                deliveryClient.createDeliveryTask(String.valueOf(savedOrder.getId()));
                System.out.println(">>> ✅ Đã chuyển đơn sang Delivery thành công!");
            } catch (Exception e) {
                System.err.println(">>> ❌ Lỗi gọi Delivery Service: " + e.getMessage());
            }
        }

        return mapToOrderResponse(savedOrder);
    }
    public OrderResponse getOrderById(Long orderId) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new RuntimeException("Order not found"));
        return mapToOrderResponse(order);
    }

    private OrderResponse mapToOrderResponse(Order order) {
        OrderResponse response = new OrderResponse();
        response.setId(order.getId());
        response.setUserId(order.getCustomerId());
        response.setRestaurantId(order.getRestaurantId());
        response.setTotalAmount(order.getTotalAmount());
        response.setStatus(order.getStatus());
        response.setDeliveryAddress(order.getDeliveryAddress());
        response.setCreatedAt(order.getCreatedAt());

        List<OrderItemResponse> itemResponses = order.getItems().stream().map(item -> {
            OrderItemResponse ir = new OrderItemResponse();
            ir.setDishId(item.getDishId());
            ir.setDishName(item.getDishName());
            ir.setUnitPrice(item.getUnitPrice());
            ir.setQuantity(item.getQuantity());
            ir.setSubTotal(item.getUnitPrice().multiply(BigDecimal.valueOf(item.getQuantity())));
            return ir;
        }).collect(Collectors.toList());

        response.setItems(itemResponses);
        return response;
    }
}