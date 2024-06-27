import Team from "@/models/team";
import { acceptHMRUpdate, defineStore } from "pinia";
import { useStorage } from "@vueuse/core";
import Match from "@/models/match";
import { shuffleArray } from "@/helper/functions";

export const useTournamentStore = defineStore("tournament", {
  state: () => ({
    rounds: useStorage("rounds", 1),
    fields: useStorage("fields", 1),
    teams: useStorage("teams", [] as Team[]),
    matches: useStorage<Match[]>("matches", []),
    alreadyPlayedAmical: useStorage("alreadyPlayedAmical", [] as Team[]),
  }),
  getters: {
    split: (state) => Math.ceil(state.teams.length / (state.fields * 2)),
    getTeamsByScore: (state) =>
      state.teams.sort(
        (t1, t2) => t2.score - t1.score || t2.pointMarque - t1.pointMarque
      ),
    getByRound: (state) => {
      return (roundNumber: number) =>
        state.matches.filter((m) => m.round == roundNumber);
    },
    roundIsOver: (state) => {
      return (roundNumber: number) => {
        const roundMatch = state.matches.filter((m) => m.round == roundNumber);
        return (
          roundMatch.length != 0 &&
          roundMatch.filter((r) => r.winner == "").length == 0
        );
      };
    },
    getTeamScore: (state) => {
      return (teamName: string | null | undefined) => {
        const teamMatch = state.matches.filter(
          (m) =>
            m.team1?.name == teamName ||
            (m.team2?.name == teamName && !m.amicalForTeam2)
        );
        let score = teamMatch.filter((m) => m.winner == teamName).length * 3;
        score += teamMatch.filter((m) => m.winner == "Null").length * 1;
        return score;
      };
    },
    getTeamDifPoint: (state) => {
      return (teamName: string | null) => {
        const teamMatch = state.matches.filter(
          (m) =>
            m.team1?.name == teamName ||
            (m.team2?.name == teamName && !m.amicalForTeam2)
        );
        let point = 0;
        teamMatch.forEach((element) => {
          if (element.team1?.name == teamName)
            point += element.scoreTeam1 - element.scoreTeam2;
          else point += element.scoreTeam2 - element.scoreTeam1;
        });
        return point;
      };
    },
    getTeamStaffInfo: (state) => {
      return (teamName: string | null) => {
        const team = state.teams.filter((m) => m.name == teamName)[0];
        return team?.isStaff ? ` (${team.staffInfo})` : "";
      };
    },
    getTeamMatches: (state) => {
      return (teamName: string | null) =>
        state.matches.filter(
          (m) => m.team1?.name == teamName || m.team2?.name == teamName
        );
    },
    cantGenerateManche: (state) => {
      return (manche: number) => {
        const previousMatch = state.matches.filter(
          (m) => m.round == manche - 1
        );
        if (manche != 1 && previousMatch.length == 0) return true;
        if (
          manche != 1 &&
          previousMatch.filter((m) => m.winner == "").length != 0
        )
          return true;
        if (
          state.matches.filter(
            (m) => m.round == manche && m.winner != "" && m.team2 != null
          ).length > 0
        )
          return true;

        return false;
      };
    },
    cantGeneratePhase: (state) => {
      return (manche: number, phase: number) => {
        const previousMatch = state.matches.filter(
          (m) => m.round == manche - 1 && m.phase == phase
        );
        if (manche == 1 || previousMatch.length == 0) return true;
        if (previousMatch.filter((m) => m.winner == "").length != 0)
          return true;
        if (
          state.matches.filter(
            (m) =>
              m.round == manche &&
              m.phase == phase &&
              m.winner != "" &&
              m.team2 != null
          ).length > 0
        )
          return true;

        return false;
      };
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
          boule: false,
          membre: "",
        })
      );
    },
    deleteTeam(item: Team) {
      const index = this.teams.indexOf(item, 0);
      if (index > -1) {
        this.teams.splice(index, 1);
      }
    },
    generateRound(round: number, phaseToGenerate: number) {
      console.log(phaseToGenerate);
      const roundMatch = this.matches.filter(
        (m) =>
          m.round == round &&
          (phaseToGenerate == 0 || m.phase == phaseToGenerate)
      );
      if (roundMatch.length) {
        roundMatch.forEach((m) =>
          this.matches.splice(this.matches.indexOf(m), 1)
        );
      }
      //Génération du premier round avec pairing aléatoire
      // if (round == 1) {
      //   this.teams.forEach((t) => (t.score = 0));
      //   const shuffleTeams = this.teams.filter((t) => t.isReady);
      //   shuffleArray(shuffleTeams);
      //   let field = 1;
      //   let phase = 1;
      //   for (let i = 0; i < shuffleTeams.length; i++) {
      //     const isLastTeams = shuffleTeams.length <= i + 1;
      //     const match = new Match({
      //       field,
      //       round,
      //       phase,
      //       team1: shuffleTeams[i],
      //       team2: !isLastTeams ? shuffleTeams[i + 1] : null,
      //       winner: !isLastTeams ? "" : shuffleTeams[i].name,
      //     });
      //     this.matches.push(match);

      //     if (field >= this.fields) {
      //       field = 1;
      //       phase++;
      //     } else field++;

      //     i++;
      //   }
      // } else {
      let teamsToPair: Team[] = [];

      //Si on génère une phase en particuler on ne prend que les équipes ayant joué la premières phase lors de la manche précédente
      if (phaseToGenerate > 0) {
        const previousMatch = this.matches.filter(
          (m) => m.phase == phaseToGenerate && m.round == round - 1
        );
        teamsToPair = this.getPreviousMatchTeams(previousMatch);
      } //Si on génère toute la manche on prend toutes les équipes
      else teamsToPair = this.getTeamsByScore.filter((t) => t.isReady);
      if (round == 1) shuffleArray(teamsToPair);

      let matches: Match[] = [];
      //Le tableau étant trié par score, le paring se fait dans l'ordre
      let field = 1;
      let phase = phaseToGenerate == 0 ? 1 : phaseToGenerate;
      while (teamsToPair.length > 0) {
        const firstTeam = teamsToPair[0];
        teamsToPair.splice(0, 1);
        const match = this.generateMatchForTeam(round, firstTeam, teamsToPair);

        match.field = field;
        match.phase = phase;
        if (match.field >= this.fields) {
          field = 1;
          phase++;
        } else field++;

        //si pas de team 2 du à un nombre impaire, on match avec une équipe du premier tableau
        if (match.team2 == null) {
          var otherTeamsToPair = this.getPreviousMatchTeams(
            phaseToGenerate == 0
              ? matches.filter((m) => m.phase != match.phase)
              : this.matches.filter(
                  (m) => m.round == round - 1 && m.phase != match.phase
                )
          );
          this.alreadyPlayedAmical.forEach((t) => otherTeamsToPair.reduce);
          const match2 = this.generateMatchForTeam(
            round,
            firstTeam,
            otherTeamsToPair.filter((t) => this.alreadyPlayedAmical.includes(t))
          );
          match.team2 = match2.team2;
          if (match2.team2) this.alreadyPlayedAmical.push(match2.team2);
          match.amicalForTeam2 = true;
        }
        matches.push(match);
      }

      //Pour la dernière manche les équipes ne sont pas mélangées et le tableau est inversé pour faire joué les meilleurs équipes ensemble pour la fin du tournois
      if (round == this.rounds) {
        matches = matches.reverse();
        let field = 1;
        let phase = phaseToGenerate == 0 ? 1 : phaseToGenerate;
        matches.forEach((m) => {
          m.field = field;
          m.phase = phase;
          if (m.field >= this.fields) {
            field = 1;
            phase++;
          } else field++;
        });
      }
      matches.forEach((m) => this.matches.push(m));
      // }
      this.recalculScore();
    },
    generateMatchForTeam(
      round: number,
      firstTeam: Team,
      teamsToPair: Team[]
    ): Match {
      let secondTeam: Team | null = null;

      for (let j = 0; j < teamsToPair.length; j++) {
        secondTeam = teamsToPair[j];
        //Si un match a déjà eu lieu entre 2 équipe on passe à l'équipe suivante
        const alreadyPlayed = this.matches.filter(
          (m) =>
            (m.team1?.name == firstTeam.name &&
              m.team2?.name == secondTeam?.name) ||
            (m.team1?.name == secondTeam?.name &&
              m.team2?.name == firstTeam.name)
        )[0];

        if (!alreadyPlayed || teamsToPair.length == 1) {
          teamsToPair.splice(j, 1);
          break;
        }
      }

      //Création de l'objet match, si le nombre d'équipe est impair, l'équipe ayant le plus petit score est déclarée vainqueure et ne joue pas cette manche
      const match = new Match({
        field: 1,
        round,
        team1: firstTeam,
        team2: secondTeam ? secondTeam : null,
        winner: "",
      });
      return match;
    },
    getPreviousMatchTeams(previousMatch: Match[]) {
      let teamsToPair: Team[] = [];
      previousMatch.forEach((p) => {
        if (p.team1)
          teamsToPair.push(
            this.teams.filter(
              (t) => t.name == p.team1?.name && p.team1?.isReady
            )[0]
          );
        if (p.team2 && !p.amicalForTeam2)
          teamsToPair.push(
            this.teams.filter(
              (t) => t.name == p.team2?.name && p.team2?.isReady
            )[0]
          );
      });
      return teamsToPair.sort(
        (t1, t2) => t2.score - t1.score || t2.pointMarque - t1.pointMarque
      );
    },
    setMatchWinner(match: Match) {
      if (match.scoreTeam1 == match.scoreTeam2) match.winner = "Null";
      else if (match.scoreTeam1 > match.scoreTeam2) {
        match.winner = match.team1?.name || "";
      } else {
        match.winner = match.team2?.name || "Nothing";
      }

      const team1 = this.teams.filter((t) => t.name == match.team1?.name)[0];
      if (team1) {
        team1.score = this.getTeamScore(team1.name);
        team1.pointMarque = this.getTeamDifPoint(team1.name);
      }

      const team2 = this.teams.filter((t) => t.name == match.team2?.name)[0];
      if (team2) {
        team2.score = this.getTeamScore(team2.name);
        team2.pointMarque = this.getTeamDifPoint(team2.name);
      }
    },
    recalculScore() {
      this.teams.forEach((t) => {
        t.score = this.getTeamScore(t.name);
        t.pointMarque = this.getTeamDifPoint(t.name);
      });
    },
  },
});

if (import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(useTournamentStore, import.meta.hot));
}
