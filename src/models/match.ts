import type { ITeam } from "@/models/team";

export interface IMatch {
  id: number;
  round: number;
  field: number;
  team1: ITeam | null;
  team2: ITeam | null;
  phase: number;
  scoreTeam1: number;
  scoreTeam2: number;
  winner: string;
  amicalForTeam2: boolean;
}

export default class Match {
  id: number = 0;
  round: number = 0;
  field = 0;
  team1: ITeam | null = null;
  team2: ITeam | null = null;
  scoreTeam1: number = 0;
  scoreTeam2: number = 0;
  phase = 0;
  winner: string = "";
  amicalForTeam2: boolean = false;

  constructor(params: Partial<IMatch>) {
    Object.assign(this, params);
  }
}
