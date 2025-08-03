-- =========================================
-- OPTIMIZED POSTGRESQL SCHEMA
-- Habit Tracking Application
-- =========================================

-- Enable UUID extension for UUID generation
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Enable pg_stat_statements for query performance monitoring
CREATE EXTENSION IF NOT EXISTS pg_stat_statements;

-- Create custom ENUM types
CREATE TYPE habit_complexity AS ENUM ('Complex', 'Simple', 'Without Intervals');

-- =========================================
-- CORE TABLES
-- =========================================

-- HABITS TABLE
-- Stores habit definitions with metadata and audit trail
CREATE TABLE habits (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(50) NOT NULL,
    habit_type habit_complexity NOT NULL,
    logo TEXT, -- Base64 encoded image or URL
    
    -- Audit fields
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    is_active BOOLEAN DEFAULT true NOT NULL,
    
    -- Computed fields for analytics
    total_actions_count INTEGER DEFAULT 0 NOT NULL,
    last_action_date TIMESTAMP WITH TIME ZONE,
    
    -- Constraints
    CONSTRAINT habits_name_not_empty CHECK (LENGTH(TRIM(name)) > 0),
    CONSTRAINT habits_logo_size CHECK (LENGTH(logo) <= 2097152) -- 2MB limit for base64 images
);

-- ACTIONS TABLE  
-- Time-tracked activities with optimizations for time-series queries
CREATE TABLE actions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    habit_id UUID NOT NULL,
    start_time TIMESTAMP WITH TIME ZONE NOT NULL,
    end_time TIMESTAMP WITH TIME ZONE,
    duration_seconds INTEGER,
    action_date DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    CONSTRAINT fk_actions_habit_id
        FOREIGN KEY (habit_id) REFERENCES habits(id)
        ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT actions_time_sequence CHECK (
        end_time IS NULL OR end_time > start_time
    ),
    CONSTRAINT actions_reasonable_duration CHECK (
        end_time IS NULL OR
        EXTRACT(EPOCH FROM (end_time - start_time)) <= 86400
    ),
    CONSTRAINT actions_start_time_not_future CHECK (
        start_time <= CURRENT_TIMESTAMP
    )
);

-- BOOKS TABLE
-- Book catalog with reading progress tracking
CREATE TABLE books (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) NOT NULL,
    image TEXT, -- Book cover image
    total_pages INTEGER NOT NULL,
    current_page INTEGER DEFAULT 0 NOT NULL,
    average_of_characters_per_minute FLOAT,
    
    -- Additional metadata for better tracking
    author VARCHAR(100),
    genre VARCHAR(50),
    
    -- Progress tracking (computed)
    completion_percentage DECIMAL(5,2) GENERATED ALWAYS AS (
        CASE 
            WHEN total_pages > 0 THEN 
                ROUND((current_page::DECIMAL / total_pages::DECIMAL) * 100, 2)
            ELSE 0
        END
    ) STORED,
    
    -- Reading statistics (updated via triggers)
    total_reading_sessions INTEGER DEFAULT 0 NOT NULL,
    total_characters_read BIGINT DEFAULT 0 NOT NULL,
    average_session_duration INTEGER DEFAULT 0 NOT NULL, -- in seconds
    
    -- Audit fields
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    is_active BOOLEAN DEFAULT true NOT NULL,
    
    -- Constraints
    CONSTRAINT books_name_not_empty CHECK (LENGTH(TRIM(name)) > 0),
    CONSTRAINT books_pages_positive CHECK (total_pages > 0),
    CONSTRAINT books_current_page_valid CHECK (
        current_page >= 0 AND current_page <= total_pages
    ),
    CONSTRAINT books_image_size CHECK (LENGTH(image) <= 2097152), -- 2MB limit
    CONSTRAINT books_reading_rate_positive CHECK (
        average_of_characters_per_minute IS NULL OR 
        average_of_characters_per_minute > 0
    )
);

