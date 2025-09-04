import type { Event } from "./event";
import type { IDisposable } from "./lifecycle";

export interface ICommandEvent {
  commandId: string;
  args: any[];
}

export interface ICommandService {
  readonly _serviceBrand: undefined;
  onWillExecuteCommand: Event<ICommandEvent>;
  onDidExecuteCommand: Event<ICommandEvent>;
  executeCommand: <T = any>(commandId: string, ...args: any[]) => Promise<T | undefined>;
}

export type ICommandsMap = Map<string, ICommand>;

export interface ICommandHandler {
  (...args: any[]): any;
}

export interface ICommand {
  id: string;
  handler: ICommandHandler;
  metadata?: ICommandMetadata | null;
}

export interface ICommandMetadata {
  description: string;
  args?: ReadonlyArray<{
    readonly name: string;
    readonly isOptional?: boolean;
    readonly description?: string;
  }>;
  returns?: string;
}

export interface ICommandRegistry {
  onDidRegisterCommand: Event<string>;
  registerCommand: ((id: string, command: ICommandHandler) => IDisposable) & ((command: ICommand) => IDisposable);
  registerCommandAlias: (oldId: string, newId: string, service: ICommandService) => IDisposable;
  getCommand: (id: string) => ICommand | undefined;
  getCommands: () => ICommandsMap;
}
