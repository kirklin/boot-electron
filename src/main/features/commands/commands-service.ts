import type { ICommandEvent, ICommandService } from "~/shared/commands";
import type { Event } from "~/shared/event";
import { singleton } from "tsyringe";
import { Emitter } from "~/shared/event";
import { Disposable } from "~/shared/lifecycle";
import { CommandsRegistry } from "./commands-registry";

@singleton()
export class CommandsService extends Disposable implements ICommandService {
  declare readonly _serviceBrand: undefined;

  private readonly _onWillExecuteCommand = this._register(new Emitter<ICommandEvent>());
  public readonly onWillExecuteCommand: Event<ICommandEvent> = this._onWillExecuteCommand.event;

  private readonly _onDidExecuteCommand = this._register(new Emitter<ICommandEvent>());
  public readonly onDidExecuteCommand: Event<ICommandEvent> = this._onDidExecuteCommand.event;

  constructor() {
    super();
  }

  async executeCommand<T>(id: string, ...args: any[]): Promise<T | undefined> {
    const command = CommandsRegistry.getCommand(id);
    if (!command) {
      return Promise.reject(new Error(`command '${id}' not found`));
    }

    try {
      this._onWillExecuteCommand.fire({ commandId: id, args });
      // We can directly call the handler. If the command needs services,
      // it should be registered with access to the container.
      const result = command.handler(...args);
      this._onDidExecuteCommand.fire({ commandId: id, args });
      return Promise.resolve(result);
    } catch (err) {
      return Promise.reject(err);
    }
  }
}
