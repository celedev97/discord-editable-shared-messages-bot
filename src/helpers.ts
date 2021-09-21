
export default {

    messageToArray(listString: string) : string[] {
        //removing list numbers
        const searchRegExp = /^`\d*` -/gm;
        const listContent = listString.replace(searchRegExp, '');

        //converting to array
        return listContent.split("\n");
    },

    arrayToMessage(lines: string[], numberize = true) : string{
        //putting numbers back
        if (numberize){
            const digitCount = lines.length.toString().length
            for (let i = 1; i < lines.length; i++) {
                lines[i] = '`'+ this.zerofill(i, digitCount)+'` -'+lines[i]
            }
        }

        return lines.join("\n")
    },

    zerofill(number, length) {
        const zeros = length - number.toString().length;
        if(zeros<1) return number;
        return "0".repeat(zeros) + number;
    },
}
