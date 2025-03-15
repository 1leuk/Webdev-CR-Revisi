"use client";

export default function TeamPage() {
  const teamMembers = [
    { name: "Sayyid Faqih", role: "101012330200" },
    { name: "Aurelia Aisya Rachma", role: "101012300251" },
    { name: "Ridho Anugrah Mulyadi", role: "101032300028" },
  ];

  return (
    <div className="min-h-screen bg-gray-900 flex flex-col items-center justify-center px-6 py-16 text-gray-300">
      {/* Title & Description */}
      <h1 className="text-5xl font-extrabold text-white mb-4 tracking-wide animate-fadeIn">
        Meet Our Team
      </h1>
      <p className="text-lg text-gray-400 mb-10 text-center max-w-2xl animate-fadeIn delay-200">
        Terimakasih kepada orang-orang hebat ini untuk pembuatan website
      </p>

      {/* Team Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8 w-full max-w-5xl">
        {teamMembers.map((member, index) => (
          <div
            key={index}
            className="relative bg-gray-800 bg-opacity-80 backdrop-blur-lg border border-gray-700 p-6 rounded-lg shadow-lg text-center transform transition duration-300 hover:scale-105 hover:border-yellow-400"
          >
            {/* Cool Avatar Placeholder */}
            <div className="w-24 h-24 mx-auto mb-4 bg-gray-700 rounded-full flex items-center justify-center text-2xl font-bold text-yellow-400">
              {member.name[0]}
            </div>
            <h2 className="text-2xl font-semibold text-white">{member.name}</h2>
            <p className="text-gray-400">{member.role}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
