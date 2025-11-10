import { createHash, createHmac } from "crypto";

const generateSeedFromDate = (
  date: string,
  min: number,
  max: number
): number => {
  const hash = createHash("sha256").update(date).digest("hex");
  const num = parseInt(hash.slice(0, 8), 16);
  return min + (num % (max - min + 1));
};

function* hmacStream(seed: number): Generator<Buffer> {
  if (!Number.isInteger(seed) || seed < 1 || seed > 100) {
    throw new Error("seed must be an integer 1..100");
  }
  const key = Buffer.from(`det-seed:${seed}`, "utf8");
  let counter = 0n;
  while (true) {
    const msg = Buffer.from(counter.toString());
    const block = createHmac("sha256", key).update(msg).digest();
    counter++;
    yield block;
  }
}

function nextUint32(bytes: () => number): number {
  const b0 = bytes();
  const b1 = bytes();
  const b2 = bytes();
  const b3 = bytes();
  return (((b0 << 24) | (b1 << 16) | (b2 << 8) | b3) >>> 0);
}

const generateDistinctIndices = (
  seed: number,
  min: number,
  max: number,
  count = 10
): number[] => {
  if (count % 2 !== 0) {
    throw new Error("count must be even to generate consecutive pairs");
  }
  
  const allPairs: [number, number][] = [];
  for (let i = min; i < max; i++) {
    allPairs.push([i, i + 1]);
  }
  
  const pairsNeeded = count / 2;
  if (allPairs.length < pairsNeeded) {
    throw new Error(
      `Not enough consecutive pairs available: need ${pairsNeeded} pairs but only ${allPairs.length} possible`
    );
  }
  
  const stream = hmacStream(seed);
  let buf = Buffer.alloc(0);
  const takeByte = (): number => {
    if (buf.length === 0) {
      const { value } = stream.next();
      buf = Buffer.concat([buf, value!]);
    }
    const x = buf[0];
    buf = buf.subarray(1);
    return x;
  };

  for (let i = allPairs.length - 1; i > 0; i--) {
    const x = nextUint32(takeByte);
    const j = x % (i + 1);
    [allPairs[i], allPairs[j]] = [allPairs[j], allPairs[i]];
  }
  
  const out: number[] = [];
  const used = new Set<number>();
  
  for (let i = 0; i < allPairs.length && out.length < count; i++) {
    const [first, second] = allPairs[i];
    if (!used.has(first) && !used.has(second)) {
      if ((nextUint32(takeByte) & 1) === 0) {
        out.push(first, second);
      } else {
        out.push(second, first);
      }
      used.add(first);
      used.add(second);
    }
  }
  
  return out;
};


const RNG = {
  generateSeedFromDate,
  generateDistinctIndices,
};

export default RNG;
