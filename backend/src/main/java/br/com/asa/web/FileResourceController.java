package br.com.asa.web;

import br.com.asa.model.FileResource;
import br.com.asa.repository.FileResourceRepository;
import java.time.LocalDate;
import java.util.List;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/files")
@CrossOrigin
public class FileResourceController {
    private final FileResourceRepository fileResourceRepository;

    public FileResourceController(FileResourceRepository fileResourceRepository) {
        this.fileResourceRepository = fileResourceRepository;
    }

    @GetMapping
    public List<FileResource> list() {
        return fileResourceRepository.findAll();
    }

    @PostMapping
    public FileResource create(@RequestBody FileResource file) {
        if (file.getDate() == null) {
            file.setDate(LocalDate.now());
        }
        return fileResourceRepository.save(file);
    }

    @PutMapping("/{id}")
    public FileResource update(@PathVariable("id") Long id, @RequestBody FileResource file) {
        file.setId(id);
        return fileResourceRepository.save(file);
    }

    @DeleteMapping("/{id}")
    public void delete(@PathVariable("id") Long id) {
        fileResourceRepository.deleteById(id);
    }
}
