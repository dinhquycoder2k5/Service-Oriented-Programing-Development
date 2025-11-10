package dinhquycoder2k5.auth_service.models;

// Import các thư viện JPA (để làm việc với DB)
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import jakarta.persistence.Column;

// Import thư viện cho timestamps (ngày giờ)
import java.util.Date;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

// Import Lombok (giúp code ngắn gọn)
import lombok.Getter;
import lombok.Setter;
import lombok.NoArgsConstructor;

import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;
@Entity 
@Table(name = "users") 
@Getter 
@Setter 
@NoArgsConstructor
public class User {
	@Id 
    @GeneratedValue(strategy = GenerationType.IDENTITY) 
    private Long id;

    @Column(nullable = false, unique = true) 
    private String email;

    @Column(nullable = false) 
    private String password;

    @Column(nullable = false)
    private String role;

    @CreationTimestamp 
    @Column(updatable = false, nullable = false) 
    private Date createdAt;

    @UpdateTimestamp 
    @Column(nullable = false)
    private Date updatedAt;
}
