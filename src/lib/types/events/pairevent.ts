import Result from "@/lib/rust_prelude/result/result";

export interface Pair<T>{
  first: T;
  second: T;
}

type Position = "first" | "second" | "both";
export class PositionImpl {
    private constructor(private result: Position){}

    static fromString(result: string): Result<PositionImpl, Error>{
        if(result === "first" || result === "second" || result === "both"){
            return Result.Ok(new PositionImpl(result));
        }
        return Result.Err(new Error("Invalid expected result"));
    }
    static first(){
        return new PositionImpl("first");
    }
    static second(){
        return new PositionImpl("second");
    }
    static both(){
        return new PositionImpl("both");
    }
    isFirst(): boolean{
        return this.result === "first";
    }

    isSecond(): boolean{
        return this.result === "second";
    }

    isBoth(): boolean{
        return this.result === "both";
    }

    bool(other: PositionImpl): boolean{
        return this.isBoth() || this.result === other.result;
    }

    
}