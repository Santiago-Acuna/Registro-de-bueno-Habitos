CREATE TABLE IF NOT EXISTS public.features (
    -- Primary key: UUID with automatic generation
    id UUID NOT NULL DEFAULT gen_random_uuid(),
    
    name VARCHAR(50) NOT NULL,
    description VARCHAR(1000) NOT NULL,
   
    -- Primary key constraint
    CONSTRAINT features_pkey PRIMARY KEY (id)
    
)
TABLESPACE pg_default;