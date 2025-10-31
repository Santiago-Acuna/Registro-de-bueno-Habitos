CREATE TABLE IF NOT EXISTS public.subtypes (
    -- Primary key: UUID with automatic generation
    id INTEGER GENERATED ALWAYS AS IDENTITY,
    type_id INTEGER NOT NULL,
    name VARCHAR(100) NOT NULL,
    description VARCHAR(1000) NOT NULL,
   
    -- Primary key constraint
    CONSTRAINT subtypes_pkey PRIMARY KEY (id)
    
)
TABLESPACE pg_default;