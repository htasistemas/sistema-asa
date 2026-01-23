package br.com.asa.service;

import br.com.asa.model.User;
import br.com.asa.repository.UserRepository;
import br.com.asa.web.UsuarioDto;
import br.com.asa.web.UsuarioRequest;
import java.util.List;
import java.util.stream.Collectors;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
public class UsuarioService {
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public UsuarioService(UserRepository userRepository, PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    public List<UsuarioDto> listar() {
        return userRepository.findAll().stream()
            .map(this::paraDto)
            .collect(Collectors.toList());
    }

    public UsuarioDto criar(UsuarioRequest request) {
        if (request.getEmail() == null || request.getEmail().isBlank()) {
            throw new IllegalArgumentException("Email obrigatorio.");
        }
        if (request.getSenha() == null || request.getSenha().isBlank()) {
            throw new IllegalArgumentException("Senha obrigatoria.");
        }
        if (userRepository.findByEmail(request.getEmail()).isPresent()) {
            throw new IllegalArgumentException("Email ja cadastrado.");
        }

        User user = new User();
        user.setEmail(request.getEmail());
        user.setUsername(request.getEmail());
        user.setPasswordHash(passwordEncoder.encode(request.getSenha()));
        user.setRole(request.getRole() == null ? "ADMIN" : request.getRole());
        user.setActive(request.isActive());
        user.setAprovado(request.isAprovado());
        return paraDto(userRepository.save(user));
    }

    public UsuarioDto atualizar(Long id, UsuarioRequest request) {
        User user = userRepository.findById(id).orElseThrow();
        if (request.getEmail() == null || request.getEmail().isBlank()) {
            throw new IllegalArgumentException("Email obrigatorio.");
        }
        if (!user.getEmail().equalsIgnoreCase(request.getEmail())
            && userRepository.findByEmail(request.getEmail()).isPresent()) {
            throw new IllegalArgumentException("Email ja cadastrado.");
        }
        user.setEmail(request.getEmail());
        user.setUsername(request.getEmail());
        user.setRole(request.getRole() == null ? user.getRole() : request.getRole());
        user.setActive(request.isActive());
        user.setAprovado(request.isAprovado());
        if (request.getSenha() != null && !request.getSenha().isBlank()) {
            user.setPasswordHash(passwordEncoder.encode(request.getSenha()));
        }
        return paraDto(userRepository.save(user));
    }

    public void excluir(Long id) {
        userRepository.deleteById(id);
    }

    private UsuarioDto paraDto(User user) {
        UsuarioDto dto = new UsuarioDto();
        dto.setId(user.getId());
        dto.setEmail(user.getEmail());
        dto.setRole(user.getRole());
        dto.setActive(user.isActive());
        dto.setAprovado(user.isAprovado());
        return dto;
    }
}
