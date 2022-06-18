export interface ITeam {
  id: number;
  name: string;
  score: number;
  pointMarque: number;
  isStaff: boolean;
  isReady: boolean;
  staffInfo: string;
}

export default class Team {
  id = 0;
  name = "";
  score = 0;
  pointMarque = 0;
  isStaff = false;
  isReady = false;
  staffInfo = "";

  constructor(params: ITeam) {
    Object.assign(this, params);
  }
}
