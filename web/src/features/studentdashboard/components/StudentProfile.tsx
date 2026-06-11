import React from 'react';

interface Props {
    studentData: { name: string; currency: string; balance: number };
    onLogout: () => void;
}

const StudentProfile: React.FC<Props> = ({ studentData, onLogout }) => (
    <div className="pb-20 md:pb-0 max-w-7xl mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
            <h1 className="text-3xl font-bold text-slate-900">My Profile</h1>
            <p className="text-slate-500">View your account information and parent details</p>
        </div>

        {/* Student Info Card */}
        <div className="bg-white rounded-2xl p-6 shadow-md mb-8 border-t-4 border-t-red-500">
            <div className="flex items-center gap-4">
                <div className="w-20 h-20 bg-red-500 rounded-full flex items-center justify-center text-white font-bold text-2xl">
                    {studentData.name.substring(0, 2).toUpperCase()}
                </div>
                <div>
                    <p className="font-bold text-slate-900 text-xl">{studentData.name}</p>
                    <p className="text-slate-500 text-sm">Student Account • <span className="text-green-500 font-semibold">Active</span></p>
                </div>
            </div>
        </div>

        {/* Personal Information */}
        <div className="bg-white rounded-2xl p-6 shadow-md mb-8 border-t-4 border-t-purple-500">
            <div className="flex items-center gap-2 mb-6">
                <span className="text-2xl">👤</span>
                <h2 className="text-xl font-bold text-slate-900">Personal Information</h2>
            </div>
            <div className="grid gap-4 md:grid-cols-4">
                <div>
                    <p className="text-slate-500 text-sm mb-2">Full Name</p>
                    <input type="text" value={studentData.name} disabled className="w-full bg-slate-50 border border-slate-200 rounded-lg p-3 text-slate-700" />
                </div>
                <div>
                    <p className="text-slate-500 text-sm mb-2">Username</p>
                    <input type="text" value="student@hapo.com" disabled className="w-full bg-slate-50 border border-slate-200 rounded-lg p-3 text-slate-700" />
                </div>
                <div>
                    <p className="text-slate-500 text-sm mb-2">Account Email</p>
                    <input type="email" value="student@hapo.com" disabled className="w-full bg-slate-50 border border-slate-200 rounded-lg p-3 text-slate-700" />
                </div>
                <div>
                    <p className="text-slate-500 text-sm mb-2">Account Password</p>
                    <input type="password" value="••••••••" disabled className="w-full bg-slate-50 border border-slate-200 rounded-lg p-3 text-slate-700" />
                </div>
            </div>
            <div className="grid gap-4 md:grid-cols-2 mt-4">
                <div>
                    <p className="text-slate-500 text-sm mb-2">Account Status</p>
                    <div className="bg-green-100 text-green-700 rounded-lg p-3 text-center font-semibold">
                        Active
                    </div>
                </div>
                <div>
                    <p className="text-slate-500 text-sm mb-2">Account Created</p>
                    <input type="text" value="Date" disabled className="w-full bg-slate-50 border border-slate-200 rounded-lg p-3 text-slate-700" />
                </div>
            </div>
        </div>

        {/* Parent Information */}
        <div className="bg-white rounded-2xl p-6 shadow-md mb-8 border-t-4 border-t-purple-500">
            <div className="flex items-center gap-2 mb-6">
                <span className="text-2xl">👨‍👩‍👧</span>
                <h2 className="text-xl font-bold text-slate-900">Parent Information</h2>
            </div>
            <div className="grid gap-4 md:grid-cols-4">
                <div>
                    <p className="text-slate-500 text-sm mb-2">Parent's Full Name</p>
                    <input type="text" value="Parent Name" disabled className="w-full bg-slate-50 border border-slate-200 rounded-lg p-3 text-slate-700" />
                </div>
                <div>
                    <p className="text-slate-500 text-sm mb-2">Emergency Contact Number</p>
                    <input type="text" value="Phone Number" disabled className="w-full bg-slate-50 border border-slate-200 rounded-lg p-3 text-slate-700" />
                </div>
                <div>
                    <p className="text-slate-500 text-sm mb-2">Parent's Email</p>
                    <input type="email" value="parent@email.com" disabled className="w-full bg-slate-50 border border-slate-200 rounded-lg p-3 text-slate-700" />
                </div>
                <div>
                    <p className="text-slate-500 text-sm mb-2">Relationship</p>
                    <input type="text" value="Parent/Guardian" disabled className="w-full bg-slate-50 border border-slate-200 rounded-lg p-3 text-slate-700" />
                </div>
            </div>
        </div>

        {/* Account Settings */}
        <div className="bg-white rounded-2xl p-6 shadow-md mb-8 border-t-4 border-t-purple-500">
            <div className="flex items-center gap-2 mb-6">
                <span className="text-2xl">⚙️</span>
                <h2 className="text-xl font-bold text-slate-900">Account Settings</h2>
            </div>
            <div className="grid gap-4 md:grid-cols-3">
                <div>
                    <p className="text-slate-500 text-sm mb-2">Weekly Spending Limit</p>
                    <input type="text" value="R100.00" disabled className="w-full bg-slate-50 border border-slate-200 rounded-lg p-3 text-slate-700" />
                </div>
                <div>
                    <p className="text-slate-500 text-sm mb-2">Daily Spending Limit</p>
                    <input type="text" value="R20.00" disabled className="w-full bg-slate-50 border border-slate-200 rounded-lg p-3 text-slate-700" />
                </div>
                <div>
                    <p className="text-slate-500 text-sm mb-2">Current Balance</p>
                    <input type="text" value={`R${studentData.balance}.00`} disabled className="w-full bg-blue-50 border border-blue-200 rounded-lg p-3 text-blue-600 font-bold" />
                </div>
            </div>
        </div>

        {/* Account Security */}
        <div className="bg-yellow-50 border-l-4 border-l-yellow-400 rounded-lg p-6 mb-8">
            <div className="flex items-start gap-3">
                <span className="text-2xl">🛡️</span>
                <div>
                    <h3 className="font-bold text-yellow-800 text-lg mb-2">Account Security</h3>
                    <p className="text-yellow-700 text-sm">Your account information is managed by your parent/guardian. If you need to update any personal information or have security concerns, please contact your parent or guardian.</p>
                </div>
            </div>
        </div>

        <button
            onClick={onLogout}
            className="w-full bg-red-500 text-white py-3 rounded-lg font-semibold hover:bg-red-600 transition"
        >
            Logout
        </button>
    </div>
);

export default StudentProfile;