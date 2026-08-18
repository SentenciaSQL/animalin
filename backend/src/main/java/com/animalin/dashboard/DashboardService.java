package com.animalin.dashboard;

import com.animalin.appointment.Appointment;
import com.animalin.appointment.AppointmentRepository;
import com.animalin.catalog.ClinicService;
import com.animalin.catalog.ClinicServiceRepository;
import com.animalin.medical.TreatmentRepository;
import com.animalin.medical.Vaccination;
import com.animalin.medical.VaccinationRepository;
import com.animalin.messaging.MessageRepository;
import com.animalin.owner.OwnerRepository;
import com.animalin.pet.PetRepository;
import com.animalin.security.AccessGuard;
import com.animalin.security.TenantContext;
import com.animalin.veterinarian.Veterinarian;
import com.animalin.veterinarian.VeterinarianRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.time.Instant;
import java.time.LocalDate;
import java.time.LocalTime;
import java.time.ZoneId;
import java.time.ZonedDateTime;
import java.util.List;
import java.util.Map;

@Service
public class DashboardService {

    private final AppointmentRepository appointmentRepository;
    private final OwnerRepository ownerRepository;
    private final PetRepository petRepository;
    private final VaccinationRepository vaccinationRepository;
    private final TreatmentRepository treatmentRepository;
    private final MessageRepository messageRepository;
    private final VeterinarianRepository veterinarianRepository;
    private final ClinicServiceRepository clinicServiceRepository;
    private final AccessGuard accessGuard;

    public DashboardService(AppointmentRepository appointmentRepository, OwnerRepository ownerRepository, PetRepository petRepository, VaccinationRepository vaccinationRepository, TreatmentRepository treatmentRepository, MessageRepository messageRepository, VeterinarianRepository veterinarianRepository, ClinicServiceRepository clinicServiceRepository, AccessGuard accessGuard) {
        this.appointmentRepository = appointmentRepository;
        this.ownerRepository = ownerRepository;
        this.petRepository = petRepository;
        this.vaccinationRepository = vaccinationRepository;
        this.treatmentRepository = treatmentRepository;
        this.messageRepository = messageRepository;
        this.veterinarianRepository = veterinarianRepository;
        this.clinicServiceRepository = clinicServiceRepository;
        this.accessGuard = accessGuard;
    }

    @Transactional(readOnly = true)
    public Map<String, Object> clinic() {
        Long tenantId = accessGuard.requireStaffTenant();
        ZoneId zone = ZoneId.of("Europe/Madrid");
        ZonedDateTime start = LocalDate.now().atStartOfDay(zone);
        Instant todayStart = start.toInstant();
        Instant todayEnd = start.plusDays(1).toInstant();
        Instant weekEnd = start.plusDays(7).toInstant();
        Instant monthAgo = start.minusDays(30).toInstant();

        var today = appointmentRepository.calendar(tenantId, todayStart, todayEnd, null, null, null);
        long pending = today.stream().filter(a -> List.of("REQUESTED", "PENDING").contains(a.getStatus())).count();
        long cancelled = appointmentRepository.countByTenantIdAndStatusAndStartAtBetween(tenantId, "CANCELLED", todayStart, todayEnd);
        List<Vaccination> due = vaccinationRepository.findByTenantIdAndNextDoseAtBetween(tenantId, LocalDate.now(), LocalDate.now().plusDays(21));

        List<Map<String, Object>> months = new java.util.ArrayList<>();
        for (int i = 5; i >= 0; i--) {
            ZonedDateTime monthStart = start.minusMonths(i).withDayOfMonth(1).with(LocalTime.MIN);
            Instant from = monthStart.toInstant();
            Instant to = monthStart.plusMonths(1).toInstant();
            months.add(Map.of(
                    "label", monthStart.getMonth().name().substring(0, 3),
                    "value", appointmentRepository.countByTenantIdAndStartAtBetween(tenantId, from, to)
            ));
        }

        return Map.ofEntries(
                Map.entry("appointmentsToday", today.size()),
                Map.entry("pendingAppointments", pending),
                Map.entry("cancelledToday", cancelled),
                Map.entry("patientsToday", today.stream().filter(a -> "COMPLETED".equals(a.getStatus())).count()),
                Map.entry("newOwners", ownerRepository.countByTenantIdAndCreatedAtAfter(tenantId, monthAgo)),
                Map.entry("newPets", petRepository.countByTenantIdAndCreatedAtAfter(tenantId, monthAgo)),
                Map.entry("upcomingVaccines", due.size()),
                Map.entry("activeTreatments", treatmentRepository.findByTenantIdAndStatus(tenantId, "ACTIVE").size()),
                Map.entry("unreadMessages", messageRepository.countByConversation_TenantIdAndReadAtIsNullAndSenderIdNot(tenantId, TenantContext.userId())),
                Map.entry("todayAgenda", today.stream().limit(12).map(this::briefAppointment).toList()),
                Map.entry("upcomingAppointments", appointmentRepository.calendar(tenantId, todayEnd, weekEnd, null, null, null)
                        .stream().limit(8).map(this::briefAppointment).toList()),
                Map.entry("upcomingVaccinations", due.stream().limit(8).map(v -> Map.of(
                        "id", v.getId(),
                        "pet", v.getPet().getName(),
                        "vaccine", v.getVaccineName(),
                        "nextDoseAt", v.getNextDoseAt(),
                        "status", v.statusCode()
                )).toList()),
                Map.entry("species", petRepository.countBySpecies(tenantId).stream()
                        .map(row -> Map.of("label", row[0], "value", row[1])).toList()),
                Map.entry("topServices", clinicServiceRepository.findByTenantId(tenantId).stream()
                        .map(ClinicService::getNameEs).toList()),
                Map.entry("appointmentsByMonth", months)
        );
    }

    private Map<String, Object> briefAppointment(Appointment a) {
        return Map.of(
                "id", a.getId(),
                "startAt", a.getStartAt(),
                "pet", a.getPet().getName(),
                "owner", a.getOwner().fullName(),
                "status", a.getStatus(),
                "veterinarian", a.getVeterinarian() == null ? "" : a.getVeterinarian().getUser().fullName()
        );
    }
}

@RestController
@RequestMapping("/api/v1/dashboard")
class DashboardController {
    private final DashboardService dashboardService;

    public DashboardController(DashboardService dashboardService) {
        this.dashboardService = dashboardService;
    }

    @GetMapping
    public Map<String, Object> clinic() {
        return dashboardService.clinic();
    }
}
