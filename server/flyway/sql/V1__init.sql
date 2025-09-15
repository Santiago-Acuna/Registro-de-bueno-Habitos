--
-- PostgreSQL database dump
--

\restrict CCDo7eGBFKvma7g6LvM5W3wYlbNjxeyDEHf1gw6QbK0JZWc38s8xf6VYLA9AA1p

-- Dumped from database version 17.6
-- Dumped by pg_dump version 17.6

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: pg_stat_statements; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS pg_stat_statements WITH SCHEMA public;


--
-- Name: EXTENSION pg_stat_statements; Type: COMMENT; Schema: -; Owner: 
--

COMMENT ON EXTENSION pg_stat_statements IS 'track planning and execution statistics of all SQL statements executed';


--
-- Name: habit_complexity; Type: TYPE; Schema: public; Owner: flyway_admin
--

CREATE TYPE public.habit_complexity AS ENUM (
    'Complex',
    'Simple',
    'Without Intervals'
);


ALTER TYPE public.habit_complexity OWNER TO flyway_admin;

--
-- Name: set_action_fields(); Type: FUNCTION; Schema: public; Owner: flyway_admin
--

CREATE FUNCTION public.set_action_fields() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
  NEW.action_date := NEW.start_time::DATE;
  IF NEW.end_time IS NOT NULL THEN
    NEW.duration_seconds := EXTRACT(EPOCH FROM (NEW.end_time - NEW.start_time))::INTEGER;
  ELSE
    NEW.duration_seconds := NULL;
  END IF;
  RETURN NEW;
END;
$$;


ALTER FUNCTION public.set_action_fields() OWNER TO flyway_admin;

--
-- Name: set_reading_log_fields(); Type: FUNCTION; Schema: public; Owner: flyway_admin
--

CREATE FUNCTION public.set_reading_log_fields() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
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
$$;


ALTER FUNCTION public.set_reading_log_fields() OWNER TO flyway_admin;

--
-- Name: update_book_stats(); Type: FUNCTION; Schema: public; Owner: flyway_admin
--

CREATE FUNCTION public.update_book_stats() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
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
$$;


ALTER FUNCTION public.update_book_stats() OWNER TO flyway_admin;

--
-- Name: update_habit_stats(); Type: FUNCTION; Schema: public; Owner: flyway_admin
--

CREATE FUNCTION public.update_habit_stats() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
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
$$;


ALTER FUNCTION public.update_habit_stats() OWNER TO flyway_admin;

--
-- Name: update_updated_at_column(); Type: FUNCTION; Schema: public; Owner: flyway_admin
--

CREATE FUNCTION public.update_updated_at_column() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$;


ALTER FUNCTION public.update_updated_at_column() OWNER TO flyway_admin;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: actions; Type: TABLE; Schema: public; Owner: flyway_admin
--

CREATE TABLE public.actions (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    habit_id uuid NOT NULL,
    start_time timestamp with time zone NOT NULL,
    end_time timestamp with time zone,
    duration_seconds integer,
    action_date date,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    CONSTRAINT actions_reasonable_duration CHECK (((end_time IS NULL) OR (EXTRACT(epoch FROM (end_time - start_time)) <= (86400)::numeric))),
    CONSTRAINT actions_start_time_not_future CHECK ((start_time <= CURRENT_TIMESTAMP)),
    CONSTRAINT actions_time_sequence CHECK (((end_time IS NULL) OR (end_time > start_time)))
);


ALTER TABLE public.actions OWNER TO flyway_admin;

--
-- Name: books; Type: TABLE; Schema: public; Owner: flyway_admin
--

CREATE TABLE public.books (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    name character varying(100) NOT NULL,
    image text,
    total_pages integer NOT NULL,
    current_page integer DEFAULT 0 NOT NULL,
    average_of_characters_per_minute double precision,
    author character varying(100),
    genre character varying(50),
    completion_percentage numeric(5,2) GENERATED ALWAYS AS (
CASE
    WHEN (total_pages > 0) THEN round((((current_page)::numeric / (total_pages)::numeric) * (100)::numeric), 2)
    ELSE (0)::numeric
END) STORED,
    total_reading_sessions integer DEFAULT 0 NOT NULL,
    total_characters_read bigint DEFAULT 0 NOT NULL,
    average_session_duration integer DEFAULT 0 NOT NULL,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    is_active boolean DEFAULT true NOT NULL,
    CONSTRAINT books_current_page_valid CHECK (((current_page >= 0) AND (current_page <= total_pages))),
    CONSTRAINT books_image_size CHECK ((length(image) <= 2097152)),
    CONSTRAINT books_name_not_empty CHECK ((length(TRIM(BOTH FROM name)) > 0)),
    CONSTRAINT books_pages_positive CHECK ((total_pages > 0)),
    CONSTRAINT books_reading_rate_positive CHECK (((average_of_characters_per_minute IS NULL) OR (average_of_characters_per_minute > (0)::double precision)))
);


