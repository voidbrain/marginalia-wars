export interface StageDef {
  readonly id: string;
  readonly name: string;
  readonly latinTitle: string;
  readonly background: string;
  /** Ground line as a fraction of stage height. */
  readonly groundY: number;
  readonly accent: string;
}

export const STAGES: readonly StageDef[] = [
  {
    id: 'meadow',
    name: 'The Battle Meadow',
    latinTitle: 'PRIEL — IN PRATO PROELIO',
    background: 'assets/backgrounds/arena-meadow.jpg',
    groundY: 0.86,
    accent: '#7a8b3f',
  },
  {
    id: 'castle',
    name: 'Castle of the Lady',
    latinTitle: 'CASTELLUM DOMINAE',
    background: 'assets/backgrounds/arena-castle.jpg',
    groundY: 0.86,
    accent: '#5d6470',
  },
  {
    id: 'scriptorium',
    name: 'The Scriptorium',
    latinTitle: 'IN SCRIPTORIO LUCTAMUS',
    background: 'assets/backgrounds/arena-scriptorium.jpg',
    groundY: 0.86,
    accent: '#6c5f8a',
  },
  {
    id: 'grotesque',
    name: 'The Grotesque Margin',
    latinTitle: 'MARGO GROTESCORUM',
    background: 'assets/backgrounds/arena-grotesque.jpg',
    groundY: 0.86,
    accent: '#9a3b2e',
  },
  {
    id: 'banner',
    name: 'Before the Herald',
    latinTitle: 'CLAMATE — HERALDI LOCUTUNTUR',
    background: 'assets/backgrounds/arena-banner.jpg',
    groundY: 0.86,
    accent: '#b18a2e',
  },
];

export function stageById(id: string): StageDef | undefined {
  return STAGES.find((s) => s.id === id);
}