-- READING_LOGS TABLE
-- Detailed reading session tracking with performance optimizations
CREATE TABLE reading_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    action_id UUID NOT NULL UNIQUE,
    book_id UUID NOT NULL,
    number_of_characters INTEGER NOT NULL,
    breaths INTEGER NOT NULL,
    number_of_characters_per_minute FLOAT NOT NULL,
    number_of_breaths_per_minute FLOAT NOT NULL,
    using_voice BOOLEAN DEFAULT false NOT NULL,
    reading_date DATE,
    session_duration_seconds INTEGER,
    reading_efficiency DECIMAL(5,2) GENERATED ALWAYS AS (
        CASE
            WHEN number_of_breaths_per_minute > 0 THEN
                ROUND(
                    (number_of_characters_per_minute / number_of_breaths_per_minute)::DECIMAL,
                    2
                )
            ELSE NULL
        END
    ) STORED,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    CONSTRAINT fk_reading_logs_action_id
        FOREIGN KEY (action_id) REFERENCES actions(id)
        ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT fk_reading_logs_book_id
        FOREIGN KEY (book_id) REFERENCES books(id)
        ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT reading_logs_characters_positive CHECK (number_of_characters > 0),
    CONSTRAINT reading_logs_breaths_positive CHECK (breaths > 0),
    CONSTRAINT reading_logs_char_rate_positive CHECK (number_of_characters_per_minute > 0),
    CONSTRAINT reading_logs_breath_rate_positive CHECK (number_of_breaths_per_minute > 0),
    CONSTRAINT reading_logs_reasonable_char_rate CHECK (
        number_of_characters_per_minute <= 10000
    ),
    CONSTRAINT reading_logs_reasonable_breath_rate CHECK (
        number_of_breaths_per_minute BETWEEN 0 AND 60
    )
);

-- =========================================
-- PERFORMANCE INDEXES
-- =========================================

-- HABITS TABLE INDEXES
CREATE UNIQUE INDEX idx_habits_name_active ON habits(name) WHERE is_active = true;
CREATE INDEX idx_habits_type_active ON habits(habit_type, is_active) WHERE is_active = true;
CREATE INDEX idx_habits_created_at ON habits(created_at);
CREATE INDEX idx_habits_last_action ON habits(last_action_date DESC) WHERE last_action_date IS NOT NULL;

-- ACTIONS TABLE INDEXES (Critical for time-series queries)
CREATE INDEX idx_actions_habit_id ON actions(habit_id);
CREATE INDEX idx_actions_start_time ON actions(start_time DESC);
CREATE INDEX idx_actions_date ON actions(action_date);

-- Composite indexes for common query patterns
CREATE INDEX idx_actions_habit_date ON actions(habit_id, action_date);
CREATE INDEX idx_actions_habit_start_time ON actions(habit_id, start_time DESC);
CREATE INDEX idx_actions_date_range ON actions(start_time, end_time) WHERE end_time IS NOT NULL;

-- Duration-based queries
CREATE INDEX idx_actions_duration ON actions(duration_seconds) WHERE duration_seconds IS NOT NULL;
CREATE INDEX idx_actions_habit_duration ON actions(habit_id, duration_seconds) WHERE duration_seconds IS NOT NULL;

-- BOOKS TABLE INDEXES
CREATE INDEX idx_books_name ON books(name) WHERE is_active = true;
CREATE INDEX idx_books_completion ON books(completion_percentage);
CREATE INDEX idx_books_author ON books(author) WHERE author IS NOT NULL;
CREATE INDEX idx_books_genre ON books(genre) WHERE genre IS NOT NULL;
CREATE INDEX idx_books_total_sessions ON books(total_reading_sessions DESC);

-- READING_LOGS TABLE INDEXES
CREATE INDEX idx_reading_logs_book_id ON reading_logs(book_id);
CREATE INDEX idx_reading_logs_date ON reading_logs(reading_date);
CREATE INDEX idx_reading_logs_book_date ON reading_logs(book_id, reading_date);

-- Performance analytics indexes
CREATE INDEX idx_reading_logs_char_rate ON reading_logs(number_of_characters_per_minute);
CREATE INDEX idx_reading_logs_efficiency ON reading_logs(reading_efficiency) WHERE reading_efficiency IS NOT NULL;
CREATE INDEX idx_reading_logs_voice ON reading_logs(using_voice, book_id);

-- =========================================
-- TRIGGERS FOR DATA CONSISTENCY
-- =========================================

