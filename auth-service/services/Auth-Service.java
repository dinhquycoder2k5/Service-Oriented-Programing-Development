package dinhquycoder2k5.auth_service.services;

// Import các thư viện Spring
import org.springframework.stereotype.Service;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder; // Dùng để băm mật khẩu
import org.springframework.beans.factory.annotation.Value; // Để đọc file config

import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import io.jsonwebtoken.security.Keys;
import java.nio.charset.StandardCharsets;
import java.security.Key;
import java.util.Date;
// Import các model và repository bạn đã tạo
import dinhquycoder2k5.auth_service.models.User;
import dinhquycoder2k5.auth_service.repositories.UserRepository;

// Import công cụ "Optional"
import java.util.Optional;

// (Chúng ta sẽ import thư viện JWT sau khi cần)
@Service // Đánh dấu đây là một "Service" (Bộ Não), Spring sẽ quản lý nó
public class AuthService {
    @Autowired // Yêu cầu Spring "tiêm" (inject) công cụ vào đây
    private UserRepository userRepository;

    @Autowired // Yêu cầu Spring "tiêm" công cụ băm mật khẩu
    private PasswordEncoder passwordEncoder;
    @Value("${jwt.secret}") // Đọc giá trị từ "jwt.secret" trong file properties
    private String jwtSecret;

    public User register(String email, String password, String role) {
        // 1. Kiểm tra email đã tồn tại chưa
        // Chúng ta dùng "Người liên lạc" (repository) để hỏi database
        if (userRepository.findByEmail(email).isPresent()) {
            // Nếu "Optional" có chứa User (is present), nghĩa là email đã tồn tại
            throw new RuntimeException("Email đã được sử dụng");
        }

        // 2. Băm mật khẩu (Hashing)
        // Chúng ta dùng "công cụ" băm mật khẩu mà Spring đã tiêm
        String hashedPassword = passwordEncoder.encode(password);

        // 3. Tạo một "Entity" User mới
        User newUser = new User();
        newUser.setEmail(email);
        newUser.setPassword(hashedPassword); // Lưu mật khẩu đã băm
        newUser.setRole(role); // Gán vai trò

        // 4. Lưu User mới vào database (dùng "Người liên lạc")
        userRepository.save(newUser);
        return newUser;
    }

    public String login(String email, String password) {
        Optional<User> userOptional = userRepository.findByEmail(email);
        if (userOptional.isEmpty()) {
            throw new RuntimeException("Email is not found!");
        }
        User user = userOptional.get();
        // 3. So sánh mật khẩu
        if (!passwordEncoder.matches(password, user.getPassword())) {
            // Nếu .matches() trả về false (không khớp)
            throw new RuntimeException("Email or password is incorrect");
        }
        // 4. Mật khẩu ĐÚNG! Giờ hãy tạo JWT
        long nowMillis = System.currentTimeMillis();
        Date now = new Date(nowMillis);

        // Đặt thời gian hết hạn (ví dụ: 1 giờ)
        // 1 giờ = 60 phút * 60 giây * 1000 mili giây = 3,600,000
        long expMillis = nowMillis + 3600000;
        Date exp = new Date(expMillis);

        // 5. Xây dựng token
        Key key = Keys.hmacShaKeyFor(jwtSecret.getBytes(StandardCharsets.UTF_8));
        return Jwts.builder()
                .setSubject(user.getEmail()) // Đặt email làm "chủ đề" (ai sở hữu)
                .claim("userId", user.getId()) // Thêm thông tin tùy chỉnh (claims)
                .claim("role", user.getRole())
                .setIssuedAt(now) // Thời gian phát hành
                .setExpiration(exp) // Thời gian hết hạn
                .signWith(key, SignatureAlgorithm.HS256) // Ký tên bằng Khóa bí mật (non-deprecated)
                .compact(); // Hoàn thành và trả về chuỗi String
    }
}
