import Team from "@/models/team";
import { acceptHMRUpdate, defineStore } from "pinia";
import { useStorage } from "@vueuse/core";
import Match from "@/models/match";
import { shuffleArray } from "@/helper/functions";

interface MatchGenerationOptions {
  round: number;
  phase?: number;
  isLastRound?: boolean;
}

interface TeamPairing {
  team1: Team;
  team2: Team | null;
}

export const useTournamentStore = defineStore("tournament", {
  state: () => ({
    rounds: useStorage("rounds", 1),
    fields: useStorage("fields", 1),
    bestTeamEnd: useStorage("bestTeamEnd", false),
    teams: useStorage("teams", [] as Team[]),
    matches: useStorage<Match[]>("matches", []),
  }),

  getters: {
    getTeamsByScore: (state): Team[] => {
      return state.teams.sort((t1, t2) => {
        if (t1.score === t2.score) {
          // Cherche si un match existe entre ces 2 équipes
          const match = state.matches.find(
            (m) =>
              (m.team1?.name === t1.name && m.team2?.name === t2.name) ||
              (m.team1?.name === t2.name && m.team2?.name === t1.name)
          );

          // Si un match existe, l'équipe gagnante passe devant
          if (match) {
            return match.winner === t1.name ? -1 : 1;
          }
        }

        // Sinon, retrier par score et pointMarque
        return t2.score - t1.score || t2.pointMarque - t1.pointMarque;
      });
    },
    getTeamScore: (state) => {
      return (teamName: string | null | undefined): number => {
        if (!teamName) return 0;

        const teamMatches = state.matches.filter(
          (match) =>
            match.team1?.name === teamName || match.team2?.name === teamName
        );

        const wins = teamMatches.filter(
          (match) => match.winner === teamName
        ).length;
        const draws = teamMatches.filter(
          (match) => match.winner === "Null"
        ).length;

        return wins * 3 + draws * 1;
      };
    },
    getTeamPointDifference: (state) => {
      return (teamName: string | null): number => {
        if (!teamName) return 0;

        const teamMatches = state.matches.filter(
          (match) =>
            match.team1?.name === teamName || match.team2?.name === teamName
        );

        return teamMatches.reduce((total, match) => {
          if (match.team1?.name === teamName) {
            return total + (match.scoreTeam1 - match.scoreTeam2);
          } else {
            return total + (match.scoreTeam2 - match.scoreTeam1);
          }
        }, 0);
      };
    },
    getTeamMatches: (state) => {
      return (teamName: string | null): Match[] => {
        if (!teamName) return [];

        return state.matches.filter(
          (match) =>
            match.team1?.name === teamName || match.team2?.name === teamName
        );
      };
    },
    split: (state) => Math.ceil(state.teams.length / (state.fields * 2)),
    getByRound: (state) => {
      return (roundNumber: number) =>
        state.matches
          .filter((m) => m.round == roundNumber)
          .sort((a, b) => a.phase - b.phase || a.field - b.field);
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
    getTeamDifPoint: (state) => {
      return (teamName: string | null) => {
        const teamMatch = state.matches.filter(
          (m) => m.team1?.name == teamName || m.team2?.name == teamName
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
    /**
     * Gestion des équipes
     */
    addTeam(name: string): void {
      const newTeam = new Team({
        id: this.teams.length + 1,
        name: name,
        score: 0,
        pointMarque: 0,
        isReady: false,
        membre: "",
      });

      this.teams.push(newTeam);
    },

    deleteTeam(team: Team): void {
      const index = this.teams.indexOf(team);
      if (index > -1) {
        this.teams.splice(index, 1);
      }
    },

    /**
     * Génération des matchs
     */
    generateRound(round: number, phaseToGenerate: number = 0): void {
      // Supprimer les matchs existants pour cette manche/phase
      this._removeExistingMatches(round, phaseToGenerate);

      // Obtenir les équipes à apparier
      const teamsToMatch = this._getTeamsForRound(round, phaseToGenerate);

      if (round === 1) {
        shuffleArray(teamsToMatch);
      }

      // Générer les appariements
      const pairings = this._generateTeamPairings(teamsToMatch);
      if (!this.bestTeamEnd) shuffleArray(pairings);
      // Créer les matchs
      let nextMatches = this._createMatchesFromPairings(
        round,
        phaseToGenerate,
        pairings
      );

      if (this.bestTeamEnd && phaseToGenerate == 0)
        nextMatches = this._adjustMatchOrderForFinalRound(nextMatches);

      // Ajouter les matchs au store
      nextMatches.forEach((match) => this.matches.push(match));

      // Recalculer les scores
      this.recalculateAllScores();
    },

    /**
     * Supprime les matchs existants pour une manche/phase donnée
     */
    _removeExistingMatches(round: number, phaseToGenerate: number): void {
      const matchesToRemove = this.matches.filter(
        (match) =>
          match.round === round &&
          (phaseToGenerate === 0 || match.phase === phaseToGenerate)
      );

      matchesToRemove.forEach((match) => {
        const index = this.matches.indexOf(match);
        this.matches.splice(index, 1);
      });
    },

    /**
     * Obtient les équipes pour une manche donnée
     */
    _getTeamsForRound(round: number, phaseToGenerate: number): Team[] {
      let teams: Team[] = [];

      if (phaseToGenerate > 0) {
        // Phase spécifique : équipes ayant joué cette phase à la manche précédente
        const previousMatches = this.matches.filter(
          (match) =>
            match.phase === phaseToGenerate && match.round === round - 1
        );
        teams = this._getTeamsFromMatches(previousMatches);
      } else {
        // Toute la manche : toutes les équipes prêtes
        teams = this.getTeamsByScore.filter((team) => team.isReady);
      }

      return teams;
    },

    /**
     * Extrait les équipes des matchs précédents de la plus forte à la moins forte
     */
    _getTeamsFromMatches(matches: Match[]): Team[] {
      const teamNames = new Set<string>();

      matches.forEach((match) => {
        if (match.team1?.isReady) {
          teamNames.add(match.team1.name);
        }
        if (match.team2?.isReady) {
          teamNames.add(match.team2.name);
        }
      });

      //On trie de la meilleur équipe à la moins bonne par score puis par point marque
      return Array.from(teamNames)
        .map((name) => this.teams.find((team) => team.name === name))
        .filter((team): team is Team => team !== undefined)
        .sort(
          (t1, t2) => t2.score - t1.score || t2.pointMarque - t1.pointMarque
        );
    },

    /**
     * Génère les appariements d'équipes selon le système suisse avec gestion des conflits
     */
    _generateTeamPairings(teams: Team[]): TeamPairing[] {
      const pairings: TeamPairing[] = [];
      const remainingTeams = [...teams];

      while (remainingTeams.length > 1) {
        const team1 = remainingTeams.shift()!;
        const team2 = this._findBestOpponent(team1, remainingTeams);
        console.log(team2);
        if (team2) {
          const team2Index = remainingTeams.indexOf(team2);
          remainingTeams.splice(team2Index, 1);
          pairings.push({ team1, team2 });
        } else {
          console.log("bad pairing", team1, remainingTeams);
          // Cas critique : aucun adversaire valide trouvé
          // Essayer de réorganiser les appariements précédents
          const reorganizedPairings = this._reorganizePairings(
            pairings,
            team1,
            remainingTeams
          );
          if (reorganizedPairings) {
            return reorganizedPairings;
          } else {
            // Si la réorganisation échoue, forcer l'appariement avec la première équipe disponible
            const forcedOpponent = remainingTeams.shift();
            pairings.push({ team1, team2: forcedOpponent || null });
          }
        }
      }

      // Gérer l'équipe restante (nombre impair)
      if (remainingTeams.length === 1) {
        pairings.push({ team1: remainingTeams[0], team2: null });
      }

      return pairings;
    },

    /**
     * Réorganise les appariements précédents pour résoudre les conflits
     */
    _reorganizePairings(
      currentPairings: TeamPairing[],
      problematicTeam: Team,
      remainingTeams: Team[]
    ): TeamPairing[] | null {
      // Essayer de défaire le dernier appariement et réorganiser
      if (currentPairings.length === 0) return null;

      const lastPairing = currentPairings.pop()!;
      if (!lastPairing.team2) return null;

      // Remettre les équipes du dernier appariement dans le pool
      const newRemainingTeams = [
        lastPairing.team1,
        lastPairing.team2,
        problematicTeam,
        ...remainingTeams,
      ];

      // Essayer de trouver une nouvelle configuration
      const team1 = newRemainingTeams.shift()!;

      for (let i = 0; i < newRemainingTeams.length; i++) {
        const potentialTeam2 = newRemainingTeams[i];

        if (!this._haveTeamsPlayedBefore(team1, potentialTeam2)) {
          // Appariement valide trouvé
          newRemainingTeams.splice(i, 1);
          const newPairing = { team1, team2: potentialTeam2 };

          // Continuer avec les équipes restantes
          const restOfPairings = this._generateTeamPairings(newRemainingTeams);

          return [...currentPairings, newPairing, ...restOfPairings];
        }
      }

      // Si aucune solution trouvée, essayer avec le précédent appariement
      if (currentPairings.length > 0) {
        return this._reorganizePairings(currentPairings, problematicTeam, [
          lastPairing.team1,
          lastPairing.team2,
          ...remainingTeams,
        ]);
      }

      return null;
    },

    /**
     * Trouve le meilleur adversaire pour une équipe selon les règles du système suisse
     */
    _findBestOpponent(team: Team, availableTeams: Team[]): Team | null {
      if (availableTeams.length === 0) return null;

      // Chercher une équipe qui n'a jamais joué contre cette équipe
      for (const opponent of availableTeams) {
        if (!this._haveTeamsPlayedBefore(team, opponent)) {
          return opponent;
        }
      }

      // Si toutes les équipes ont déjà joué, retourner null pour déclencher la réorganisation
      return null;
    },

    /**
     * Trouve l'adversaire avec le score le plus proche
     */
    _findClosestScoreOpponent(team: Team, availableTeams: Team[]): Team {
      return availableTeams.reduce((closest, current) => {
        const closestScoreDiff = Math.abs(closest.score - team.score);
        const currentScoreDiff = Math.abs(current.score - team.score);

        if (currentScoreDiff < closestScoreDiff) {
          return current;
        } else if (currentScoreDiff === closestScoreDiff) {
          // En cas d'égalité de score, comparer la différence de points
          const closestPointDiff = Math.abs(
            closest.pointMarque - team.pointMarque
          );
          const currentPointDiff = Math.abs(
            current.pointMarque - team.pointMarque
          );
          return currentPointDiff < closestPointDiff ? current : closest;
        }

        return closest;
      });
    },

    /**
     * Vérifie si deux équipes ont déjà joué ensemble
     */
    _haveTeamsPlayedBefore(team1: Team, team2: Team): boolean {
      return this.matches.some(
        (match) =>
          (match.team1?.name === team1.name &&
            match.team2?.name === team2.name) ||
          (match.team1?.name === team2.name && match.team2?.name === team1.name)
      );
    },

    /**
     * Crée les matchs à partir des appariements
     */
    _createMatchesFromPairings(
      round: number,
      phaseToGenerate: number,
      pairings: TeamPairing[]
    ): Match[] {
      let field = 1;
      let phase = phaseToGenerate === 0 ? 1 : phaseToGenerate;
      return pairings.map((pairing) => {
        const match = new Match({
          field,
          round,
          phase,
          team1: pairing.team1,
          team2: pairing.team2,
          winner: pairing.team2 ? "" : pairing.team1.name, // Victoire par forfait si pas d'adversaire
        });

        // Gérer l'attribution des terrains et phases
        if (field >= this.fields) {
          field = 1;
          phase++;
        } else {
          field++;
        }

        return match;
      });
    },

    /**
     * Ajuste l'ordre des phases pour la dernière manche
     */
    _adjustMatchOrderForFinalRound(matches: Match[]): Match[] {
      const reorderedMatches = [...matches]; //.reverse();
      let newPhase = this.split;
      let previousPhase = 1;
      reorderedMatches.forEach((element) => {
        if (element.phase != previousPhase) {
          newPhase--;
          previousPhase = element.phase;
        }
        element.phase = newPhase;
      });

      console.log(reorderedMatches);
      return reorderedMatches.sort(
        (a, b) => a.phase - b.phase || a.field - b.field
      );
    },
    /**
     * Définit le vainqueur d'un match et met à jour les scores
     */
    setMatchWinner(match: Match): void {
      // Déterminer le vainqueur basé sur les scores
      if (match.scoreTeam1 === match.scoreTeam2) {
        match.winner = "Null";
      } else if (match.scoreTeam1 > match.scoreTeam2) {
        match.winner = match.team1?.name || "";
      } else {
        match.winner = match.team2?.name || "";
      }

      // Mettre à jour les scores des équipes
      this._updateTeamScores(match);
    },

    /**
     * Met à jour les scores des équipes d'un match
     */
    _updateTeamScores(match: Match): void {
      if (match.team1) {
        const team1 = this.teams.find(
          (team) => team.name === match.team1?.name
        );
        if (team1) {
          team1.score = this.getTeamScore(team1.name);
          team1.pointMarque = this.getTeamPointDifference(team1.name);
        }
      }

      if (match.team2) {
        const team2 = this.teams.find(
          (team) => team.name === match.team2?.name
        );
        if (team2) {
          team2.score = this.getTeamScore(team2.name);
          team2.pointMarque = this.getTeamPointDifference(team2.name);
        }
      }
    },

    /**
     * Recalcule tous les scores des équipes
     */
    recalculateAllScores(): void {
      this.teams.forEach((team) => {
        team.score = this.getTeamScore(team.name);
        team.pointMarque = this.getTeamPointDifference(team.name);
      });
    },

    // Actions de compatibilité avec l'ancien code
    recalculScore(): void {
      this.recalculateAllScores();
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
        if (p.team2)
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

    resetAllRound() {
      this.matches = [];
    },
  },
});

if (import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(useTournamentStore, import.meta.hot));
}