ALTER TABLE public.books OWNER TO flyway_admin;

--
-- Name: flyway_schema_history; Type: TABLE; Schema: public; Owner: flyway_admin
--

CREATE TABLE public.flyway_schema_history (
    installed_rank integer NOT NULL,
    version character varying(50),
    description character varying(200) NOT NULL,
    type character varying(20) NOT NULL,
    script character varying(1000) NOT NULL,
    checksum integer,
    installed_by character varying(100) NOT NULL,
    installed_on timestamp without time zone DEFAULT now() NOT NULL,
    execution_time integer NOT NULL,
    success boolean NOT NULL
);


ALTER TABLE public.flyway_schema_history OWNER TO flyway_admin;

--
-- Name: habits; Type: TABLE; Schema: public; Owner: flyway_admin
--

CREATE TABLE public.habits (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    name character varying(50) NOT NULL,
    habit_type public.habit_complexity NOT NULL,
    logo text,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    is_active boolean DEFAULT true NOT NULL,
    total_actions_count integer DEFAULT 0 NOT NULL,
    last_action_date timestamp with time zone,
    CONSTRAINT habits_logo_size CHECK ((length(logo) <= 2097152)),
    CONSTRAINT habits_name_not_empty CHECK ((length(TRIM(BOTH FROM name)) > 0))
);


ALTER TABLE public.habits OWNER TO flyway_admin;

--
-- Name: reading_logs; Type: TABLE; Schema: public; Owner: flyway_admin
--

CREATE TABLE public.reading_logs (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    action_id uuid NOT NULL,
    book_id uuid NOT NULL,
    number_of_characters integer NOT NULL,
    breaths integer NOT NULL,
    number_of_characters_per_minute double precision NOT NULL,
    number_of_breaths_per_minute double precision NOT NULL,
    using_voice boolean DEFAULT false NOT NULL,
    reading_date date,
    session_duration_seconds integer,
    reading_efficiency numeric(5,2) GENERATED ALWAYS AS (
CASE
    WHEN (number_of_breaths_per_minute > (0)::double precision) THEN round(((number_of_characters_per_minute / number_of_breaths_per_minute))::numeric, 2)
    ELSE NULL::numeric
END) STORED,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    CONSTRAINT reading_logs_breath_rate_positive CHECK ((number_of_breaths_per_minute > (0)::double precision)),
    CONSTRAINT reading_logs_breaths_positive CHECK ((breaths > 0)),
    CONSTRAINT reading_logs_char_rate_positive CHECK ((number_of_characters_per_minute > (0)::double precision)),
    CONSTRAINT reading_logs_characters_positive CHECK ((number_of_characters > 0)),
    CONSTRAINT reading_logs_reasonable_breath_rate CHECK (((number_of_breaths_per_minute >= (0)::double precision) AND (number_of_breaths_per_minute <= (60)::double precision))),
    CONSTRAINT reading_logs_reasonable_char_rate CHECK ((number_of_characters_per_minute <= (10000)::double precision))
);


ALTER TABLE public.reading_logs OWNER TO flyway_admin;

--
-- Name: actions actions_pkey; Type: CONSTRAINT; Schema: public; Owner: flyway_admin
--

ALTER TABLE ONLY public.actions
    ADD CONSTRAINT actions_pkey PRIMARY KEY (id);


--
-- Name: books books_pkey; Type: CONSTRAINT; Schema: public; Owner: flyway_admin
--

ALTER TABLE ONLY public.books
    ADD CONSTRAINT books_pkey PRIMARY KEY (id);


--
-- Name: flyway_schema_history flyway_schema_history_pk; Type: CONSTRAINT; Schema: public; Owner: flyway_admin
--

ALTER TABLE ONLY public.flyway_schema_history
    ADD CONSTRAINT flyway_schema_history_pk PRIMARY KEY (installed_rank);


--
-- Name: habits habits_pkey; Type: CONSTRAINT; Schema: public; Owner: flyway_admin
--

ALTER TABLE ONLY public.habits
    ADD CONSTRAINT habits_pkey PRIMARY KEY (id);


