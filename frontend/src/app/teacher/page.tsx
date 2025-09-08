'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClass, startClass, stopClass } from '../services/api';

interface CreateClassResponse {
    message: string;
    classId: string;
}

const TeacherPage = () => {
  const [className, setClassName] = useState('');
  const [maxParticipants, setMaxParticipants] = useState(5);
  const [classId, setClassId] = useState<string | null>(null);
  const [isActive, setIsActive] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleCreateClass = async () => {
    if (!className || maxParticipants < 1) {
      alert('Please enter a valid class name and participant count.');
      return;
    }
    setIsLoading(true);
    try {
      const response = await createClass(className, maxParticipants) as CreateClassResponse;
      setClassId(response.classId);
      alert('Class created successfully! Share this ID with students.');
    } catch (error) {
      console.error('Error creating class:', error);
      alert('Failed to create class. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleStartClass = async () => {
    if (!classId) return;
    setIsLoading(true);
    try {
      await startClass(classId);
      setIsActive(true);
      alert('Class session has started.');
    } catch (error) {
      console.error('Error starting class:', error);
      alert('Failed to start class. It may already be active.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleStopClass = async () => {
    if (!classId) return;
    setIsLoading(true);
    try {
      await stopClass(classId);
      setIsActive(false);
      alert('Class session has ended.');
    } catch (error) {
      console.error('Error stopping class:', error);
      alert('Failed to stop class. It may already be inactive.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleJoinClassroom = () => {
    if (!classId) return;
    router.push(`/class/${classId}?identity=Teacher&token=YOUR_TEACHER_TOKEN`); 
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-8">
      <h1 className="text-4xl font-bold mb-10 text-gray-800">
        Teacher Dashboard
      </h1>
      <div className="bg-white p-8 rounded-xl shadow-md w-full max-w-lg border border-gray-100">
        {!classId ? (
          <>
            <p className="text-lg font-semibold mb-6 text-center text-gray-700">
              Create a New Class Session
            </p>
            <div className="mb-4">
              <label htmlFor="className" className="block text-sm font-medium text-gray-700 mb-2">Class Name</label>
              <input
                id="className"
                type="text"
                placeholder="e.g., Biology 101"
                value={className}
                onChange={(e) => setClassName(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none bg-gray-50 text-gray-900"
                disabled={isLoading}
              />
            </div>
            <div className="mb-6">
              <label htmlFor="maxParticipants" className="block text-sm font-medium text-gray-700 mb-2">Max Participants</label>
              <input
                id="maxParticipants"
                type="number"
                value={maxParticipants}
                onChange={(e) => setMaxParticipants(parseInt(e.target.value))}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none bg-gray-50 text-gray-900"
                disabled={isLoading}
              />
            </div>
            <button 
              onClick={handleCreateClass} 
              className="w-full bg-blue-600 text-white p-3 rounded-lg font-medium hover:bg-blue-700 transition-colors duration-200 disabled:bg-blue-300 disabled:cursor-not-allowed"
              disabled={isLoading}
            >
              {isLoading ? 'Creating...' : 'Create Class'}
            </button>
          </>
        ) : (
          <>
            <p className="text-xl font-bold mb-4 text-center text-green-600">Class Created!</p>
            <p className="text-lg mb-4 text-center text-gray-700">
              Share this Class ID with your students:
              <br />
              <span className="font-mono text-xl bg-blue-50 p-3 rounded-lg block mt-3 text-blue-700 border border-blue-200">{classId}</span>
            </p>
            
            <div className="flex flex-col space-y-4">
              <button
                onClick={isActive ? handleStopClass : handleStartClass}
                className={`w-full p-3 rounded-lg font-medium transition-colors duration-200 ${isActive ? 'bg-red-600 hover:bg-red-700' : 'bg-green-600 hover:bg-green-700'} text-white`}
                disabled={isLoading}
              >
                {isLoading ? 'Loading...' : isActive ? 'End Class' : 'Start Class'}
              </button>
              <button
                onClick={handleJoinClassroom}
                className="w-full p-3 rounded-lg font-medium bg-indigo-600 text-white hover:bg-indigo-700 transition-colors duration-200 disabled:bg-gray-400"
                disabled={!isActive || isLoading}
              >
                Join Classroom
              </button>
            </div>
            
            <p className="mt-4 text-center text-sm text-gray-600">
              Status: <span className={isActive ? 'text-green-600' : 'text-orange-600'}>
                {isActive ? 'Active' : 'Inactive'}
              </span>
            </p>
          </>
        )}
      </div>
    </div>
  );
};

export default TeacherPage;