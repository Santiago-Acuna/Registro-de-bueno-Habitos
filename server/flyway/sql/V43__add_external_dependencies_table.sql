CREATE TABLE IF NOT EXISTS public.external_dependencies (
    -- Primary key: UUID with automatic generation
    id INTEGER GENERATED ALWAYS AS IDENTITY,
    name VARCHAR(100) NOT NULL,
    programming_language_id INTEGER NOT NULL,
   
    -- Primary key constraint
    CONSTRAINT external_dependencies_pkey PRIMARY KEY (id)
    
)
TABLESPACE pg_default;