package dinhquycoder2k5.auth_service.repositories;

import dinhquycoder2k5.auth_service.models.User; // Thay bằng đường dẫn package của bạn
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;
public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByEmail(String email);
}
