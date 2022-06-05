const Utils = (function () {
    /**
     * Parses version number, after removing date, from version string
     * @param versionString Version string as returned by manifest. Expected to be
     * in the format `yyyy.mmdd.major.minor`. If not, the version string is
     * returned as it is.
     * @param asString Defaults `false`. If `true`, return `7` as `"7.0"`
     * @return `major.minor` part of version string returned as a number or string.
     */
    function getVersionNumberFromString(versionString, asString = false) {
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
            }
            else if (Number.isInteger(version * 10)) {
                return `${version}0`;
            }
            else {
                return String(version);
            }
        }
        return version;
    }
    /**
     * @param hex;
     * @returns;
     */
    function getSaturation(hex) {
        const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
        let r = parseInt(result[1], 16);
        let g = parseInt(result[2], 16);
        let b = parseInt(result[3], 16);
        r /= 255, g /= 255, b /= 255;
        const max = Math.max(r, g, b);
        const min = Math.min(r, g, b);
        let s;
        const l = (max + min) / 2;
        if (max == min) {
            s = 0; // achromatic
        }
        else {
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
    function randomDate(start, end, startHour, endHour) {
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidXRpbHMuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJ1dGlscy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxNQUFNLEtBQUssR0FBRyxDQUFDO0lBQ1g7Ozs7Ozs7T0FPRztJQUNILFNBQVMsMEJBQTBCLENBQUMsYUFBcUIsRUFBRSxRQUFRLEdBQUcsS0FBSztRQUN2RSxNQUFNLFlBQVksR0FBRyxhQUFhLENBQUMsS0FBSyxDQUFDLEdBQUcsQ0FBQyxDQUFDO1FBRTlDLElBQUksWUFBWSxDQUFDLE1BQU0sR0FBRyxDQUFDLEVBQUU7WUFDekIsOEVBQThFO1lBQzlFLE9BQU8sYUFBYSxDQUFDO1NBQ3hCO1FBRUQsSUFBSSxLQUFLLENBQUMsTUFBTSxDQUFDLGFBQWEsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksS0FBSyxDQUFDLE1BQU0sQ0FBQyxhQUFhLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFO1lBQ3BFLDhEQUE4RDtZQUM5RCxPQUFPLGFBQWEsQ0FBQztTQUN4QjtRQUVELE1BQU0sS0FBSyxHQUFHLFlBQVksQ0FBQyxDQUFDLENBQUMsQ0FBQztRQUM5QixNQUFNLEtBQUssR0FBRyxNQUFNLENBQUMsWUFBWSxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsRUFBRSxDQUFDLENBQUMsQ0FBQyxJQUFJLFFBQVEsQ0FBQyxZQUFZLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxZQUFZLENBQUMsQ0FBQyxDQUFDLENBQUM7UUFFL0YsTUFBTSxPQUFPLEdBQUcsTUFBTSxDQUFDLEdBQUcsS0FBSyxJQUFJLEtBQUssRUFBRSxDQUFDLENBQUM7UUFFNUMsSUFBSSxRQUFRLEVBQUU7WUFDVixJQUFJLE1BQU0sQ0FBQyxTQUFTLENBQUMsT0FBTyxDQUFDLEVBQUU7Z0JBQzNCLE9BQU8sR0FBRyxPQUFPLElBQUksQ0FBQzthQUN6QjtpQkFBTSxJQUFJLE1BQU0sQ0FBQyxTQUFTLENBQUMsT0FBTyxHQUFH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