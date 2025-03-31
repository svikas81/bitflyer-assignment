import express, { Request, Response } from 'express';
import bodyParser from 'body-parser';
import MerkleTree from './MTree';


const app = express();
app.use(bodyParser.json());

// Sample user balances
const users = [
    { id: 1, balance: 1111 },
    { id: 2, balance: 2222 },
    { id: 3, balance: 3333 },
    { id: 4, balance: 4444 },
    { id: 5, balance: 5555 },
    { id: 6, balance: 6666 },
    { id: 7, balance: 7777 },
    { id: 8, balance: 8888 },
];

// Convert user data into string format for hashing
const serializedUsers = users.map(user => JSON.stringify(user));
const merkleTree = new MerkleTree();
const merkleRoot = merkleTree.calculateMerkleRoot(serializedUsers);

app.get('/merkle-root', (req, res) => {
    res.json({ merkleRoot });
});

app.get('/merkle-proof/:id', (req, res) => {
    const userId = parseInt(req.params.id);
    const user = users.find(u => u.id === userId);

    if (!user) {
        return res.status(404).json({ error: 'User not found' });
    }

    // Serialize users to strings for Merkle tree generation
    const serializedUsers = users.map(user => `(${user.id},${user.balance})`);

    // Log serialized users to verify the data
    console.log('Serialized users for Merkle proof:', serializedUsers);

    // Generate the Merkle proof for the specific user
    const proof = merkleTree.generateMerkleProof(serializedUsers, `(${user.id},${user.balance})`);

    res.json({ userId: user.id, balance: user.balance, proof });
});

app.post('/update-users', (req, res) => {
    const updatedUsers = req.body.users;
    if (Array.isArray(updatedUsers)) {
        users.length = 0;  // Clear the array
        users.push(...updatedUsers);  // Add updated users
        const updatedSerializedUsers = users.map(user => `(${user.id},${user.balance})`);
        const updatedMerkleRoot = merkleTree.calculateMerkleRoot(updatedSerializedUsers);
        return res.json({ success: true, updatedMerkleRoot });
    } else {
        return res.status(400).json({ error: 'Invalid user data format' });
    }
});

const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});