import axios from 'axios';
import mongoose from 'mongoose';
import { IClass } from './models/Class';

// --- Configuration ---
const CLASS_ID = 'YOUR_CLASS_ID_HERE'; // Replace with a real Class ID from your database
const NUM_ATTEMPTS = 50; // Number of parallel join attempts
const API_URL = 'http://localhost:5000/api/classes';
const MONGO_URI = 'mongodb+srv://anishtest:YtGFAQHSt7NjbjOn@cluster0.dof9khp.mongodb.net/liveclass?retryWrites=true&w=majority&appName=Cluster0';

// --- Test Logic ---

const runTest = async () => {
    try {
        // Connect to MongoDB
        await mongoose.connect(MONGO_URI);
        console.log('Connected to MongoDB.');

        // Reference the Class model from the backend
        const ClassModel = mongoose.model<IClass>('Class');

        // Clean up previous test data
        await ClassModel.findByIdAndUpdate(CLASS_ID, {
            participants: [],
            waitlist: [],
        });
        console.log('Class data reset for testing.');

        // Simulate concurrent join attempts
        console.log(`\nSimulating ${NUM_ATTEMPTS} parallel join attempts...`);
        
        const joinPromises: Promise<any>[] = []; 
        for (let i = 0; i < NUM_ATTEMPTS; i++) {
            const identity: string = `student_${i}`;
            // Use a double type assertion to bypass the strict type check
            const joinPromise = axios.post(`${API_URL}/${CLASS_ID}/join`, { identity }) as Promise<any>;
            joinPromises.push(joinPromise);
        }

        // Wait for all requests to finish
        const results = await Promise.allSettled(joinPromises);
        
        console.log('\nAll join requests have completed.');

        // Fetch the final state of the class from the database
        const finalClass: IClass | null = await ClassModel.findById(CLASS_ID);

        if (!finalClass) {
            console.error('Test failed: Class not found.');
            return;
        }

        // --- Assertion and Reporting ---
        const participants: string[] = finalClass.participants || [];
        const waitlist: string[] = finalClass.waitlist || [];

        console.log('\n--- Final Results ---');
        console.log(`Max Participants: ${finalClass.maxParticipants}`);
        console.log(`Final Participant Count: ${participants.length}`);
        console.log(`Final Waitlist Count: ${waitlist.length}`);

        if (participants.length <= finalClass.maxParticipants) {
            console.log('\n✅ Assertion Passed: Final participant count is less than or equal to max participants.');
        } else {
            console.error('\n❌ Assertion Failed: Final participant count exceeds max participants!');
        }
        
        // Disconnect from MongoDB
        await mongoose.disconnect();
        
    } catch (error: any) {
        console.error('An error occurred during the test:', error.message);
        if (mongoose.connection.readyState === 1) {
             await mongoose.disconnect();
        }
    }
};

runTest();