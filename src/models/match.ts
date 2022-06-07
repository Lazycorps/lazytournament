export interface IMatch {
    id: number;
    round: number;
    field: number;
    team1: string;
    team2: string;
    scoreTeam1: number;
    scoreTeam2: number;
}

export default class Match {
    id: number = 0;
    round: number = 0;
    field = 0;
    team1: string = '';
    team2: string = '';
    scoreTeam1: number = 0;
    scoreTeam2: number = 0;
    winner: string = '';

    constructor(params: Partial<IMatch>) {
        Object.assign(this, params);
    }

    public getWinner() {
        this.scoreTeam1 > this.scoreTeam2 ? this.team1 : this.team2;
    }
}