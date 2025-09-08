'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { joinClass } from './services/api';
import TeacherPage from './teacher/page';

interface JoinResponse {
  message: string;
  joined: boolean;
  token?: string;
}

const StudentJoinForm = () => {
    const [classId, setClassId] = useState('');
    const [identity, setIdentity] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const router = useRouter();

    const handleJoin = async () => {
        if (!classId || !identity) {
            alert('Please enter your name and the class ID.');
            return;
        }
        setIsLoading(true);
        try {
            const response = await joinClass(classId, identity) as JoinResponse;
            if (response.joined) {
                router.push(`/class/${classId}?identity=${identity}&token=${response.token}`);
            } else {
                alert(response.message);
            }
        } catch (error: unknown) {
            if (error instanceof Error) {
                console.error('Join class error:', error.message);
            } else {
                console.error('Join class error:', error);
            }
            alert('Error joining class. Please check the Class ID and try again.');
        } finally {
            setIsLoading(false);
        }
    };    

    return (
        <div className="bg-white rounded-xl shadow-md p-8 w-full max-w-md border border-gray-100">
            <h2 className="text-2xl font-semibold mb-6 text-center text-gray-800">
                Student - Join a Session
            </h2>
            <div className="mb-4 w-full">
                <label htmlFor="identity" className="block text-sm font-medium text-gray-700 mb-2">Your Name</label>
                <input
                    id="identity"
                    type="text"
                    placeholder="e.g., Anisha Sharma"
                    value={identity}
                    onChange={(e) => setIdentity(e.target.value)}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none bg-gray-50 text-gray-900"
                    disabled={isLoading}
                />
            </div>
            <div className="mb-6 w-full">
                <label htmlFor="classId" className="block text-sm font-medium text-gray-700 mb-2">Class ID</label>
                <input
                    id="classId"
                    type="text"
                    placeholder="e.g., 68bdd27f0efe3d62b6d41171"
                    value={classId}
                    onChange={(e) => setClassId(e.target.value)}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none bg-gray-50 text-gray-900"
                    disabled={isLoading}
                />
            </div>
            <button
                onClick={handleJoin}
                className="w-full bg-blue-600 text-white p-3 rounded-lg font-medium hover:bg-blue-700 transition-colors duration-200 disabled:bg-blue-300 disabled:cursor-not-allowed"
                disabled={isLoading}
            >
                {isLoading ? 'Joining...' : 'Join Class'}
            </button>
        </div>
    );
};

const HomePage = () => {
    const [userRole, setUserRole] = useState<'student' | 'teacher' | null>(null);

    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-8">
            <h1 className="text-4xl font-bold mb-10 text-gray-800">
                Welcome to LiveClass! 🚀
            </h1>
            {!userRole ? (
                <div className="flex flex-col space-y-4 w-full max-w-sm">
                    <button
                        onClick={() => setUserRole('teacher')}
                        className="p-4 rounded-xl bg-blue-600 text-white font-semibold text-lg shadow-lg hover:bg-blue-700 transition-colors duration-200"
                    >
                        I&apos;m a Teacher
                    </button>
                    <button
                        onClick={() => setUserRole('student')}
                        className="p-4 rounded-xl bg-green-600 text-white font-semibold text-lg shadow-lg hover:bg-green-700 transition-colors duration-200"
                    >
                        I&apos;m a Student
                    </button>
                </div>
            ) : userRole === 'teacher' ? (
                <TeacherPage />
            ) : (
                <StudentJoinForm />
            )}
        </div>
    );
};

export default HomePage;  