package dinhquycoder2k5.auth_service.controllers;

// Import các thư viện Spring để tạo API
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.http.HttpStatus;
import java.util.Map;
// Import "Bộ Não" (AuthService) của chúng ta
import dinhquycoder2k5.auth_service.services.AuthService; // Sửa lại package cho đúng

// Import Model (chỉ để nhận dữ liệu)
import dinhquycoder2k5.auth_service.models.User; // Sửa lại package cho đúng

@RestController // Báo cho Spring: "Class này là một API Controller, chuyên trả về JSON"
@RequestMapping("/api/auth") // Báo cho Spring: "Mọi API trong class này đều bắt đầu bằng /api/auth"
public class AuthController {
    @Autowired // Yêu cầu Spring "tiêm" (inject) "Bộ Não" vào đây
    private AuthService authService;

    @PostMapping("/register") // Map (ánh xạ) với request POST tới /api/auth/register
    public ResponseEntity<?> registerUser(@RequestBody User registrationRequest) {
        try {
            // 1. Lấy email, pass, role từ request
            String email = registrationRequest.getEmail();
            String password = registrationRequest.getPassword();
            String role = registrationRequest.getRole();

            // 2. Gọi "Bộ Não" (AuthService) để xử lý
            User newUser = authService.register(email, password, role);

            // 3. Trả về thành công
            return ResponseEntity.status(HttpStatus.CREATED).body(newUser); // Trả về 201 Created

        } catch (RuntimeException e) {
            // Nếu "Bộ Não" văng lỗi (ví dụ: email trùng)
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(e.getMessage()); // Trả về 400 Bad Request
        }
    }

    @PostMapping("/login") // Map (ánh xạ) với request POST tới /api/auth/login
    public ResponseEntity<?> loginUser(@RequestBody Map<String, String> loginRequest) {
        
    }

}
