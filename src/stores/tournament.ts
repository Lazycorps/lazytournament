import Team from "@/models/team";
import { defineStore } from "pinia";
import { useStorage } from "@vueuse/core";
import Match from "@/models/match";
import { shuffleArray } from "@/helper/functions";

export const useTournamentStore = defineStore({
  id: "tournament",
  state: () => ({
    rounds: useStorage("rounds", 1),
    fields: useStorage("fields", 1),
    teams: useStorage("teams", [] as Team[]),
    matches: useStorage<Match[]>("matches", []),
  }),
  getters: {
    split: (state) => Math.ceil(state.teams.length / (state.fields * 2)),
    getTeamsByScore: (state) =>
      state.teams
        .sort((t1, t2) => t2.score - t1.score || t2.pointMarque - t1.pointMarque),
    getByRound: (state) => {
      return (roundNumber: number) =>
        state.matches.filter((m) => m.round == roundNumber);
    },
    getTeamScore: (state) => {
      return (teamName: string) => {
        const teamMatch = state.matches.filter(
          (m) => m.team1 == teamName || m.team2 == teamName
        );
        let score = teamMatch.filter((m) => m.winner == teamName).length * 3;
        score += teamMatch.filter((m) => m.winner == "Null").length * 1;
        return score;
      };
    },
    getTeamPointMarque: (state) => {
      return (teamName: string) => {
        const teamMatch = state.matches.filter(
          (m) => m.team1 == teamName || m.team2 == teamName
        );
        let point = 0;
        teamMatch.forEach((element) => {
          if (element.team1 == teamName) point += element.scoreTeam1;
          else point += element.scoreTeam2;
        });
        return point;
      };
    },
    getTeamStaffInfo: (state) => {
      return (teamName: string) => {
        const team = state.teams.filter((m) => m.name == teamName)[0];
        return team.isStaf ? ` (${team.staffInfo})` : "";
      };
    },
    getTeamMatches: (state) => {
      return (teamName: string) =>
        state.matches.filter((m) => m.team1 == teamName || m.team2 == teamName);
    },
  },
  actions: {
    setRounds(rounds: number) {
      this.rounds = rounds;
    },
    setFields(fields: number) {
      this.fields = fields;
    },
    addTeam(name: string) {
      this.teams.push(
        new Team({
          id: this.teams.length + 1,
          name: name,
          score: 0,
          pointMarque: 0,
          isStaff: false,
          staffInfo: "",
          isReady: false,
        })
      );
    },
    deleteTeam(item: Team) {
      const index = this.teams.indexOf(item, 0);
      if (index > -1) {
        this.teams.splice(index, 1);
      }
    },
    generateRound(round: number) {
      const roundMatch = this.matches.filter((m) => m.round == round);
      roundMatch.forEach((m) =>
        this.matches.splice(this.matches.indexOf(m), 1)
      );
      if (round == 1) {
        this.teams.forEach((t) => (t.score = 0));
        const shuffleTeams = [...this.teams];
        shuffleArray(shuffleTeams);
        let field = 1;
        for (let i = 0; i < shuffleTeams.length; i++) {
          const isLastTeams = shuffleTeams.length <= i + 1;
          const match = new Match({
            field,
            round,
            team1: shuffleTeams[i].name,
            team2: !isLastTeams ? shuffleTeams[i + 1].name : "",
          });
          this.matches.push(match);

          if (field >= this.fields) field = 1;
          else field++;

          i++;
        }
      } else {
        const teamsToPair = [...this.getTeamsByScore];
        let field = 1;

        for (let i = 0; i < teamsToPair.length; i++) {
          const firstTeam = teamsToPair[i];
          let secondTeam: any = null;
          teamsToPair.splice(i, 1);

          for (let j = 0; j < teamsToPair.length; j++) {
            secondTeam = teamsToPair[j];
            const alreadyPlayed = this.matches.filter(
              (m) =>
                (m.team1 == firstTeam.name && m.team2 == secondTeam.name) ||
                (m.team1 == secondTeam.name && m.team2 == firstTeam.name)
            )[0];

            if (!alreadyPlayed) {
              teamsToPair.splice(j, 1);
              i = 0;
              break;
            }
          }

          const match = new Match({
            field,
            round,
            team1: firstTeam.name,
            team2: secondTeam ? secondTeam.name : "",
          });
          this.matches.push(match);
          if (field >= this.fields) field = 1;
          else field++;
        }
      }
    },
    setMatchWinner(match: Match) {
      if (match.scoreTeam1 == match.scoreTeam2) match.winner = "Null";
      else if (match.scoreTeam1 > match.scoreTeam2) {
        match.winner = match.team1;
      } else {
        match.winner = match.team2;
      }

      const team1 = this.teams.filter((t) => t.name == match.team1)[0];
      team1.score = this.getTeamScore(team1.name);
      team1.pointMarque = this.getTeamPointMarque(team1.name);

      const team2 = this.teams.filter((t) => t.name == match.team2)[0];
      team2.score = this.getTeamScore(team2.name);
      team2.pointMarque = this.getTeamPointMarque(team2.name);
    },
    recalculScore() {
      this.teams.forEach((t) => {
        t.score = this.getTeamScore(t.name);
        t.pointMarque = this.getTeamPointMarque(t.name);
      });
    },
  },
});
