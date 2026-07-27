
export const PERMISSIONS = {
  USER_VIEW: "user:view",
  USER_CREATE: "user:create",
  USER_UPDATE: "user:update",
  USER_DELETE: "user:delete",

  DRUG_VIEW: "drug:view",
  DRUG_CREATE: "drug:create",
  DRUG_UPDATE: "drug:update",
  DRUG_DELETE: "drug:delete",

  INVENTORY_VIEW: "inventory:view",
  INVENTORY_RECEIVE: "inventory:receive",
  INVENTORY_ADJUST: "inventory:adjust",
  INVENTORY_TRANSFER: "inventory:transfer",

  ORDER_VIEW: "order:view",
  ORDER_CREATE: "order:create",
  ORDER_APPROVE: "order:approve",
  ORDER_CANCEL: "order:cancel",
  ORDER_RECEIVE: "order:cancel",

  REPORT_VIEW: "report:view",

  AUDIT_VIEW: "audit:view",

  FACILITY_VIEW: "facility:view",
  FACILITY_CREATE: "facility:create",
  FACILITY_UPDATE: "facility:update",

  NOTIFICATION_VIEW: "notification:view",

  SETTINGS_UPDATE: "settings:update",
} as const;