import Team from "@/models/team";
import { defineStore } from "pinia";
import { useStorage } from '@vueuse/core'

export const useTeamsStore = defineStore({
    id: "teams",
    state: () => ({
        teams: useStorage("teams", [] as Team[]),
    }),
    getters: {

    },
    actions: {
        add(name: string) {
            this.teams.push(new Team({ id: 0, name: name }));
        },
        delete(item: Team) {
            const index = this.teams.indexOf(item, 0);
            if (index > -1) {
                this.teams.splice(index, 1);
            }
        }
    },
});
