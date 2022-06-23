export interface ITeam {
  id: number;
  name: string;
  score: number;
  pointMarque: number;
  isStaff: boolean;
  isReady: boolean;
  staffInfo: string;
  membre: string;
  boule: boolean;
}

export default class Team {
  id = 0;
  name = "";
  score = 0;
  pointMarque = 0;
  isStaff = false;
  isReady = false;
  staffInfo = "";
  boule = false;
  membre = "";

  constructor(params: ITeam) {
    Object.assign(this, params);
  }
}