--
-- Name: reading_logs reading_logs_action_id_key; Type: CONSTRAINT; Schema: public; Owner: flyway_admin
--

ALTER TABLE ONLY public.reading_logs
    ADD CONSTRAINT reading_logs_action_id_key UNIQUE (action_id);


--
-- Name: reading_logs reading_logs_pkey; Type: CONSTRAINT; Schema: public; Owner: flyway_admin
--

ALTER TABLE ONLY public.reading_logs
    ADD CONSTRAINT reading_logs_pkey PRIMARY KEY (id);


--
-- Name: flyway_schema_history_s_idx; Type: INDEX; Schema: public; Owner: flyway_admin
--

CREATE INDEX flyway_schema_history_s_idx ON public.flyway_schema_history USING btree (success);


--
-- Name: idx_actions_date; Type: INDEX; Schema: public; Owner: flyway_admin
--

CREATE INDEX idx_actions_date ON public.actions USING btree (action_date);


--
-- Name: idx_actions_date_range; Type: INDEX; Schema: public; Owner: flyway_admin
--

CREATE INDEX idx_actions_date_range ON public.actions USING btree (start_time, end_time) WHERE (end_time IS NOT NULL);


--
-- Name: idx_actions_duration; Type: INDEX; Schema: public; Owner: flyway_admin
--

CREATE INDEX idx_actions_duration ON public.actions USING btree (duration_seconds) WHERE (duration_seconds IS NOT NULL);


--
-- Name: idx_actions_habit_date; Type: INDEX; Schema: public; Owner: flyway_admin
--

CREATE INDEX idx_actions_habit_date ON public.actions USING btree (habit_id, action_date);


--
-- Name: idx_actions_habit_duration; Type: INDEX; Schema: public; Owner: flyway_admin
--

CREATE INDEX idx_actions_habit_duration ON public.actions USING btree (habit_id, duration_seconds) WHERE (duration_seconds IS NOT NULL);


--
-- Name: idx_actions_habit_id; Type: INDEX; Schema: public; Owner: flyway_admin
--

CREATE INDEX idx_actions_habit_id ON public.actions USING btree (habit_id);


--
-- Name: idx_actions_habit_start_time; Type: INDEX; Schema: public; Owner: flyway_admin
--

CREATE INDEX idx_actions_habit_start_time ON public.actions USING btree (habit_id, start_time DESC);


--
-- Name: idx_actions_start_time; Type: INDEX; Schema: public; Owner: flyway_admin
--

CREATE INDEX idx_actions_start_time ON public.actions USING btree (start_time DESC);


--
-- Name: idx_books_author; Type: INDEX; Schema: public; Owner: flyway_admin
--

CREATE INDEX idx_books_author ON public.books USING btree (author) WHERE (author IS NOT NULL);


--
-- Name: idx_books_completion; Type: INDEX; Schema: public; Owner: flyway_admin
--

CREATE INDEX idx_books_completion ON public.books USING btree (completion_percentage);


--
-- Name: idx_books_genre; Type: INDEX; Schema: public; Owner: flyway_admin
--

CREATE INDEX idx_books_genre ON public.books USING btree (genre) WHERE (genre IS NOT NULL);


--
-- Name: idx_books_name; Type: INDEX; Schema: public; Owner: flyway_admin
--

CREATE INDEX idx_books_name ON public.books USING btree (name) WHERE (is_active = true);


--
-- Name: idx_books_total_sessions; Type: INDEX; Schema: public; Owner: flyway_admin
--

CREATE INDEX idx_books_total_sessions ON public.books USING btree (total_reading_sessions DESC);


--
-- Name: idx_habits_created_at; Type: INDEX; Schema: public; Owner: flyway_admin
--

CREATE INDEX idx_habits_created_at ON public.habits USING btree (created_at);


--
-- Name: idx_habits_last_action; Type: INDEX; Schema: public; Owner: flyway_admin
--

CREATE INDEX idx_habits_last_action ON public.habits USING btree (last_action_date DESC) WHERE (last_action_date IS NOT NULL);


--
-- Name: idx_habits_name_active; Type: INDEX; Schema: public; Owner: flyway_admin
--

CREATE UNIQUE INDEX idx_habits_name_active ON public.habits USING btree (name) WHERE (is_active = true);


--
-- Name: idx_habits_type_active; Type: INDEX; Schema: public; Owner: flyway_admin
--

CREATE INDEX idx_habits_type_active ON public.habits USING btree (habit_type, is_active) WHERE (is_active = true);


--
-- Name: idx_reading_logs_book_date; Type: INDEX; Schema: public; Owner: flyway_admin
--

