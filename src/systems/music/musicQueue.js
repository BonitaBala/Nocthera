/**
 * ============================================================
 * Nocthera v1.1.0
 * Music Queue
 * ============================================================
 */

import musicService from "./musicService.js";

class MusicQueue {

    constructor() {

        this.queues = new Map();

    }

    // ========================================================
    // Queue Access
    // ========================================================

    get(guildId) {

        if (!this.queues.has(guildId)) {

            this.queues.set(guildId, []);

        }

        return this.queues.get(guildId);

    }

    // ========================================================
    // Add
    // ========================================================

    add(guildId, track) {

        if (!track) {

            return false;

        }

        const queue = this.get(guildId);

        const config = musicService.getConfig(guildId);

        if (
            queue.length >=
            config.maxQueueSize
        ) {

            return false;

        }

        queue.push(track);

        return track;

    }

    // ========================================================
    // Add Multiple
    // ========================================================

    addMany(guildId, tracks = []) {

        if (!Array.isArray(tracks)) {

            return false;

        }

        let added = 0;

        for (const track of tracks) {

            if (
                this.add(guildId, track)
            ) {

                added++;

            }

        }

        return added;

    }

    // ========================================================
    // Remove
    // ========================================================

    remove(guildId, index) {

        const queue = this.get(guildId);

        const position = Number(index);

        if (
            !Number.isInteger(position) ||
            position < 0 ||
            position >= queue.length
        ) {

            return null;

        }

        return queue.splice(

            position,

            1

        )[0] ?? null;

    }

    // ========================================================
    // Shift
    // ========================================================

    next(guildId) {

        const queue = this.get(guildId);

        return queue.shift() ?? null;

    }

    // ========================================================
    // Peek
    // ========================================================

    peek(guildId) {

        return this.get(guildId)[0] ?? null;

    }

    // ========================================================
    // Clear
    // ========================================================

    clear(guildId) {

        this.get(guildId).length = 0;

    }

    // ========================================================
    // Shuffle
    // ========================================================

    shuffle(guildId) {

        const queue = this.get(guildId);

        for (
            let i = queue.length - 1;
            i > 0;
            i--
        ) {

            const j = Math.floor(

                Math.random() * (i + 1)

            );

            [
                queue[i],
                queue[j]

            ] = [

                queue[j],
                queue[i]

            ];

        }

        return queue;

    }

    // ========================================================
    // Move
    // ========================================================

    move(guildId, from, to) {

        const queue = this.get(guildId);

        const source = Number(from);

        const destination = Number(to);

        if (
            !Number.isInteger(source) ||
            !Number.isInteger(destination)
        ) {

            return false;

        }

        if (
            source < 0 ||
            source >= queue.length ||
            destination < 0 ||
            destination >= queue.length
        ) {

            return false;

        }

        const [track] = queue.splice(

            source,

            1

        );

        queue.splice(

            destination,

            0,

            track

        );

        return true;

    }

    // ========================================================
    // Size
    // ========================================================

    size(guildId) {

        return this.get(guildId).length;

    }

    // ========================================================
    // Check Empty
    // ========================================================

    isEmpty(guildId) {

        return this.size(guildId) === 0;

    }

    // ========================================================
    // Snapshot
    // ========================================================

    snapshot(guildId) {

        return [

            ...this.get(guildId)

        ];

    }

    // ========================================================
    // Destroy
    // ========================================================

    destroy(guildId) {

        return this.queues.delete(guildId);

    }

    // ========================================================
    // Shutdown
    // ========================================================

    shutdown() {

        this.queues.clear();

    }

}

export default new MusicQueue();