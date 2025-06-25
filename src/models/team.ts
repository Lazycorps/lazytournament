export interface ITeam {
  id: number;
  name: string;
  score: number;
  pointMarque: number;
  isReady: boolean;
  membre: string;
}

export default class Team implements ITeam {
  id = 0;
  name = "";
  score = 0;
  pointMarque = 0;
  isReady = false;
  membre = "";

  constructor(params: ITeam) {
    Object.assign(this, params);
  }
}
