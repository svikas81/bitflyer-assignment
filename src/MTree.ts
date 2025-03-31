import * as crypto from 'crypto';

class MerkleTree {
    private hashType: string;

    constructor(hashType: string = "Bitcoin_Transaction") {
        this.hashType = hashType;
        if (this.hashType !== "Bitcoin_Transaction") {
            throw new Error("Unsupported hash type. Only 'Bitcoin_Transaction' is supported.");
        }
    }

    private doubleSha256(data: Buffer): string {
        console.log("Here")
        const bufferData = (typeof data === 'string') ? Buffer.from(data, 'utf-8') : data;
        const hash1 = crypto.createHash('sha256').update(bufferData).digest();
        const hash2 = crypto.createHash('sha256').update(hash1).digest();
        return hash2.toString('hex');
    }

    // Generate Merkle Proof for a specific target
    generateMerkleProof(data: string[], target: string): string[] {
        let hashes = data.map(leaf => this.hashLeaf(leaf));
        let proof: string[] = [];
        let index = data.indexOf(target);

        if (index === -1) return []; // Target not found in data

        while (hashes.length > 1) {
            if (hashes.length % 2 !== 0) {
                hashes.push(hashes[hashes.length - 1]); // Duplicate last element if odd
            }

            let newHashes: string[] = [];
            for (let i = 0; i < hashes.length; i += 2) {
                if (i === index || i + 1 === index) {
                    proof.push(i === index ? hashes[i + 1] : hashes[i]);
                }
                newHashes.push(this.hashBranch(hashes[i], hashes[i + 1]));
            }
            hashes = newHashes;
            index = Math.floor(index / 2);
        }

        return proof;
    }

    private hashLeaf(leaf: string): string {
        if (this.hashType === "Bitcoin_Transaction") {
            return this.doubleSha256(Buffer.from(leaf, 'utf-8'));
        } else {
            throw new Error("Unsupported hash type.");
        }
    }

    private hashBranch(left: string, right: string): string {
        if (this.hashType === "Bitcoin_Transaction") {
            const leftBuffer = Buffer.from(left, 'hex');
            console.log("Here-59")
            const rightBuffer = Buffer.from(right, 'hex');
            const combined = Buffer.concat([leftBuffer, rightBuffer]);
            return this.doubleSha256(combined);
        } else {
            throw new Error("Unsupported hash type.");
        }
    }

    // Calculate Merkle Root from an array of data
    calculateMerkleRoot(data: string[]): string | null {
        if (!data || data.length === 0) {
            return null;
        }

        let hashes: string[] = data.map(leaf => this.hashLeaf(leaf));

        while (hashes.length > 1) {
            if (hashes.length % 2 !== 0) {
                console.log("Here-77")
                hashes.push(hashes[hashes.length - 1]); // Duplicate last element if odd
            }

            let newHashes: string[] = [];
            for (let i = 0; i < hashes.length; i += 2) {
                newHashes.push(this.hashBranch(hashes[i], hashes[i + 1]));
            }
            hashes = newHashes;
        }

        return hashes[0];
    }

    // Example Merkle Root calculation
    calculateMerkleRootForExample(): string | null {
        const exampleData = ["aaa", "bbb", "ccc", "ddd", "eee"];
        return this.calculateMerkleRoot(exampleData);
    }
}

export default MerkleTree;
