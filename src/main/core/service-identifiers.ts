export const ServiceIdentifiers = {
  // Application-level services
  ILifecycleMainService: Symbol.for("ILifecycleMainService"),

  // Feature services
  IEnvironmentService: Symbol.for("IEnvironmentService"),
  ISettingsService: Symbol.for("ISettingsService"),
  IShortcutsService: Symbol.for("IShortcutsService"),
  ICommandService: Symbol.for("ICommandService"),
  IWindowsMainService: Symbol.for("IWindowsMainService"),
};
