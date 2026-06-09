import React from 'react';

interface Props {
    studentData: { name: string; currency: string; balance: number };
    onLogout: () => void;
}

const StudentProfile: React.FC<Props> = ({ studentData, onLogout }) => (
    <div className="pb-20 md:pb-0 max-w-7xl mx-auto px-4 py-8">
        <h2 className="text-2xl font-bold mb-4">Profile</h2>
        <div className="bg-white rounded-xl p-6 shadow-sm space-y-4">
            <div className="flex items-center gap-4">
                <div className="w-16 h-16 bg-rose-100 rounded-full flex items-center justify-center">
                    <svg className="w-8 h-8 text-rose-500" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                    </svg>
                </div>
                <div>
                    <p className="font-bold text-slate-800 text-lg">{studentData.name}</p>
                    <p className="text-slate-500 text-sm">Student Account</p>
                </div>
            </div>
            <button
                onClick={onLogout}
                className="w-full bg-rose-500 text-white py-3 rounded-xl font-semibold hover:bg-rose-600 transition"
            >
                Logout
            </button>
        </div>
    </div>
);

export default StudentProfile;