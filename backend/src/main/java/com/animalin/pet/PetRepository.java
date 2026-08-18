package com.animalin.pet;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import java.time.Instant;
import java.util.List;
import java.util.Optional;

public interface PetRepository extends JpaRepository<Pet, Long> {
    Optional<Pet> findByIdAndTenantId(Long id, Long tenantId);
    List<Pet> findByOwnerIdAndTenantId(Long ownerId, Long tenantId);
    List<Pet> findByOwner_User_Id(Long userId);
    @Query("""
            select p from Pet p
            join p.owner o
            where p.tenantId = :tenantId
              and (:q is null or lower(p.name) like lower(concat('%', :q, '%'))
                   or lower(p.microchip) like lower(concat('%', :q, '%'))
                   or lower(o.firstName) like lower(concat('%', :q, '%'))
                   or lower(o.lastName) like lower(concat('%', :q, '%')))
              and (:species is null or p.species = :species)
              and (:status is null or p.status = :status)
            """)
    Page<Pet> search(Long tenantId, String q, String species, String status, Pageable pageable);
    long countByTenantId(Long tenantId);
    long countByTenantIdAndCreatedAtAfter(Long tenantId, Instant after);
    long countByDeletedFalse();
    @Query("select p.species, count(p) from Pet p where p.tenantId = :tenantId group by p.species")
    List<Object[]> countBySpecies(Long tenantId);
}