CREATE INDEX idx_reading_logs_book_date ON public.reading_logs USING btree (book_id, reading_date);


--
-- Name: idx_reading_logs_book_id; Type: INDEX; Schema: public; Owner: flyway_admin
--

CREATE INDEX idx_reading_logs_book_id ON public.reading_logs USING btree (book_id);


--
-- Name: idx_reading_logs_char_rate; Type: INDEX; Schema: public; Owner: flyway_admin
--

CREATE INDEX idx_reading_logs_char_rate ON public.reading_logs USING btree (number_of_characters_per_minute);


--
-- Name: idx_reading_logs_date; Type: INDEX; Schema: public; Owner: flyway_admin
--

CREATE INDEX idx_reading_logs_date ON public.reading_logs USING btree (reading_date);


--
-- Name: idx_reading_logs_efficiency; Type: INDEX; Schema: public; Owner: flyway_admin
--

CREATE INDEX idx_reading_logs_efficiency ON public.reading_logs USING btree (reading_efficiency) WHERE (reading_efficiency IS NOT NULL);


--
-- Name: idx_reading_logs_voice; Type: INDEX; Schema: public; Owner: flyway_admin
--

CREATE INDEX idx_reading_logs_voice ON public.reading_logs USING btree (using_voice, book_id);


--
-- Name: actions set_action_fields_trigger; Type: TRIGGER; Schema: public; Owner: flyway_admin
--

CREATE TRIGGER set_action_fields_trigger BEFORE INSERT OR UPDATE ON public.actions FOR EACH ROW EXECUTE FUNCTION public.set_action_fields();


--
-- Name: reading_logs set_reading_log_fields_trigger; Type: TRIGGER; Schema: public; Owner: flyway_admin
--

CREATE TRIGGER set_reading_log_fields_trigger BEFORE INSERT OR UPDATE ON public.reading_logs FOR EACH ROW EXECUTE FUNCTION public.set_reading_log_fields();


--
-- Name: actions update_actions_updated_at; Type: TRIGGER; Schema: public; Owner: flyway_admin
--

CREATE TRIGGER update_actions_updated_at BEFORE UPDATE ON public.actions FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: reading_logs update_book_stats_trigger; Type: TRIGGER; Schema: public; Owner: flyway_admin
--

CREATE TRIGGER update_book_stats_trigger AFTER INSERT OR DELETE ON public.reading_logs FOR EACH ROW EXECUTE FUNCTION public.update_book_stats();


--
-- Name: books update_books_updated_at; Type: TRIGGER; Schema: public; Owner: flyway_admin
--

CREATE TRIGGER update_books_updated_at BEFORE UPDATE ON public.books FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: actions update_habit_stats_trigger; Type: TRIGGER; Schema: public; Owner: flyway_admin
--

CREATE TRIGGER update_habit_stats_trigger AFTER INSERT OR DELETE ON public.actions FOR EACH ROW EXECUTE FUNCTION public.update_habit_stats();


--
-- Name: habits update_habits_updated_at; Type: TRIGGER; Schema: public; Owner: flyway_admin
--

CREATE TRIGGER update_habits_updated_at BEFORE UPDATE ON public.habits FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: reading_logs update_reading_logs_updated_at; Type: TRIGGER; Schema: public; Owner: flyway_admin
--

CREATE TRIGGER update_reading_logs_updated_at BEFORE UPDATE ON public.reading_logs FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: actions fk_actions_habit_id; Type: FK CONSTRAINT; Schema: public; Owner: flyway_admin
--

ALTER TABLE ONLY public.actions
    ADD CONSTRAINT fk_actions_habit_id FOREIGN KEY (habit_id) REFERENCES public.habits(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: reading_logs fk_reading_logs_action_id; Type: FK CONSTRAINT; Schema: public; Owner: flyway_admin
--

ALTER TABLE ONLY public.reading_logs
    ADD CONSTRAINT fk_reading_logs_action_id FOREIGN KEY (action_id) REFERENCES public.actions(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: reading_logs fk_reading_logs_book_id; Type: FK CONSTRAINT; Schema: public; Owner: flyway_admin
--

ALTER TABLE ONLY public.reading_logs
    ADD CONSTRAINT fk_reading_logs_book_id FOREIGN KEY (book_id) REFERENCES public.books(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- PostgreSQL database dump complete
--

\unrestrict CCDo7eGBFKvma7g6LvM5W3wYlbNjxeyDEHf1gw6QbK0JZWc38s8xf6VYLA9AA1p

