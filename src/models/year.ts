import Result from "@/rust_prelude/result/result";
export interface Year{
    year: number;
}

const ParseYearError = (year: string) => new Error("Failed to parse year: " + year);

export class YearImpl implements Year{
    private constructor(public year: number){}
    static fromString(yearStr: string): Result<YearImpl, Error> {
        const extract = yearStr.split(";")[0].trim();
        const [yearNum, ages] = extract.split(" ");

        if(yearNum && ages && ages.toLowerCase() === "bc"){
            return Result.Ok(new YearImpl(-parseInt(yearNum.trim())));
        } else if(yearNum){
            return Result.Ok(new YearImpl(parseInt(yearNum.trim())));
        }
        console.log("Extracted year:", yearNum);
        const err = ParseYearError(extract);
        return Result.Err(err);
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

    eq(other: YearImpl): boolean{
        return this.year === other.year;
    }

    toString(): string{
        return this.get().toString();
    }

    
}