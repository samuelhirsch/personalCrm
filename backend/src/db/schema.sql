-- Run as a user that can CREATE DATABASE, or create the DB manually first.
-- mysql -u root -p < src/db/schema.sql

CREATE DATABASE IF NOT EXISTS mycrm
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE mycrm;

-- ---------------------------------------------------------------------------
-- contacts
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS contacts (
  id              BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  first_name      VARCHAR(100)    NOT NULL,
  last_name       VARCHAR(100)    NOT NULL,
  company         VARCHAR(255)    DEFAULT NULL,
  phone           VARCHAR(50)     DEFAULT NULL,
  email           VARCHAR(255)    DEFAULT NULL,
  role            VARCHAR(100)    DEFAULT NULL,
  follow_up_date  DATE            DEFAULT NULL,
  created_at      DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at      DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

  INDEX idx_contacts_follow_up (follow_up_date),
  INDEX idx_contacts_name (last_name, first_name)
) ENGINE=InnoDB;

-- ---------------------------------------------------------------------------
-- deals (belongs to one contact)
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS deals (
  id          BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  contact_id  BIGINT UNSIGNED NOT NULL,
  title       VARCHAR(255)    NOT NULL,
  stage       ENUM('Lead','Qualified','Proposal','Won','Lost') NOT NULL DEFAULT 'Lead',
  value       DECIMAL(12,2)   DEFAULT NULL,
  created_at  DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT fk_deals_contact
    FOREIGN KEY (contact_id) REFERENCES contacts (id)
    ON DELETE CASCADE,

  INDEX idx_deals_contact (contact_id),
  INDEX idx_deals_stage (stage)
) ENGINE=InnoDB;

-- ---------------------------------------------------------------------------
-- notes (belongs to one contact)
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS notes (
  id          BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  contact_id  BIGINT UNSIGNED NOT NULL,
  body        TEXT            NOT NULL,
  created_at  DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT fk_notes_contact
    FOREIGN KEY (contact_id) REFERENCES contacts (id)
    ON DELETE CASCADE,

  INDEX idx_notes_contact (contact_id)
) ENGINE=InnoDB;

-- ---------------------------------------------------------------------------
-- tasks (optional link to contact and/or deal)
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS tasks (
  id          BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  contact_id  BIGINT UNSIGNED DEFAULT NULL,
  deal_id     BIGINT UNSIGNED DEFAULT NULL,
  title       VARCHAR(255)    NOT NULL,
  due_date    DATE            DEFAULT NULL,
  done        TINYINT(1)      NOT NULL DEFAULT 0,
  created_at  DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT fk_tasks_contact
    FOREIGN KEY (contact_id) REFERENCES contacts (id)
    ON DELETE SET NULL,

  CONSTRAINT fk_tasks_deal
    FOREIGN KEY (deal_id) REFERENCES deals (id)
    ON DELETE SET NULL,

  INDEX idx_tasks_due (due_date),
  INDEX idx_tasks_done (done)
) ENGINE=InnoDB;
