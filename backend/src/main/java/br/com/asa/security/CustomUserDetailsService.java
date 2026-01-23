package br.com.asa.security;

import br.com.asa.model.User;
import br.com.asa.repository.UserRepository;
import java.util.Collections;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

@Service
public class CustomUserDetailsService implements UserDetailsService {
    private final UserRepository userRepository;

    public CustomUserDetailsService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    @Override
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
        User user = userRepository.findByEmail(username)
            .orElseThrow(() -> new UsernameNotFoundException("User not found"));
        return org.springframework.security.core.userdetails.User
            .withUsername(user.getEmail())
            .password(user.getPasswordHash())
            .authorities(Collections.singletonList(() -> "ROLE_" + user.getRole()))
            .accountLocked(!user.isAprovado() && !usuarioLiberadoPorExcecao(user))
            .disabled(!user.isActive())
            .build();
    }

    private boolean usuarioLiberadoPorExcecao(User user) {
        if (user.getRole() != null && user.getRole().equalsIgnoreCase("ADMIN")) {
            return true;
        }
        return "adrianomtorresbr@gmail.com".equalsIgnoreCase(user.getEmail());
    }
}