-- Update timestamps trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply updated_at triggers to all tables
CREATE TRIGGER update_habits_updated_at 
    BEFORE UPDATE ON habits 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_actions_updated_at 
    BEFORE UPDATE ON actions 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_books_updated_at 
    BEFORE UPDATE ON books 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_reading_logs_updated_at 
    BEFORE UPDATE ON reading_logs 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Trigger to update habit statistics
CREATE OR REPLACE FUNCTION update_habit_stats()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        UPDATE habits SET 
            total_actions_count = total_actions_count + 1,
            last_action_date = NEW.start_time
        WHERE id = NEW.habit_id;
        RETURN NEW;
    ELSIF TG_OP = 'DELETE' THEN
        UPDATE habits SET 
            total_actions_count = GREATEST(total_actions_count - 1, 0),
            last_action_date = (
                SELECT MAX(start_time) 
                FROM actions 
                WHERE habit_id = OLD.habit_id AND id != OLD.id
            )
        WHERE id = OLD.habit_id;
        RETURN OLD;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_habit_stats_trigger
    AFTER INSERT OR DELETE ON actions
    FOR EACH ROW EXECUTE FUNCTION update_habit_stats();

-- Trigger to update book reading statistics
CREATE OR REPLACE FUNCTION update_book_stats()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        -- Update session duration from action table
        UPDATE reading_logs SET 
            session_duration_seconds = (
                SELECT duration_seconds 
                FROM actions 
                WHERE id = NEW.action_id
            )
        WHERE id = NEW.id;
        
        -- Update book statistics
        UPDATE books SET 
            total_reading_sessions = total_reading_sessions + 1,
            total_characters_read = total_characters_read + NEW.number_of_characters,
            average_session_duration = (
                SELECT AVG(COALESCE(rl.session_duration_seconds, 0))::INTEGER
                FROM reading_logs rl
                WHERE rl.book_id = NEW.book_id
            )
        WHERE id = NEW.book_id;
        
        RETURN NEW;
    ELSIF TG_OP = 'DELETE' THEN
        -- Update book statistics on deletion
        UPDATE books SET 
            total_reading_sessions = GREATEST(total_reading_sessions - 1, 0),
            total_characters_read = GREATEST(total_characters_read - OLD.number_of_characters, 0),
            average_session_duration = (
                SELECT COALESCE(AVG(rl.session_duration_seconds)::INTEGER, 0)
                FROM reading_logs rl
                WHERE rl.book_id = OLD.book_id AND rl.id != OLD.id
            )
        WHERE id = OLD.book_id;
        
        RETURN OLD;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_book_stats_trigger
    AFTER INSERT OR DELETE ON reading_logs
    FOR EACH ROW EXECUTE FUNCTION update_book_stats();

-- Trigger to set action fields (date and duration)

CREATE OR REPLACE FUNCTION set_action_fields()
RETURNS TRIGGER AS $$
BEGIN
  NEW.action_date := NEW.start_time::DATE;
  IF NEW.end_time IS NOT NULL THEN
    NEW.duration_seconds := EXTRACT(EPOCH FROM (NEW.end_time - NEW.start_time))::INTEGER;
  ELSE
    NEW.duration_seconds := NULL;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;
CREATE TRIGGER set_action_fields_trigger
BEFORE INSERT OR UPDATE ON actions
FOR EACH ROW
EXECUTE FUNCTION set_action_fields();

-- Trigger to set reading log fields based on action start and end times

CREATE OR REPLACE FUNCTION set_reading_log_fields()
RETURNS TRIGGER AS $$
DECLARE
    action_start_time TIMESTAMP WITH TIME ZONE;
    action_end_time TIMESTAMP WITH TIME ZONE;
BEGIN
    -- Fetch start_time and end_time from the actions table
    SELECT start_time, end_time
    INTO action_start_time, action_end_time
    FROM actions
    WHERE id = NEW.action_id;

    -- Set reading_date
    NEW.reading_date := action_start_time::DATE;

    -- Calculate and set session_duration_seconds if end_time is available
    IF action_end_time IS NOT NULL THEN
        NEW.session_duration_seconds := EXTRACT(EPOCH FROM (action_end_time - action_start_time))::INTEGER;
    ELSE
        NEW.session_duration_seconds := NULL;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_reading_log_fields_trigger
BEFORE INSERT OR UPDATE ON reading_logs
FOR EACH ROW
EXECUTE FUNCTION set_reading_log_fields();