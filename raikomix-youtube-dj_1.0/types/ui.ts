export type DeckId = 'A' | 'B';

export type UIMode = 'basic' | 'pro';

// One-sheet hub routes (PR3 will wire these to actual panels)
export type SheetRoute = 'library' | 'queue' | 'fx' | 'pads' | 'settings';

export type UIState = {
  focusedDeck: DeckId;
  uiMode: UIMode;
  sheetOpen: boolean;
  sheetRoute: SheetRoute;
};
