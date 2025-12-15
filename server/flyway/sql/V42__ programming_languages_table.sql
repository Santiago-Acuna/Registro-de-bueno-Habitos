CREATE TABLE IF NOT EXISTS public.programming_languages (
    -- Primary key: UUID with automatic generation
    id INTEGER GENERATED ALWAYS AS IDENTITY,
    name VARCHAR(50) NOT NULL,
   
    -- Primary key constraint
    CONSTRAINT programming_languages_pkey PRIMARY KEY (id)
    
)
TABLESPACE pg_default;