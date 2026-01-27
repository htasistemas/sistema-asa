package br.com.asa.web;

import br.com.asa.model.User;
import br.com.asa.repository.UserRepository;
import br.com.asa.service.EmailService;
import br.com.asa.security.JwtService;
import java.security.SecureRandom;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.LockedException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin
public class AuthController {
    private static final Logger logger = LoggerFactory.getLogger(AuthController.class);
    private final AuthenticationManager authenticationManager;
    private final JwtService jwtService;
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final EmailService emailService;

    public AuthController(AuthenticationManager authenticationManager,
                          JwtService jwtService,
                          UserRepository userRepository,
                          PasswordEncoder passwordEncoder,
                          EmailService emailService) {
        this.authenticationManager = authenticationManager;
        this.jwtService = jwtService;
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.emailService = emailService;
    }

    @PostMapping("/login")
    public AuthResponse login(@RequestBody AuthRequest request) {
        Authentication auth;
        try {
            auth = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.getEmail(), request.getPassword())
            );
        } catch (LockedException ex) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Usuario nao autorizado. Aguarde a aprovacao do administrador.");
        } catch (BadCredentialsException ex) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Credenciais invalidas.");
        }
        User user = userRepository.findByEmail(auth.getName()).orElseThrow();
        logger.info("Login para email={} ativo={} role={}", user.getEmail(), user.isActive(), user.getRole());
        if (!user.isAprovado()) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Usuario nao autorizado. Aguarde a aprovacao do administrador.");
        }
        String token = jwtService.generateToken(user.getEmail(), user.getRole());
        return new AuthResponse(token, user.getRole());
    }

    @PostMapping("/register")
    public void register(@RequestBody RegisterRequest request) {
        if (userRepository.findByEmail(request.getEmail()).isPresent()) {
            throw new IllegalArgumentException("Email already exists");
        }
        User user = new User();
        user.setUsername(request.getEmail());
        user.setEmail(request.getEmail());
        user.setPasswordHash(passwordEncoder.encode(request.getPassword()));
        user.setRole(request.getRole() == null ? "ADMIN" : request.getRole());
        user.setAprovado(false);
        userRepository.save(user);
    }

    @PostMapping("/esqueci-senha")
    public MensagemResponse esqueciSenha(@RequestBody EsqueciSenhaRequest request) {
        if (request.getEmail() == null || request.getEmail().isBlank()) {
            throw new IllegalArgumentException("Email obrigatorio.");
        }
        User user = userRepository.findByEmail(request.getEmail())
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Email nao encontrado."));
        logger.info("Solicitacao de recuperacao de senha para email={}", user.getEmail());
        String senhaTemporaria = gerarSenhaTemporaria();
        user.setPasswordHash(passwordEncoder.encode(senhaTemporaria));
        userRepository.save(user);
        String mensagem = "Ola,\n\n"
            + "Recebemos uma solicitacao de recuperacao de senha para sua conta no Sistema ASA.\n\n"
            + "Senha temporaria: " + senhaTemporaria + "\n\n"
            + "Por seguranca:\n"
            + "1. Acesse o sistema.\n"
            + "2. Altere sua senha imediatamente.\n\n"
            + "Se voce nao solicitou, ignore este e-mail ou contate o administrador.\n\n"
            + "Equipe ASA";
        try {
            emailService.enviarEmail(user.getEmail(), "Recuperacao de senha - ASA", mensagem);
            logger.info("E-mail de recuperacao enviado para email={}", user.getEmail());
        } catch (IllegalStateException ex) {
            logger.error("SMTP nao configurado ao enviar e-mail de recuperacao para email={}", user.getEmail(), ex);
            throw new ResponseStatusException(
                HttpStatus.INTERNAL_SERVER_ERROR,
                "Servico de e-mail nao configurado. Contate o administrador do sistema."
            );
        } catch (org.springframework.mail.MailAuthenticationException ex) {
            logger.error("Falha de autenticacao SMTP ao enviar e-mail de recuperacao para email={}", user.getEmail(), ex);
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "Falha de autenticacao SMTP. Verifique o usuario e a senha de app do e-mail.");
        } catch (org.springframework.mail.MailException ex) {
            logger.error("Falha SMTP ao enviar e-mail de recuperacao para email={}", user.getEmail(), ex);
            String detalhe = ex.getMessage() == null ? "" : ex.getMessage();
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "Falha no envio do e-mail. " + detalhe);
        } catch (Exception ex) {
            logger.error("Falha ao enviar e-mail de recuperacao para email={}", user.getEmail(), ex);
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "Nao foi possivel enviar o e-mail de recuperacao.");
        }
        return new MensagemResponse("E-mail de recuperacao enviado com sucesso.");
    }

    public record MensagemResponse(String mensagem) {}

    private String gerarSenhaTemporaria() {
        String caracteres = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789@";
        SecureRandom random = new SecureRandom();
        StringBuilder senha = new StringBuilder();
        for (int i = 0; i < 10; i++) {
            senha.append(caracteres.charAt(random.nextInt(caracteres.length())));
        }
        return senha.toString();
    }
}
