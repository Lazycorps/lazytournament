export interface ITeam {
    id: number;
    name: string;
}

export default class Team {
    id: number = 0
    name: string = '';

    constructor(params: ITeam){
        Object.assign(this, params);
    }
}