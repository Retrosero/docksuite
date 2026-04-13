class DomainAdapter:
    key = ""
    display_name = ""
    capabilities = {}

    def get_capabilities(self):
        return self.capabilities

    def build_capability_status(self, enabled_features, module_toggles):
        result = {}
        enabled_set = set(enabled_features or [])
        module_toggles = module_toggles or {}
        for capability_key, capability_cfg in self.get_capabilities().items():
            required_features = capability_cfg.get("required_features") or []
            required_modules = capability_cfg.get("required_modules") or []
            is_feature_ready = all(flag in enabled_set for flag in required_features)
            is_module_ready = all(bool(module_toggles.get(name, False)) for name in required_modules)
            result[capability_key] = {
                "label": capability_cfg.get("label") or capability_key,
                "required_features": required_features,
                "required_modules": required_modules,
                "doctype_scope": capability_cfg.get("doctype_scope") or [],
                "enabled": bool(is_feature_ready and is_module_ready),
            }
        return result

