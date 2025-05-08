import Link from "next/link";
import { FaUserCircle } from "react-icons/fa"; // Make sure to install react-icons

export default function Home() {
  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Navigation Bar */}
      <nav className="flex justify-between items-center p-4 bg-gray-800">
        <div className="text-xl font-bold">
          <Link href="/" className="hover:text-purple-400 transition-colors">
            RPG-MEGA-SHEET
          </Link>
        </div>

        <div className="flex items-center space-x-6">
          <Link
            href="/sheets"
            className="hover:text-purple-400 transition-colors"
          >
            MY SHEETS
          </Link>
          <Link
            href="/templates"
            className="hover:text-purple-400 transition-colors"
          >
            TEMPLATES
          </Link>
          <Link
            href="/generators"
            className="hover:text-purple-400 transition-colors"
          >
            GENERATORS
          </Link>
          <Link
            href="/login"
            className="text-2xl hover:text-purple-400 transition-colors"
          >
            <FaUserCircle />
          </Link>
        </div>
      </nav>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h1 className="text-4xl font-bold mb-6">Welcome to RPG-MEGA-SHEET</h1>
          <p className="text-xl mb-8">
            Your ultimate companion for managing RPG character sheets,
            templates, and generating content
          </p>

          {/* Feature Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12">
            <div className="bg-gray-800 p-6 rounded-lg hover:bg-gray-700 transition-colors">
              <h2 className="text-2xl font-bold mb-4">Character Sheets</h2>
              <p className="mb-4">
                Create and manage your character sheets for any RPG system
              </p>
              <Link
                href="/sheets"
                className="text-purple-400 hover:text-purple-300"
              >
                Get Started →
              </Link>
            </div>

            <div className="bg-gray-800 p-6 rounded-lg hover:bg-gray-700 transition-colors">
              <h2 className="text-2xl font-bold mb-4">Templates</h2>
              <p className="mb-4">
                Browse and use pre-made templates for popular RPG systems
              </p>
              <Link
                href="/templates"
                className="text-purple-400 hover:text-purple-300"
              >
                Explore Templates →
              </Link>
            </div>

            <div className="bg-gray-800 p-6 rounded-lg hover:bg-gray-700 transition-colors">
              <h2 className="text-2xl font-bold mb-4">Generators</h2>
              <p className="mb-4">
                Generate NPCs, items, quests, and more for your adventures
              </p>
              <Link
                href="/generators"
                className="text-purple-400 hover:text-purple-300"
              >
                Start Generating →
              </Link>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
