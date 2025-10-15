import Result from "@/common/result";
export interface Year{
    year: number;
}

const ParseYearError = new Error("Failed to parse year");

export class YearImpl implements Year{
    private constructor(public year: number){}
    static fromString(yearStr: string): Result<YearImpl, typeof ParseYearError> {
        const extract = yearStr.split(";")[0].trim();
        const [yearNum, ages] = extract.split(" ");
        if(ages && ages.toLowerCase() === "bc"){
            return Result.Ok(new YearImpl(-parseInt(yearNum)));
        }
        return Result.Err(ParseYearError);
    }

    static defaultYear(): YearImpl{
        return new YearImpl(0);
    }

    get(): number{
        return this.year;
    }

    max(other: YearImpl): YearImpl{
        return this.year > other.year ? this : other;
    }

    min(other: YearImpl): YearImpl{
        return this.year < other.year ? this : other;
    }

    
}