package br.com.asa.service;

import br.com.asa.model.ConfiguracaoGeral;
import br.com.asa.repository.ConfiguracaoGeralRepository;
import br.com.asa.web.ConfiguracaoGeralDto;
import java.util.Comparator;
import java.util.List;
import java.util.stream.Collectors;
import org.springframework.stereotype.Service;

@Service
public class ConfiguracaoGeralService {
    private final ConfiguracaoGeralRepository configuracaoGeralRepository;

    public ConfiguracaoGeralService(ConfiguracaoGeralRepository configuracaoGeralRepository) {
        this.configuracaoGeralRepository = configuracaoGeralRepository;
    }

    public List<ConfiguracaoGeralDto> listar() {
        return configuracaoGeralRepository.findAll().stream()
            .sorted(Comparator.comparing(ConfiguracaoGeral::getId).reversed())
            .map(this::paraDto)
            .collect(Collectors.toList());
    }

    public ConfiguracaoGeralDto criar(ConfiguracaoGeralDto dto) {
        ConfiguracaoGeral configuracao = preencherEntidade(dto, new ConfiguracaoGeral());
        return paraDto(configuracaoGeralRepository.save(configuracao));
    }

    public void excluir(Long id) {
        configuracaoGeralRepository.deleteById(id);
    }

    private ConfiguracaoGeralDto paraDto(ConfiguracaoGeral configuracao) {
        ConfiguracaoGeralDto dto = new ConfiguracaoGeralDto();
        dto.setId(configuracao.getId());
        dto.setVersao(configuracao.getVersao());
        dto.setDataHora(configuracao.getDataHora());
        dto.setMudancas(configuracao.getMudancas());
        return dto;
    }

    private ConfiguracaoGeral preencherEntidade(ConfiguracaoGeralDto dto, ConfiguracaoGeral configuracao) {
        configuracao.setVersao(dto.getVersao());
        configuracao.setDataHora(dto.getDataHora());
        configuracao.setMudancas(dto.getMudancas());
        return configuracao;
    }
}
