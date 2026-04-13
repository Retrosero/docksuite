export type DomainCapability = {
  enabled: boolean;
  label: string;
};

export type DomainContext = {
  domain: {
    key: string;
    is_enabled: boolean;
  };
  capabilities: Record<string, DomainCapability>;
};

export type PlatformContextResponse = {
  domains: DomainContext[];
};

