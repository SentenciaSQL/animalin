package com.animalin;

import org.junit.jupiter.api.Test;

import java.net.URI;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.HashMap;
import java.util.Map;
import java.util.Objects;
import java.util.regex.Matcher;
import java.util.regex.Pattern;
import java.util.stream.Stream;

import static org.assertj.core.api.Assertions.assertThat;

class FlywayMigrationVersionTest {

    private static final Pattern VERSIONED = Pattern.compile("^V(\\d+(?:_\\d+)?)__.*\\.sql$");

    @Test
    void eachFlywayMigrationHasAUniqueVersion() throws Exception {
        URI uri = Objects.requireNonNull(
                getClass().getClassLoader().getResource("db/migration"),
                "db/migration not found on classpath"
        ).toURI();
        Path dir = Paths.get(uri);
        Map<String, String> versions = new HashMap<>();

        try (Stream<Path> files = Files.list(dir)) {
            files.map(path -> path.getFileName().toString())
                    .filter(name -> name.endsWith(".sql"))
                    .forEach(name -> {
                        Matcher matcher = VERSIONED.matcher(name);
                        assertThat(matcher.matches())
                                .as("Flyway file %s must use V<version>__description.sql", name)
                                .isTrue();
                        String previous = versions.put(matcher.group(1), name);
                        assertThat(previous)
                                .as("Duplicate Flyway version %s: %s and %s", matcher.group(1), previous, name)
                                .isNull();
                    });
        }

        assertThat(versions).containsKeys("1", "2", "3");
    }
}
