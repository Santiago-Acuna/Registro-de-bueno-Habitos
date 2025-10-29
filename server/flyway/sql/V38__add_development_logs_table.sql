CREATE TABLE IF NOT EXISTS public.development_logs (
    -- Primary key: UUID with automatic generation
    id UUID NOT NULL DEFAULT gen_random_uuid(),
    
    -- Action type identification
    commit_name VARCHAR(255) NOT NULL,
    description VARCHAR(2000) NOT NULL,
    commit_hash VARCHAR(1000) NOT NULL,
    is_for_me BOOLEAN NOT NULL,
     
    -- Audit timestamps
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    
    action_id UUID NOT NULL,
    features_id UUID DEFAULT NULL,
    commit_size_id INTEGER NOT NULL,
    commit_importance_id INTEGER NOT NULL,
    programming_language_id INTEGER NOT NULL,
    external_dependency_id INTEGER,
        
    -- Primary key constraint
    CONSTRAINT development_logs_pkey PRIMARY KEY (id)
    
)
TABLESPACE pg_default;