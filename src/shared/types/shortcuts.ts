/**
 * Represents a keybinding that maps a keyboard shortcut to a command.
 */
export interface Keybinding {
  /**
   * A human-readable name for the shortcut, used in the UI.
   * e.g., "Save File", "Toggle Developer Tools"
   */
  name: string;

  /**
   * The command to execute when the key is pressed.
   * e.g., "app.quit", "editor.action.save"
   */
  command: string;

  /**
   * The key combination.
   * e.g., "CmdOrCtrl+S", "F1", "Shift+Tab"
   */
  key: string;

  /**
   * The context in which this keybinding is active.
   * (This is for future extension and is not yet implemented)
   * e.g., "editorTextFocus", "!isMac"
   */
  when?: string;

  /**
   * Indicates the origin of the keybinding.
   * 'default' for system-provided, 'user' for user-defined.
   */
  source: "default" | "user";
}
