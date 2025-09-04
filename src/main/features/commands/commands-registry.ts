import type { ICommand, ICommandHandler, ICommandRegistry, ICommandService, ICommandsMap } from "~/shared/commands";
import type { Event } from "~/shared/event";
import type { IDisposable } from "~/shared/lifecycle";
import { Emitter } from "~/shared/event";
import { toDisposable } from "~/shared/lifecycle";
import { LinkedList } from "~/shared/linkedList";

export const CommandsRegistry: ICommandRegistry = new class implements ICommandRegistry {
  private readonly _commands = new Map<string, LinkedList<ICommand>>();
  private readonly _onDidRegisterCommand = new Emitter<string>();

  readonly onDidRegisterCommand: Event<string> = this._onDidRegisterCommand.event;

  registerCommand(idOrCommand: string | ICommand, handler?: ICommandHandler): IDisposable {
    if (!idOrCommand) {
      throw new Error("invalid command");
    }

    if (typeof idOrCommand === "string") {
      if (!handler) {
        throw new Error("invalid command");
      }
      return this.registerCommand({ id: idOrCommand, handler });
    }

    const { id } = idOrCommand;
    let commands = this._commands.get(id);
    if (!commands) {
      commands = new LinkedList<ICommand>();
      this._commands.set(id, commands);
    }

    const removeFn = commands.unshift(idOrCommand);

    const ret = toDisposable(() => {
      removeFn();
      const command = this._commands.get(id);
      if (command?.isEmpty()) {
        this._commands.delete(id);
      }
    });

    this._onDidRegisterCommand.fire(id);

    return ret;
  }

  registerCommandAlias(oldId: string, newId: string, service: ICommandService): IDisposable {
    return CommandsRegistry.registerCommand(oldId, (...args) => service.executeCommand(newId, ...args));
  }

  getCommand(id: string): ICommand | undefined {
    const list = this._commands.get(id);
    if (!list || list.isEmpty()) {
      return undefined;
    }
    // The most recently registered command is the first in the list.
    return list[Symbol.iterator]().next().value;
  }

  getCommands(): ICommandsMap {
    const result = new Map<string, ICommand>();
    for (const key of this._commands.keys()) {
      const command = this.getCommand(key);
      if (command) {
        result.set(key, command);
      }
    }
    return result;
  }
}();
