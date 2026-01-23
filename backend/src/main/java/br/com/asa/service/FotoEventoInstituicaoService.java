package br.com.asa.service;

import br.com.asa.model.FotoEventoInstituicao;
import br.com.asa.repository.FotoEventoInstituicaoRepository;
import br.com.asa.web.FotoEventoInstituicaoDto;
import br.com.asa.web.FotoEventoInstituicaoRequest;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.time.format.DateTimeParseException;
import java.util.List;
import java.util.stream.Collectors;
import org.springframework.stereotype.Service;

@Service
public class FotoEventoInstituicaoService {
    private static final DateTimeFormatter FORMATADOR_DATA = DateTimeFormatter.ISO_LOCAL_DATE;

    private final FotoEventoInstituicaoRepository fotoEventoInstituicaoRepository;

    public FotoEventoInstituicaoService(FotoEventoInstituicaoRepository fotoEventoInstituicaoRepository) {
        this.fotoEventoInstituicaoRepository = fotoEventoInstituicaoRepository;
    }

    public List<FotoEventoInstituicaoDto> listar() {
        return fotoEventoInstituicaoRepository.findAll().stream()
            .map(this::paraDto)
            .collect(Collectors.toList());
    }

    public FotoEventoInstituicaoDto criar(FotoEventoInstituicaoRequest request) {
        validar(request);
        FotoEventoInstituicao foto = preencherEntidade(request, new FotoEventoInstituicao());
        return paraDto(fotoEventoInstituicaoRepository.save(foto));
    }

    public FotoEventoInstituicaoDto atualizar(Long id, FotoEventoInstituicaoRequest request) {
        validar(request);
        FotoEventoInstituicao foto = fotoEventoInstituicaoRepository.findById(id).orElseThrow();
        foto = preencherEntidade(request, foto);
        return paraDto(fotoEventoInstituicaoRepository.save(foto));
    }

    public void excluir(Long id) {
        fotoEventoInstituicaoRepository.deleteById(id);
    }

    private void validar(FotoEventoInstituicaoRequest request) {
        if (request.getNomeInstituicao() == null || request.getNomeInstituicao().isBlank()) {
            throw new IllegalArgumentException("Nome da instituicao obrigatorio.");
        }
        if (request.getNomeEvento() == null || request.getNomeEvento().isBlank()) {
            throw new IllegalArgumentException("Nome do evento obrigatorio.");
        }
        if (request.getUrlFoto() == null || request.getUrlFoto().isBlank()) {
            throw new IllegalArgumentException("Url da foto obrigatoria.");
        }
        if (request.getDataEvento() != null && !request.getDataEvento().isBlank()) {
            parseData(request.getDataEvento());
        }
    }

    private FotoEventoInstituicao preencherEntidade(FotoEventoInstituicaoRequest request, FotoEventoInstituicao foto) {
        foto.setNomeInstituicao(request.getNomeInstituicao());
        foto.setNomeEvento(request.getNomeEvento());
        foto.setUrlFoto(request.getUrlFoto());
        foto.setDescricao(request.getDescricao());
        foto.setDataEvento(parseData(request.getDataEvento()));
        return foto;
    }

    private LocalDate parseData(String dataEvento) {
        if (dataEvento == null || dataEvento.isBlank()) {
            return null;
        }
        try {
            return LocalDate.parse(dataEvento, FORMATADOR_DATA);
        } catch (DateTimeParseException ex) {
            throw new IllegalArgumentException("Data do evento invalida.");
        }
    }

    private FotoEventoInstituicaoDto paraDto(FotoEventoInstituicao foto) {
        FotoEventoInstituicaoDto dto = new FotoEventoInstituicaoDto();
        dto.setId(foto.getId());
        dto.setNomeInstituicao(foto.getNomeInstituicao());
        dto.setNomeEvento(foto.getNomeEvento());
        dto.setUrlFoto(foto.getUrlFoto());
        dto.setDescricao(foto.getDescricao());
        dto.setDataEvento(foto.getDataEvento() == null ? null : foto.getDataEvento().toString());
        return dto;
    }
}
