package com.restaurent.restaurent_service.service;

import com.restaurent.restaurent_service.dto.*;
import com.restaurent.restaurent_service.exception.ResourceNotFoundException;
import com.restaurent.restaurent_service.model.Dish;
import com.restaurent.restaurent_service.model.Restaurant;
import com.restaurent.restaurent_service.model.RestaurantStatus;
import com.restaurent.restaurent_service.repository.DishRepository;
import com.restaurent.restaurent_service.repository.RestaurantRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class RestaurantService {

    @Autowired
    private RestaurantRepository restaurantRepository;

    @Autowired
    private DishRepository dishRepository;

    // --- 1. QUẢN LÝ NHÀ HÀNG ---
    public RestaurantResponse createRestaurant(RestaurantRequest request) {
        // [LOGIC MỚI] Kiểm tra xem Owner này đã có nhà hàng chưa?
        // Giả định Repository có hàm findByOwnerId
        Optional<Restaurant> existing = restaurantRepository.findByOwnerId(request.getOwnerId());
        if (existing.isPresent()) {
            throw new RuntimeException("Mỗi chủ nhà hàng chỉ được tạo duy nhất 1 nhà hàng!");
        }

        Restaurant restaurant = new Restaurant();
        restaurant.setOwnerId(request.getOwnerId());
        restaurant.setName(request.getName());
        restaurant.setDescription(request.getDescription());
        restaurant.setAddress(request.getAddress());
        restaurant.setPhoneNumber(request.getPhoneNumber());
        restaurant.setStatus(RestaurantStatus.OPEN);

        Restaurant saved = restaurantRepository.save(restaurant);
        return mapToRestaurantResponse(saved, false);
    }

    public RestaurantResponse getRestaurantById(Long id) {
        Restaurant restaurant = restaurantRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Nhà hàng không tồn tại ID: " + id));
        return mapToRestaurantResponse(restaurant, true);
    }

    // Lấy nhà hàng của Owner (để Owner quản lý)
    public RestaurantResponse getRestaurantByOwnerId(Long ownerId) {
        Restaurant restaurant = restaurantRepository.findByOwnerId(ownerId)
                .orElseThrow(() -> new ResourceNotFoundException("Bạn chưa tạo nhà hàng nào!"));
        return mapToRestaurantResponse(restaurant, true);
    }

    public List<RestaurantResponse> getAllRestaurants() {
        return restaurantRepository.findAll().stream()
                .map(r -> mapToRestaurantResponse(r, false))
                .collect(Collectors.toList());
    }

    // Cập nhật thông tin nhà hàng
    public RestaurantResponse updateRestaurantInfo(Long id, RestaurantRequest request) {
        Restaurant restaurant = restaurantRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Nhà hàng không tồn tại"));

        restaurant.setName(request.getName());
        restaurant.setDescription(request.getDescription());
        restaurant.setAddress(request.getAddress());
        restaurant.setPhoneNumber(request.getPhoneNumber());

        return mapToRestaurantResponse(restaurantRepository.save(restaurant), false);
    }

    // --- 2. QUẢN LÝ MÓN ĂN (CRUD FULL) ---
    public DishResponse createDish(Long restaurantId, DishRequest request) {
        // if (!restaurantRepository.existsById(restaurantId)) {
        //     throw new ResourceNotFoundException("Nhà hàng không tồn tại ID: " + restaurantId);
        // }
        Dish dish = new Dish();
        dish.setRestaurantId(restaurantId);
        dish.setName(request.getName());
        dish.setDescription(request.getDescription());
        dish.setPrice(request.getPrice());
        dish.setCategory(request.getCategory());
        dish.setImageUrl(request.getImageUrl());
        dish.setIsAvailable(true); // Mặc định khi tạo là có hàng

        return mapToDishResponse(dishRepository.save(dish));
    }

    // [MỚI] Cập nhật món ăn
    public DishResponse updateDish(Long dishId, DishRequest request) {
        Dish dish = dishRepository.findById(dishId)
                .orElseThrow(() -> new ResourceNotFoundException("Món ăn không tồn tại ID: " + dishId));

        dish.setName(request.getName());
        dish.setDescription(request.getDescription());
        dish.setPrice(request.getPrice());
        dish.setCategory(request.getCategory());
        if (request.getImageUrl() != null) {
            dish.setImageUrl(request.getImageUrl());
        }
        if (request.getIsAvailable() != null) {
            dish.setIsAvailable(request.getIsAvailable());
        }

        return mapToDishResponse(dishRepository.save(dish));
    }

    // [MỚI] Xóa món ăn
    public void deleteDish(Long dishId) {
        if (!dishRepository.existsById(dishId)) {
            throw new ResourceNotFoundException("Món ăn không tồn tại ID: " + dishId);
        }
        dishRepository.deleteById(dishId);
    }

    public List<DishResponse> getMenuByRestaurantId(Long restaurantId) {
        return dishRepository.findByRestaurantId(restaurantId).stream()
                .map(this::mapToDishResponse)
                .collect(Collectors.toList());
    }

    public DishResponse getDishById(Long dishId) {
        Dish dish = dishRepository.findById(dishId)
                .orElseThrow(() -> new ResourceNotFoundException("Món ăn không tồn tại"));
        return mapToDishResponse(dish);
    }

    // --- MAPPING HELPER ---
    private RestaurantResponse mapToRestaurantResponse(Restaurant r, boolean includeMenu) {
        RestaurantResponse response = new RestaurantResponse();
        response.setId(r.getId());
        response.setOwnerId(r.getOwnerId());
        response.setName(r.getName());
        response.setDescription(r.getDescription());
        response.setAddress(r.getAddress());
        response.setPhoneNumber(r.getPhoneNumber());
        response.setStatus(r.getStatus());
        response.setAverageRating(r.getAverageRating());

        if (includeMenu) {
            List<DishResponse> menu = dishRepository.findByRestaurantId(r.getId()).stream()
                    .map(this::mapToDishResponse).collect(Collectors.toList());
            response.setMenu(menu);
        }
        return response;
    }

    private DishResponse mapToDishResponse(Dish d) {
        DishResponse response = new DishResponse();
        response.setId(d.getId());
        response.setName(d.getName());
        response.setDescription(d.getDescription());
        response.setPrice(d.getPrice());
        response.setCategory(d.getCategory());
        response.setImageUrl(d.getImageUrl());
        response.setIsAvailable(d.getIsAvailable());
        return response;
    }
}
