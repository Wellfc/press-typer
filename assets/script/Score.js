'use strict';

export default class Score {
    #date;
    #hits;
    #percentage;

    constructor(date = new Date(), hits = 0, percentage = 0) {
        this.#date = date;
        this.#hits = hits;
        this.#percentage = percentage;
    }

    get date() { return this.#date; }
    get hits() { return this.#hits; }
    get percentage() { return this.#percentage; }

    updateScore() {
        this.#hits++;
    }

    isMaxScore(maxScore) {
        return this.#hits === maxScore;
    }

    calculatePercentage(maxScore) {
        this.#percentage = ((this.#hits / maxScore) * 100).toFixed(2);
    }
}