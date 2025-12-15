CREATE TABLE IF NOT EXISTS public.types (
    -- Primary key: UUID with automatic generation
    id INTEGER GENERATED ALWAYS AS IDENTITY,
    
    name VARCHAR(100) NOT NULL,
    description VARCHAR(1000) NOT NULL,
   
    -- Primary key constraint
    CONSTRAINT types_pkey PRIMARY KEY (id)
    
)
TABLESPACE pg_default;