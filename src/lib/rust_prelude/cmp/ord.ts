import Option from "../option/Option";

export class OrderingImpl {
  private constructor(private readonly value: "Less" | "Equal" | "Greater") {}

  static Less(): OrderingImpl {
    return new OrderingImpl("Less");
  }

  static Equal(): OrderingImpl {
    return new OrderingImpl("Equal");
  }

  static Greater(): OrderingImpl {
    return new OrderingImpl("Greater");
  }

  isLess(): boolean {
    return this.value === "Less";
  }

  isEqual(): boolean {
    return this.value === "Equal";
  }

  isGreater(): boolean {
    return this.value === "Greater";
  }
}

export interface Ord {
  cmp(other: this): OrderingImpl;
  partialCmp(other: unknown): Option<OrderingImpl>;
  eq(other: this): boolean;
  max(other: this): this;
  min(other: this): this;
}
