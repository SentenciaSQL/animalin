package com.animalin.admin;

import com.animalin.plan.Plan;
import com.animalin.plan.PlanRepository;
import com.animalin.tenant.Subscription;
import com.animalin.tenant.SubscriptionRepository;
import com.animalin.tenant.Tenant;
import com.animalin.user.User;
import com.animalin.user.UserRepository;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/admin")
public class AdminController {

    private final AdminService adminService;
    private final PlanRepository planRepository;
    private final SubscriptionRepository subscriptionRepository;
    private final UserRepository userRepository;

    public AdminController(AdminService adminService, PlanRepository planRepository, SubscriptionRepository subscriptionRepository, UserRepository userRepository) {
        this.adminService = adminService;
        this.planRepository = planRepository;
        this.subscriptionRepository = subscriptionRepository;
        this.userRepository = userRepository;
    }

    @GetMapping("/metrics")
    public Map<String, Object> metrics() {
        return adminService.metrics();
    }

    @GetMapping("/tenants")
    public List<Tenant> tenants() {
        return adminService.tenants();
    }

    @PostMapping("/tenants")
    @ResponseStatus(HttpStatus.CREATED)
    public Tenant create(@RequestBody AdminService.CreateTenantRequest request) {
        return adminService.createTenant(request);
    }

    @PostMapping("/tenants/{id}/status")
    public Tenant status(@PathVariable Long id, @RequestBody Map<String, String> body) {
        return adminService.changeStatus(id, body.get("status"));
    }

    @GetMapping("/plans")
    public List<Plan> plans() {
        return adminService.plans();
    }

    @GetMapping("/subscriptions")
    public List<Subscription> subscriptions() {
        return subscriptionRepository.findAll();
    }

    @GetMapping("/users")
    public List<User> users(Pageable pageable) {
        return userRepository.findAll(pageable).getContent();
    }
}
