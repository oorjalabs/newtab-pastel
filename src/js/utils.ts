const Utils = (function() {
    /**
     * Parses version number, after removing date, from version string
     * @param versionString Version string as returned by manifest. Expected to be
     * in the format `yyyy.mmdd.major.minor`. If not, the version string is
     * returned as it is.
     * @param asString Defaults `false`. If `true`, return `7` as `"7.0"`
     * @return `major.minor` part of version string returned as a number or string.
     */
    function getVersionNumberFromString(versionString: string, asString = false): number | string {
        const versionParts = versionString.split(".");

        if (versionParts.length < 4) {
            // Unknown version format. Doesn't match our format of `yyyy.mmdd.major.minor`
            return versionString;
        }

        if (isNaN(Number(versionString[2])) || isNaN(Number(versionString[3]))) {
            // Unknown version format. Minor and Major need to be numbers.
            return versionString;
        }

        const major = versionParts[2];
        const minor = Number(versionParts[3]) < 10 ? `0${parseInt(versionParts[3])}` : versionParts[3];

        const version = Number(`${major}.${minor}`);

        if (asString) {
            if (Number.isInteger(version)) {
                return `${version}.0`;
            } else if (Number.isInteger(version * 10)) {
                return `${version}0`;
            } else {
                return String(version);
            }
        }

        return version;
    }

    /**
     * @param hex;
     * @returns;
     */
    function getSaturation(hex: string): number {
        const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);

        let r = parseInt(result[1], 16);
        let g = parseInt(result[2], 16);
        let b = parseInt(result[3], 16);

        r /= 255, g /= 255, b /= 255;
        const max = Math.max(r, g, b);
        const min = Math.min(r, g, b);
        let s; const l = (max + min) / 2;

        if (max == min) {
            s = 0; // achromatic
        } else {
            const d = max - min;
            s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
        }

        return Math.round(s * 100);
    }

    /**
     * Get a random date between [start] and [end] dates within [startHour] and [endHour]s of day.
     * @param {number} start
     * @param {number} end
     * @param {number} startHour
     * @param {number} endHour
     * @return {Date}
     */
    function randomDate(
        start: number,
        end: number,
        startHour: number,
        endHour: number
    ): Date {
        const date = new Date(+start + Math.random() * (end - start));
        const hour = startHour + Math.random() * (endHour - startHour) | 0;
        date.setHours(hour);
        if (date.getTime() <= Date.now()) {
            date.setDate(date.getDate() + 1);
        }
        return date;
    }

    return {
        getVersionNumberFromString,
        getSaturation,
        randomDate,
    };
})();
