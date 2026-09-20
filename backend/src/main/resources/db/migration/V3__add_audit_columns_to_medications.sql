ALTER TABLE medications
    ADD COLUMN created_by VARCHAR(120);

ALTER TABLE medications
    ADD COLUMN updated_by VARCHAR(120);