package com.animalin.tenant;

import com.animalin.dto.AppDtos;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/api/v1/settings")
public class SettingsController {

    private final BrandingService brandingService;
    private final TenantSettingsRepository settingsRepository;

    public SettingsController(BrandingService brandingService, TenantSettingsRepository settingsRepository) {
        this.brandingService = brandingService;
        this.settingsRepository = settingsRepository;
    }

    @GetMapping("/branding")
    public AppDtos.BrandingResponse branding() {
        return brandingService.current();
    }

    @PutMapping("/branding")
    public AppDtos.BrandingResponse updateBranding(@RequestBody BrandingService.BrandingUpdateRequest request) {
        return brandingService.update(request);
    }

    @PostMapping("/branding/logo")
    public AppDtos.BrandingResponse logo(@RequestParam("file") MultipartFile file,
                                         @RequestParam(defaultValue = "light") String variant) {
        return brandingService.uploadLogo(file, variant);
    }

    @GetMapping
    public TenantSettings settings() {
        return settingsRepository.findByTenantId(com.animalin.security.TenantContext.tenantId())
                .orElseThrow();
    }

    @PutMapping
    public TenantSettings updateSettings(@RequestBody BrandingService.SettingsUpdateRequest request) {
        return brandingService.updateSettings(request);
    }
}
