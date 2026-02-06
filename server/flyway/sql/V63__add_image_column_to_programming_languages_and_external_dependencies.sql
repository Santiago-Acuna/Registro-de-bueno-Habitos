-- V63 Migration file
-- V63: Add image Column to programming_languages and external_dependencies Tables

   -- Verify programming_languages table exists
   DO $$
   BEGIN
       IF NOT EXISTS (
           SELECT 1 FROM information_schema.tables
           WHERE table_schema = 'public'
           AND table_name = 'programming_languages'
       ) THEN
           RAISE EXCEPTION 'Prerequisites not met: programming_languages table does not exist. V42 migration must be    
   applied first.';
       END IF;
   END $$;

   -- Verify external_dependencies table exists
   DO $$
   BEGIN
       IF NOT EXISTS (
           SELECT 1 FROM information_schema.tables
           WHERE table_schema = 'public'
           AND table_name = 'external_dependencies'
       ) THEN
           RAISE EXCEPTION 'Prerequisites not met: external_dependencies table does not exist. V43 migration must be    
   applied first.';
       END IF;
   END $$;

   -- Add image column to programming_languages
   ALTER TABLE public.programming_languages
   ADD COLUMN IF NOT EXISTS image TEXT DEFAULT NULL;

   -- Add image column to external_dependencies
   ALTER TABLE public.external_dependencies
   ADD COLUMN IF NOT EXISTS image TEXT DEFAULT NULL;

   -- Add documentation
   COMMENT ON COLUMN public.programming_languages.image IS
   'Stores the image URL, path, or identifier for visual representation.';

   COMMENT ON COLUMN public.external_dependencies.image IS
   'Stores the image URL, path, or identifier for visual representation.';

   -- Verify columns were added
   DO $$
   BEGIN
       IF EXISTS (
           SELECT 1 FROM information_schema.columns
           WHERE table_schema = 'public'
           AND table_name = 'programming_languages'
           AND column_name = 'image'
       ) THEN
           RAISE NOTICE 'Success: programming_languages.image column added';
       END IF;

       IF EXISTS (
           SELECT 1 FROM information_schema.columns
           WHERE table_schema = 'public'
           AND table_name = 'external_dependencies'
           AND column_name = 'image'
       ) THEN
           RAISE NOTICE 'Success: external_dependencies.image column added';
       END IF;
   END $$;