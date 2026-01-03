import { initializeApp } from 'firebase/app';
import { getDatabase, ref, set, get } from 'firebase/database';

const firebaseConfig = {
    apiKey: "AIzaSyDySPHRq53wDUSI8PKX4Jd-lRlvdRyTsoI",
    authDomain: "hack-ai-thon-reg.firebaseapp.com",
    databaseURL: "https://hack-ai-thon-reg-default-rtdb.firebaseio.com",
    projectId: "hack-ai-thon-reg",
    storageBucket: "hack-ai-thon-reg.firebasestorage.app",
    messagingSenderId: "115875849364",
    appId: "1:115875849364:web:64e726b1f5b290da22c081",
    measurementId: "G-1XBYKSP56K"
};

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

async function runLoadTest() {
    console.log("Starting Load/Concurrency Test...");

    // 1. Check current count
    const teamsRef = ref(db, 'teams');
    const snapshot = await get(teamsRef);
    const initialCount = snapshot.exists() ? Object.keys(snapshot.val()).length : 0;
    console.log(`Initial Team Count: ${initialCount}`);

    // 2. Simulate 10 concurrent registrations
    const numberOfSimulations = 10;
    const promises = [];

    for (let i = 0; i < numberOfSimulations; i++) {
        const teamName = `LoadTest_Team_${Date.now()}_${i}`;
        const payload = {
            createdBy: `loadtest${i}@example.com`,
            members: [{ name: `Bot ${i}`, regNo: `000${i}`, year: '2', dept: 'CSE', phone: '1234567890' }],
            payment: { amount: 800, transactionId: `TXN_TEST_${i}`, timestamp: new Date().toISOString() },
            isTest: true
        };

        console.log(`Simulating request for ${teamName}...`);

        // Note: In the real app, the check happens BEFORE the user even sees the form (in useEffect).
        // So if 10 users load the page when count is 58, they all see the form.
        // Then they all click submit. The submit function DOES NOT check the count again in the current code.
        // So we simulate that direct write here.

        promises.push(
            set(ref(db, 'teams/' + teamName), payload)
                .then(() => ({ status: 'fulfilled', team: teamName }))
                .catch((err) => ({ status: 'rejected', team: teamName, error: err }))
        );
    }

    const results = await Promise.all(promises);

    // 3. Check final count
    const finalSnapshot = await get(teamsRef);
    const finalCount = finalSnapshot.exists() ? Object.keys(finalSnapshot.val()).length : 0;

    console.log("\n--- Test Results ---");
    console.log(`Initial Count: ${initialCount}`);
    console.log(`Attempted Registrations: ${numberOfSimulations}`);
    console.log(`Successful Writes: ${results.filter(r => r.status === 'fulfilled').length}`);
    console.log(`Final Team Count: ${finalCount}`);

    if (finalCount > 59) {
        console.log("\n⚠️  CRITICAL FINDING: The registration limit of 59 was EXCEEDED.");
        console.log("Reason: The application checks the limit only on page load, not during the final submission.");
        console.log("Recommendation: Implement a transaction or a second check inside 'handleFinalSubmit'.");
    } else {
        console.log("\nLimit was not exceeded (or we didn't reach it yet).");
    }

    process.exit(0);
}

runLoadTest();
