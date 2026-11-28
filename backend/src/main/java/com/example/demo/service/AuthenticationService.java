package com.example.demo.service;

import com.example.demo.dto.UserDTO;
import com.example.demo.dto.UserRegistrationDTO;
import com.example.demo.entity.User;
import com.example.demo.repository.UserRepository;
import com.google.api.client.googleapis.auth.oauth2.GoogleIdToken;
import com.google.api.client.googleapis.auth.oauth2.GoogleIdTokenVerifier;
import com.google.api.client.http.javanet.NetHttpTransport;
import com.google.api.client.json.gson.GsonFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;
import java.io.IOException;
import java.security.GeneralSecurityException;
import java.util.Optional;
import java.util.HashMap;
import java.util.Map;
import java.util.Collections;
import java.util.UUID;

@Service
public class AuthenticationService {
    
    @Autowired
    private UserRepository userRepository;

    @Value("${google.client-id:}")
    private String googleClientId;
    
    private BCryptPasswordEncoder passwordEncoder = new BCryptPasswordEncoder();
    
    /**
     * Register a new user
     */
    public UserDTO register(UserRegistrationDTO registrationDTO) {
        // Check if email already exists
        if (userRepository.existsByEmail(registrationDTO.getEmail())) {
            throw new RuntimeException("Email already registered");
        }
        
        // Validate role - only OWNER and CUSTOMER allowed for registration
        String role = registrationDTO.getRole().toUpperCase();
        if (role.equals("ADMIN") || role.equals("SUPERADMIN")) {
            throw new RuntimeException("Admin and SuperAdmin accounts can only be created by administrators");
        }
        
        // Create new user
        User user = new User();
        user.setName(registrationDTO.getName());
        user.setEmail(registrationDTO.getEmail());
        user.setPhone(registrationDTO.getPhone());
        user.setPassword(passwordEncoder.encode(registrationDTO.getPassword()));
        user.setRole(User.Role.valueOf(role));
        user.setIsVerified(false);
        user.setIsBlocked(false);
        
        User savedUser = userRepository.save(user);
        return convertToDTO(savedUser);
    }
    
    /**
     * Login user - returns user details if credentials are valid
     */
    public Map<String, Object> login(String email, String password) {
        Optional<User> userOptional = userRepository.findByEmail(email);
        
        if (userOptional.isEmpty()) {
            throw new RuntimeException("User not found");
        }
        
        User user = userOptional.get();
        
        // Check if user is blocked
        if (user.getIsBlocked()) {
            throw new RuntimeException("User account is blocked");
        }
        
        // Verify password
        if (!passwordEncoder.matches(password, user.getPassword())) {
            throw new RuntimeException("Invalid password");
        }
        
        // Return success response with user details
        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("message", "Login successful");
        response.put("user", convertToDTO(user));
        response.put("token", generateToken(user)); // Simple token generation
        
        return response;
    }

    public Map<String, Object> loginWithGoogle(String token) {
        if (token == null || token.isBlank()) {
            throw new RuntimeException("Google credential is required");
        }
        if (googleClientId == null || googleClientId.isBlank()) {
            throw new IllegalStateException("Google sign-in is not configured on the server");
        }

        try {
            GoogleIdTokenVerifier verifier = new GoogleIdTokenVerifier.Builder(
                    new NetHttpTransport(), GsonFactory.getDefaultInstance())
                    .setAudience(Collections.singletonList(googleClientId))
                    .build();
            GoogleIdToken idToken = verifier.verify(token);
            if (idToken == null) {
                throw new RuntimeException("Invalid Google credential");
            }

            GoogleIdToken.Payload payload = idToken.getPayload();
            if (!Boolean.TRUE.equals(payload.getEmailVerified())) {
                throw new RuntimeException("Google email must be verified");
            }

            String email = payload.getEmail();
            if (email == null || email.isBlank()) {
                throw new RuntimeException("Google account did not provide an email address");
            }
            User user = userRepository.findByEmail(email).orElseGet(() -> {
                User newUser = new User();
                Object googleName = payload.get("name");
                newUser.setName(googleName == null || String.valueOf(googleName).isBlank()
                        ? email : String.valueOf(googleName));
                newUser.setEmail(email);
                newUser.setPhone("Not provided");
                newUser.setPassword(passwordEncoder.encode(UUID.randomUUID().toString()));
                newUser.setRole(User.Role.CUSTOMER);
                newUser.setIsVerified(true);
                newUser.setIsBlocked(false);
                return userRepository.save(newUser);
            });

            if (Boolean.TRUE.equals(user.getIsBlocked())) {
                throw new RuntimeException("User account is blocked");
            }

            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "Login successful");
            response.put("user", convertToDTO(user));
            response.put("token", generateToken(user));
            return response;
        } catch (GeneralSecurityException | IOException e) {
            throw new RuntimeException("Unable to verify Google credential", e);
        }
    }
    
    /**
     * Verify user email
     */
    public void verifyEmail(Long userId) {
        Optional<User> userOptional = userRepository.findById(userId);
        if (userOptional.isPresent()) {
            User user = userOptional.get();
            user.setIsVerified(true);
            userRepository.save(user);
        }
    }
    
    /**
     * Block/Unblock user (Admin only)
     */
    public void blockUser(Long userId, boolean block) {
        Optional<User> userOptional = userRepository.findById(userId);
        if (userOptional.isPresent()) {
            User user = userOptional.get();
            user.setIsBlocked(block);
            userRepository.save(user);
        }
    }
    
    /**
     * Convert User entity to UserDTO
     */
    private UserDTO convertToDTO(User user) {
        UserDTO dto = new UserDTO();
        dto.setId(user.getId());
        dto.setName(user.getName());
        dto.setEmail(user.getEmail());
        dto.setPhone(user.getPhone());
        dto.setRole(user.getRole().toString());
        dto.setIsBlocked(user.getIsBlocked());
        dto.setIsVerified(user.getIsVerified());
        return dto;
    }
    
    /**
     * Simple token generation (In production, use JWT)
     */
    private String generateToken(User user) {
        return "token_" + user.getId() + "_" + System.currentTimeMillis();
    }
}
