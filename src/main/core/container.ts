const serviceRegistry = new Map<symbol, unknown>();

export const container = {
  register<T>(id: symbol, instance: T): void {
    if (!serviceRegistry.has(id)) {
      serviceRegistry.set(id, instance);
    }
  },

  get<T>(id: symbol): T {
    const instance = serviceRegistry.get(id) as T;
    if (!instance) {
      throw new Error(`Service not found for id: ${id.toString()}`);
    }
    return instance;
  },
};
