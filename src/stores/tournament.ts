import Team from "@/models/team";
import { defineStore } from "pinia";
import { useStorage } from '@vueuse/core'
import Match from "@/models/match";
import { shuffleArray } from "@/helper/functions";

export const useTournamentStore = defineStore({
    id: "tournament",
    state: () => ({
        rounds: useStorage("rounds", 1),
        fields: useStorage("fields", 1),
        teams: useStorage("teams", [] as Team[]),
        matches: useStorage<Match[]>("matches", [])
    }),
    getters: {
        split : (state) => Math.ceil(state.teams.length / (state.fields *2)),
        getByRound: (state) => {
            return (roundNumber: number) => state.matches.filter((m) => m.round == roundNumber);
        }
    },
    actions: {
        setRounds(rounds: number) {
            this.rounds = rounds;
        },
        setFields(fields: number) {
            this.fields = fields;
        },
        addTeam(name: string) {
            this.teams.push(new Team({ id: 0, name: name }));
        },
        deleteTeam(item: Team) {
            const index = this.teams.indexOf(item, 0);
            if (index > -1) {
                this.teams.splice(index, 1);
            }
        },
        generateRound(round: number) {
            this.matches = [];
            if (round == 1) {
                const shuffleTeams = [...this.teams];
                shuffleArray(shuffleTeams);
                let field = 1;
                for (let i = 0; i < shuffleTeams.length; i++) {
                    const isLastTeams = shuffleTeams.length <= i+1;
                    const match = new Match({
                        field,
                        round,
                        team1: shuffleTeams[i].name,
                        team2: !isLastTeams ? shuffleTeams[i+1].name : ''
                    });
                    this.matches.push(match);
                    
                    if(field >= this.fields) field = 1;
                    else field++;

                    i++;
                }
            }
        }
    },
});
