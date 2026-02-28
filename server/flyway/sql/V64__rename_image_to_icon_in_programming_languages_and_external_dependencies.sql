-- V64 Migration file
-- V64: Rename image Column to icon in programming_languages and external_dependencies Tables

   -- Verify programming_languages.image column exists (added by V63)
   DO $$
   BEGIN
       IF NOT EXISTS (
           SELECT 1 FROM information_schema.columns
           WHERE table_schema = 'public'
           AND table_name = 'programming_languages'
           AND column_name = 'image'
       ) THEN
           RAISE EXCEPTION 'Prerequisites not met: programming_languages.image column does not exist. V63 migration must be applied first.';
       END IF;
   END $$;

   -- Verify external_dependencies.image column exists (added by V63)
   DO $$
   BEGIN
       IF NOT EXISTS (
           SELECT 1 FROM information_schema.columns
           WHERE table_schema = 'public'
           AND table_name = 'external_dependencies'
           AND column_name = 'image'
       ) THEN
           RAISE EXCEPTION 'Prerequisites not met: external_dependencies.image column does not exist. V63 migration must be applied first.';
       END IF;
   END $$;

   -- Rename image column to icon in programming_languages
   ALTER TABLE public.programming_languages
   RENAME COLUMN image TO icon;

   -- Rename image column to icon in external_dependencies
   ALTER TABLE public.external_dependencies
   RENAME COLUMN image TO icon;

   -- Update documentation
   COMMENT ON COLUMN public.programming_languages.icon IS
   'Stores the icon URL, path, or identifier for visual representation.';

   COMMENT ON COLUMN public.external_dependencies.icon IS
   'Stores the icon URL, path, or identifier for visual representation.';

   -- Verify columns were renamed
   DO $$
   BEGIN
       IF EXISTS (
           SELECT 1 FROM information_schema.columns
           WHERE table_schema = 'public'
           AND table_name = 'programming_languages'
           AND column_name = 'icon'
       ) THEN
           RAISE NOTICE 'Success: programming_languages.image column renamed to icon';
       END IF;

       IF EXISTS (
           SELECT 1 FROM information_schema.columns
           WHERE table_schema = 'public'
           AND table_name = 'external_dependencies'
           AND column_name = 'icon'
       ) THEN
           RAISE NOTICE 'Success: external_dependencies.image column renamed to icon';
       END IF;
   END $$;
