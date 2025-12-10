package com.restaurent.restaurent_service.controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.restaurent.restaurent_service.dto.DishRequest;
import com.restaurent.restaurent_service.dto.DishResponse;
import com.restaurent.restaurent_service.dto.RestaurantRequest;
import com.restaurent.restaurent_service.dto.RestaurantResponse;
import com.restaurent.restaurent_service.service.RestaurantService;

@RestController
@RequestMapping("/api/v1/restaurants")
public class RestaurantController {

    @Autowired
    private RestaurantService restaurantService;

    // --- NHÀ HÀNG ---

    // Tạo nhà hàng (Chỉ được tạo 1 lần)
    @PostMapping
    public ResponseEntity<?> createRestaurant(@RequestBody RestaurantRequest request) {
        try {
            return new ResponseEntity<>(restaurantService.createRestaurant(request), HttpStatus.CREATED);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage()); // Trả về lỗi nếu đã có nhà hàng
        }
    }

    // Lấy danh sách tất cả (Cho admin xem)
    @GetMapping
    public ResponseEntity<List<RestaurantResponse>> getAllRestaurants() {
        return ResponseEntity.ok(restaurantService.getAllRestaurants());
    }

    // Xem chi tiết nhà hàng
    @GetMapping("/{id}")
    public ResponseEntity<RestaurantResponse> getRestaurant(@PathVariable Long id) {
        return ResponseEntity.ok(restaurantService.getRestaurantById(id));
    }
    
    // API cho Owner xem nhà hàng của mình
    @GetMapping("/owner/{ownerId}")
    public ResponseEntity<RestaurantResponse> getMyRestaurant(@PathVariable Long ownerId) {
        return ResponseEntity.ok(restaurantService.getRestaurantByOwnerId(ownerId));
    }
    
    // Cập nhật thông tin nhà hàng
    @PutMapping("/{id}")
    public ResponseEntity<RestaurantResponse> updateRestaurant(@PathVariable Long id, @RequestBody RestaurantRequest request) {
        return ResponseEntity.ok(restaurantService.updateRestaurantInfo(id, request));
    }

    // --- MÓN ĂN (MENU CRUD) ---

    // Thêm món ăn
    @PostMapping("/{restaurantId}/dishes")
    public ResponseEntity<DishResponse> addDish(@PathVariable Long restaurantId, @RequestBody DishRequest request) {
        return new ResponseEntity<>(restaurantService.createDish(restaurantId, request), HttpStatus.CREATED);
    }
    
    // [MỚI] Cập nhật món ăn (Sửa giá, tên, tình trạng còn hàng...)
    // /api/v1/restaurants/dishes/{dishId}
    @PutMapping("/dishes/{dishId}")
    public ResponseEntity<DishResponse> updateDish(@PathVariable Long dishId, @RequestBody DishRequest request) {
        return ResponseEntity.ok(restaurantService.updateDish(dishId, request));
    }
    
    // [MỚI] Xóa món ăn
    @DeleteMapping("/dishes/{dishId}")
    public ResponseEntity<Void> deleteDish(@PathVariable Long dishId) {
        restaurantService.deleteDish(dishId);
        return ResponseEntity.noContent().build();
    }

    // Lấy menu của nhà hàng
    @GetMapping("/{restaurantId}/menu")
    public ResponseEntity<List<DishResponse>> getMenu(@PathVariable Long restaurantId) {
        return ResponseEntity.ok(restaurantService.getMenuByRestaurantId(restaurantId));
    }

    // Endpoint nội bộ cho Order Service
    @GetMapping("/dishes/{dishId}")
    public ResponseEntity<DishResponse> getDishDetails(@PathVariable Long dishId) {
        return ResponseEntity.ok(restaurantService.getDishById(dishId));
    }
}