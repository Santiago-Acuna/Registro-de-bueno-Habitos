ALTER TABLE development_logs
    ADD CONSTRAINT development_logs_action_logs_fk FOREIGN KEY (action_id) REFERENCES public.action_logs(id),
    ADD CONSTRAINT development_logs_features_fk FOREIGN KEY (features_id) REFERENCES public.features(id),
    ADD CONSTRAINT development_logs_commit_size_fk FOREIGN KEY (commit_size_id) REFERENCES public.subtypes(id),
    ADD CONSTRAINT development_logs_commit_importance_fk FOREIGN KEY (commit_importance_id) REFERENCES public.subtypes(id),
    ADD CONSTRAINT development_logs_programming_languages_fk FOREIGN KEY (programming_language_id) REFERENCES public.programming_languages(id),
    ADD CONSTRAINT development_logs_external_dependencies_fk FOREIGN KEY (external_dependency_id) REFERENCES public.external_dependencies(id)