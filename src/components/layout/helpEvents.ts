/** Lets the navbar's help icon open the floating help popover. */
export const OPEN_HELP_EVENT = 'vantage:open-help';
export const openHelp = () => window.dispatchEvent(new Event(OPEN_HELP_EVENT));
